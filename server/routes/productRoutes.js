const express = require('express');
const router  = express.Router();
const {
  getProducts, getProduct, createProduct,
  updateProduct, deleteProduct, addReview,
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.get('/',             getProducts);
router.get('/:id',          getProduct);
router.post('/',            protect, adminOnly, upload.single('image'), createProduct);
router.put('/:id',          protect, adminOnly, upload.single('image'), updateProduct);
router.delete('/:id',       protect, adminOnly, deleteProduct);
router.post('/:id/reviews', addReview);

module.exports = router;