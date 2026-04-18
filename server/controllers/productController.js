const Product = require('../models/Product');
const mockProducts = require('../utils/mockProducts');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    // FORCE MOCK DATA FOR DEMO PURPOSES
    const demoMode = true; 
    if (demoMode || process.env.DB_CONNECTED === 'false') {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || mockProducts.length;
      const start = (page - 1) * limit;
      // Inject fake _id for react keys
      const paged = mockProducts.slice(start, start + limit).map((p, idx) => ({ ...p, _id: p.slug || String(idx) }));
      return res.json({ products: paged, total: mockProducts.length, page, pages: Math.ceil(mockProducts.length / limit) });
    }
    const { category, featured, search, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };

    if (category)  query.category  = category;
    if (featured)  query.isFeatured = true;
    if (search)    query.name = { $regex: search, $options: 'i' };

    const skip  = (page - 1) * limit;
    const total = await Product.countDocuments(query);
    const products = await Product.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get single product by slug
// @route   GET /api/products/:slug
// @access  Public
const getProduct = async (req, res) => {
  try {
    const demoMode = true;
    if (demoMode || process.env.DB_CONNECTED === 'false') {
      const p = mockProducts.find((m) => m.slug === req.params.slug);
      if (!p) return res.status(404).json({ message: 'Product not found' });
      return res.json({ ...p, _id: p.slug });
    }
    const product = await Product.findOne({ slug: req.params.slug, isActive: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
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
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
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
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });
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
    const { name, rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.reviews.push({ name, rating: Number(rating), comment });
    await product.save();
    res.status(201).json({ message: 'Review added', rating: product.rating, numReviews: product.numReviews });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, addReview };