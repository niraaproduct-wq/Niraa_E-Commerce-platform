const { getFirebase } = require('../config/firebase');
const logger = require('../utils/logger');
const cacheService = require('../services/cache');


const PRODUCTS_COLLECTION = 'products';

// Helper to normalize Firestore doc
const toPlainProduct = (doc) => {
  if (!doc.exists) return null;
  const data = doc.data();
  return { 
    id: doc.id, 
    _id: doc.id, 
    ...data,
    stock: data.stock !== undefined ? data.stock : (data.countInStock || 0)
  };
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { category, featured, search, page = 1, limit = 20 } = req.query;
    const { db } = getFirebase();
    
    const limitNum = Number(limit);
    const pageNum = Number(page);
    const skip = (pageNum - 1) * limitNum;

    // Cache hit interception lookup
    const cacheKey = `products:cat_${category || 'all'}:feat_${featured || 'all'}:search_${search || 'none'}:page_${page}:limit_${limit}`;
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      logger.info(`[Products] Cache HIT for key: ${cacheKey}`);
      return res.json(cachedData);
    }

    let query = db.collection(PRODUCTS_COLLECTION).where('isActive', '==', true);
    
    if (category) {
      query = query.where('category', '==', category);
    }
    if (featured) {
      query = query.where('isFeatured', '==', true);
    }

    // Try fetching with server-side ordering first
    let total;
    let products;

    try {
      const orderedQuery = query.orderBy('createdAt', 'desc');

      if (search) {
        const snapshot = await orderedQuery.get();
        let list = snapshot.docs.map(toPlainProduct).filter(Boolean);
        const searchLower = search.toLowerCase();
        list = list.filter(p => 
          (p.name && p.name.toLowerCase().includes(searchLower)) ||
          (p.description && p.description.toLowerCase().includes(searchLower))
        );
        total = list.length;
        products = list.slice(skip, skip + limitNum);
      } else {
        const countSnapshot = await orderedQuery.count().get();
        total = countSnapshot.data().count;

        const snapshot = await orderedQuery.offset(skip).limit(limitNum).get();
        products = snapshot.docs.map(toPlainProduct).filter(Boolean);
      }
    } catch (err) {
      if (err.message && (err.message.includes('requires an index') || err.message.includes('FAILED_PRECONDITION'))) {
        logger.warn('[Products] Server-side orderBy failed (likely missing composite index). Falling back to safe in-memory sorting.', { error: err.message });
        
        const snapshot = await query.get();
        let list = snapshot.docs.map(toPlainProduct).filter(Boolean);
        
        if (search) {
          const searchLower = search.toLowerCase();
          list = list.filter(p => 
            (p.name && p.name.toLowerCase().includes(searchLower)) ||
            (p.description && p.description.toLowerCase().includes(searchLower))
          );
        }
        
        // Sort in memory
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        
        total = list.length;
        products = list.slice(skip, skip + limitNum);
      } else {
        throw err;
      }
    }

    const responsePayload = { 
      products, 
      total, 
      page: pageNum, 
      pages: Math.ceil(total / limitNum) 
    };

    // Store in cache for 5 minutes (300 seconds)
    await cacheService.set(cacheKey, responsePayload, 300);
    res.json(responsePayload);
  } catch (err) {
    logger.error('Get Products Error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get single product by id
// @route   GET /api/products/:id
// @access  Public
const getProduct = async (req, res) => {
  try {
    const { db } = getFirebase();
    let productDoc = await db.collection(PRODUCTS_COLLECTION).doc(req.params.id).get();
    let product = toPlainProduct(productDoc);
    
    // Fallback: search by slug if ID lookup yields no active product
    if (!product || !product.isActive) {
      const slugQuery = await db.collection(PRODUCTS_COLLECTION)
        .where('slug', '==', req.params.id)
        .where('isActive', '==', true)
        .limit(1)
        .get();
      
      if (!slugQuery.empty) {
        product = toPlainProduct(slugQuery.docs[0]);
      }
    }
    
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Admin
const createProduct = async (req, res) => {
  try {
    const { db } = getFirebase();
    
    const productData = { ...req.body };
    productData.isActive = true;
    productData.createdAt = new Date().toISOString();
    productData.productType = productData.productType || 'single';
    productData.size = productData.size || 'NA';
    
    // Advanced Smart SKU Generator
    if (!productData.sku || !productData.barcode) {
      const brand = 'NIR';
      const catCode = (productData.category || 'GEN').toUpperCase().replace(/-/g, '').slice(0, 3);
      const prdCode = (productData.name || 'PRD').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3);
      const sizeCode = productData.size.toUpperCase().replace(/\s/g, '');
      const typeCode = productData.productType === 'combo' ? 'C' : (productData.productType === 'bulk' ? 'B' : 'S');
      
      const generatedSKU = `${brand}-${catCode}-${prdCode}-${sizeCode}-${typeCode}`;
      productData.sku = productData.sku || generatedSKU;
      productData.barcode = productData.barcode || generatedSKU;
    }
    
    // Cloudinary injected this via multer-storage-cloudinary
    if (req.file && req.file.path) {
      productData.image = req.file.path;
    } else if (req.body.image) {
      productData.image = req.body.image; // fallback for string urls
    }

    // Convert string numbers to real numbers
    if (productData.price) productData.price = Number(productData.price);
    if (productData.stock) productData.stock = Number(productData.stock);
    
    const docRef = await db.collection(PRODUCTS_COLLECTION).add(productData);
    
    // Invalidate product cache
    await cacheService.invalidatePattern('products:*');
    
    res.status(201).json({ id: docRef.id, ...productData });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = async (req, res) => {
  try {
    const { db } = getFirebase();
    const docRef = db.collection(PRODUCTS_COLLECTION).doc(req.params.id);
    
    const existing = await docRef.get();
    if (!existing.exists) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const updateData = { ...req.body };
    updateData.updatedAt = new Date().toISOString();
    
    // If a new file was uploaded, update the image field
    if (req.file && req.file.path) {
      updateData.image = req.file.path;
    }

    if (updateData.price) updateData.price = Number(updateData.price);
    if (updateData.stock) updateData.stock = Number(updateData.stock);
    
    await docRef.update(updateData);
    
    // Invalidate product cache
    await cacheService.invalidatePattern('products:*');
    
    const updated = await docRef.get();
    const product = toPlainProduct(updated);
    
    // Notify clients
    const { publishEvent } = require('../utils/realtimeHub');
    publishEvent('products.changed', { type: 'updated', productId: product._id, product });
    
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Delete product (soft delete)
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = async (req, res) => {
  try {
    const { db } = getFirebase();
    const docRef = db.collection(PRODUCTS_COLLECTION).doc(req.params.id);
    await docRef.update({ isActive: false, updatedAt: new Date().toISOString() });
    
    // Invalidate product cache
    await cacheService.invalidatePattern('products:*');
    
    res.json({ message: 'Product removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Add review
// @route   POST /api/products/:id/reviews
// @access  Public
const addReview = async (req, res) => {
  try {
    const { db, FieldValue } = getFirebase();
    const { name, rating, comment } = req.body;
    
    const docRef = db.collection(PRODUCTS_COLLECTION).doc(req.params.id);
    const existing = await docRef.get();
    
    if (!existing.exists) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const review = {
      name,
      rating: Number(rating),
      comment,
      createdAt: new Date().toISOString()
    };
    
    // Use Firestore arrayUnion
    await docRef.update({
      reviews: FieldValue.arrayUnion(review)
    });
    
    // Invalidate product cache
    await cacheService.invalidatePattern('products:*');
    
    res.status(201).json({ message: 'Review added' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, addReview };