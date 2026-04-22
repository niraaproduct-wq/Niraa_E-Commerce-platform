const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
  getAllOrders,
  getOrder,
  updateOrderStatus,
  getAllCustomers,
  getCustomer,
  updateCustomer,
  blockCustomer,
  getSalesAnalytics,
  uploadImage
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Apply protect and admin middleware to all routes
router.use(protect);
router.use(adminOnly);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Products
router.get('/products', getAllProducts);
router.get('/products/:id', getProduct);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.patch('/products/:id/stock', updateProductStock);

// Uploads
router.post('/upload', upload.single('image'), uploadImage);

// Orders
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrder);
router.patch('/orders/:id/status', updateOrderStatus);

// Customers
router.get('/customers', getAllCustomers);
router.get('/customers/:id', getCustomer);
router.put('/customers/:id', updateCustomer);
router.patch('/customers/:id/block', blockCustomer);

// Analytics
router.get('/analytics/sales', getSalesAnalytics);

module.exports = router;