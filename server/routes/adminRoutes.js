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
const validate = require('../middleware/validate');
const schemas = require('../validators/schemas');

// Apply protect and admin middleware to all routes
router.use(protect);
router.use(adminOnly);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Products
router.get('/products',                   getAllProducts);
router.get('/products/:id',               getProduct);
router.post('/products',                  validate(schemas.admin.createProduct),      createProduct);
router.put('/products/:id',               validate(schemas.admin.updateProduct),      updateProduct);
router.delete('/products/:id',            deleteProduct);
router.patch('/products/:id/stock',       validate(schemas.admin.updateProductStock), updateProductStock);

// Uploads
router.post('/upload', upload.single('image'), uploadImage);

// Orders
router.get('/orders',                     getAllOrders);
router.get('/orders/:id',                 getOrder);
router.patch('/orders/:id/status',        validate(schemas.admin.updateOrderStatus),  updateOrderStatus);

// Customers
router.get('/customers',                  getAllCustomers);
router.get('/customers/:id',              getCustomer);
router.put('/customers/:id',              validate(schemas.admin.updateCustomer),     updateCustomer);
router.patch('/customers/:id/block',      validate(schemas.admin.blockCustomer),      blockCustomer);

// Analytics
router.get('/analytics/sales',           getSalesAnalytics);

module.exports = router;