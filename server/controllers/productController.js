const { getFirebase } = require('../config/firebase');

const PRODUCTS_COLLECTION = 'products';

// Helper to normalize Firestore doc
const toPlainProduct = (doc) => {
  if (!doc.exists) return null;
  return { id: doc.id, _id: doc.id, ...doc.data() };
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { category, featured, search, page = 1, limit = 20 } = req.query;
    const { db } = getFirebase();
    
    let query = db.collection(PRODUCTS_COLLECTION).where('isActive', '==', true);
    
    if (category) {
      query = query.where('category', '==', category);
    }
    if (featured) {
      query = query.where('isFeatured', '==', true);
    }
    
    // Firestore does not do nice regex searching natively, so we fetch then filter in memory for search
    // In production with larger datasets, use Algolia/Elasticsearch or specifically crafted tokens.
    const snapshot = await query.get();
    let products = snapshot.docs.map(toPlainProduct);
    
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(p => p.name && p.name.toLowerCase().includes(searchLower));
    }
    
    // Sort and paginate in memory since we already fetched
    products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    
    const total = products.length;
    const skip = (Number(page) - 1) * Number(limit);
    const paginatedProducts = products.slice(skip, skip + Number(limit));

    res.json({ 
      products: paginatedProducts, 
      total, 
      page: Number(page), 
      pages: Math.ceil(total / Number(limit)) 
    });
  } catch (err) {
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
    
    // Cloudinary injected this via multer-storage-cloudinary
    if (req.file && req.file.path) {
      productData.image = req.file.path;
    } else if (req.body.image) {
      productData.image = req.body.image; // fallback for string urls
    }

    // Convert string numbers to real numbers
    if (productData.price) productData.price = Number(productData.price);
    if (productData.countInStock) productData.countInStock = Number(productData.countInStock);
    
    const docRef = await db.collection(PRODUCTS_COLLECTION).add(productData);
    
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
    if (updateData.countInStock) updateData.countInStock = Number(updateData.countInStock);
    
    await docRef.update(updateData);
    
    const updated = await docRef.get();
    res.json(toPlainProduct(updated));
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
    const { db, admin } = getFirebase();
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
      reviews: admin.firestore.FieldValue.arrayUnion(review)
    });
    
    res.status(201).json({ message: 'Review added' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, addReview };