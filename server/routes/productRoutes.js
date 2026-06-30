const express = require('express');
const router  = express.Router();
const {
  getProducts, getProduct, createProduct,
  updateProduct, deleteProduct, addReview, getProductByBarcode
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const schemas = require('../validators/schemas');
const { apiLimiter } = require('../middleware/security');

// Public routes — rate limited to prevent scraping
router.get('/', apiLimiter, getProducts);
router.get('/barcode/:barcode', apiLimiter, getProductByBarcode);
router.get('/:id', apiLimiter, getProduct);

// Admin-only write routes
router.post('/', protect, adminOnly, upload.single('image'), createProduct);
router.put('/:id', protect, adminOnly, upload.single('image'), updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

// Public review submission — validate input
router.post('/:id/reviews', protect, validate(schemas.products.addReview), addReview);

module.exports = router;