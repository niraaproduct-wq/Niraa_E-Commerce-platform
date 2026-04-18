const express = require('express');
const router  = express.Router();
const {
  getProducts, getProduct, createProduct,
  updateProduct, deleteProduct, addReview,
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/',             getProducts);
router.get('/:slug',        getProduct);
router.post('/',            protect, adminOnly, createProduct);
router.put('/:id',          protect, adminOnly, updateProduct);
router.delete('/:id',       protect, adminOnly, deleteProduct);
router.post('/:id/reviews', addReview);

module.exports = router;