const { getFirebase } = require('../config/firebase');
const firebaseStorage = require('../utils/firebaseStorage');

// ==================== DASHBOARD STATS ====================

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const { db } = getFirebase();

    const [usersSnap, ordersSnap, productsSnap] = await Promise.all([
      db.collection('users').where('role', '==', 'customer').get(),
      db.collection('orders').get(),
      db.collection('products').where('isActive', '==', true).get()
    ]);

    const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const totalSales = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const pendingOrders = orders.filter(o => ['placed', 'pending', 'confirmed'].includes(o.status)).length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
    const processingOrders = orders.filter(o => o.status === 'processing').length;
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5);

    res.json({
      stats: {
        totalUsers: usersSnap.size,
        totalOrders: ordersSnap.size,
        totalProducts: productsSnap.size,
        pendingOrders,
        processingOrders,
        deliveredOrders,
        totalSales
      },
      recentOrders,
      lowStockProducts: []
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ message: 'Failed to get dashboard stats', error: error.message });
  }
};

// ==================== PRODUCT MANAGEMENT ====================

// @desc    Get all products (admin view)
// @route   GET /api/admin/products
// @access  Private/Admin
const getAllProducts = async (req, res) => {
  try {
    const { db } = getFirebase();
    const { search = '', category = '', page = 1, limit = 20 } = req.query;

    let query = db.collection('products');
    if (category) query = query.where('category', '==', category);

    const snapshot = await query.get();
    let products = snapshot.docs.map(d => ({ id: d.id, _id: d.id, ...d.data() }));

    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)
      );
    }

    products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    const total = products.length;
    const skip = (Number(page) - 1) * Number(limit);
    const paginated = products.slice(skip, skip + Number(limit));

    res.json({
      products: paginated,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      totalProducts: total
    });
  } catch (error) {
    console.error('Get Products Error:', error);
    res.status(500).json({ message: 'Failed to get products', error: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/admin/products/:id
// @access  Private/Admin
const getProduct = async (req, res) => {
  try {
    const { db } = getFirebase();
    const doc = await db.collection('products').doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ id: doc.id, _id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Get Product Error:', error);
    res.status(500).json({ message: 'Failed to get product', error: error.message });
  }
};

// @desc    Upload product image
// @route   POST /api/admin/products/upload
// @access  Private/Admin
const uploadProductImage = async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({ url: req.file.path });
  } catch (error) {
    console.error('Upload Image Error:', error);
    res.status(500).json({ message: 'Failed to upload image', error: error.message });
  }
};

// @desc    Create new product
// @route   POST /api/admin/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const { db } = getFirebase();
    const { name, description, price, comparePrice, category, images, stock, variants, tags, isActive, isFeatured } = req.body;

    const productData = {
      name,
      description: description || '',
      price: Number(price) || 0,
      comparePrice: Number(comparePrice) || 0,
      category: category || '',
      images: images || [],
      stock: Number(stock) || 0,
      variants: variants || [],
      tags: tags || [],
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured || false,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (productData.images && productData.images.length > 0 && !productData.image) {
      productData.image = productData.images[0];
    }

    const docRef = await db.collection('products').add(productData);
    res.status(201).json({ message: 'Product created successfully', product: { id: docRef.id, _id: docRef.id, ...productData } });
  } catch (error) {
    console.error('Create Product Error:', error);
    res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const { db } = getFirebase();
    const docRef = db.collection('products').doc(req.params.id);
    const existing = await docRef.get();

    if (!existing.exists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updateData = { ...req.body, updatedAt: new Date().toISOString() };
    
    if (updateData.price) updateData.price = Number(updateData.price);
    if (updateData.comparePrice) updateData.comparePrice = Number(updateData.comparePrice);
    if (updateData.stock) updateData.stock = Number(updateData.stock);

    if (updateData.images && updateData.images.length > 0 && !updateData.image) {
      updateData.image = updateData.images[0];
    }

    await docRef.update(updateData);
    const updated = await docRef.get();

    res.json({ message: 'Product updated successfully', product: { id: updated.id, _id: updated.id, ...updated.data() } });
  } catch (error) {
    console.error('Update Product Error:', error);
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
};

// @desc    Delete product (soft delete)
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const { db } = getFirebase();
    const docRef = db.collection('products').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await docRef.update({ isActive: false, updatedAt: new Date().toISOString() });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete Product Error:', error);
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
};

// @desc    Update product stock
// @route   PATCH /api/admin/products/:id/stock
// @access  Private/Admin
const updateProductStock = async (req, res) => {
  try {
    const { db } = getFirebase();
    const { stock, operation = 'set' } = req.body;

    const docRef = db.collection('products').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const currentStock = doc.data().stock || 0;
    let newStock;

    if (operation === 'increase') newStock = currentStock + parseInt(stock);
    else if (operation === 'decrease') newStock = Math.max(0, currentStock - parseInt(stock));
    else newStock = parseInt(stock);

    await docRef.update({ stock: newStock, updatedAt: new Date().toISOString() });
    const updated = await docRef.get();

    res.json({ message: 'Stock updated successfully', product: { id: updated.id, ...updated.data() } });
  } catch (error) {
    console.error('Update Stock Error:', error);
    res.status(500).json({ message: 'Failed to update stock', error: error.message });
  }
};

// ==================== ORDER MANAGEMENT ====================

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const { db } = getFirebase();
    const { status = '', page = 1, limit = 20 } = req.query;

    let query = db.collection('orders').orderBy('createdAt', 'desc');
    const snapshot = await query.get();
    let orders = snapshot.docs.map(d => ({ id: d.id, _id: d.id, ...d.data() }));

    if (status) {
      orders = orders.filter(o => o.status === status);
    }

    const total = orders.length;
    const skip = (Number(page) - 1) * Number(limit);
    const paginated = orders.slice(skip, skip + Number(limit));

    res.json({
      orders: paginated,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      totalOrders: total
    });
  } catch (error) {
    console.error('Get Orders Error:', error);
    res.status(500).json({ message: 'Failed to get orders', error: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/admin/orders/:id
// @access  Private/Admin
const getOrder = async (req, res) => {
  try {
    const { db } = getFirebase();
    const doc = await db.collection('orders').doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ id: doc.id, _id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Get Order Error:', error);
    res.status(500).json({ message: 'Failed to get order', error: error.message });
  }
};

// @desc    Update order status
// @route   PATCH /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, notes } = req.body;
    const { db, admin } = getFirebase();

    const docRef = db.collection('orders').doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const updateData = { status, updatedAt: new Date().toISOString() };
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (notes) {
      updateData.adminNotes = notes;
      updateData.statusHistory = admin.firestore.FieldValue.arrayUnion({
        status,
        note: notes,
        date: new Date().toISOString()
      });
    }

    await docRef.update(updateData);
    const updated = await docRef.get();

    res.json({ message: 'Order status updated successfully', order: { id: updated.id, _id: updated.id, ...updated.data() } });
  } catch (error) {
    console.error('Update Order Status Error:', error);
    res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
};

// ==================== CUSTOMER MANAGEMENT ====================

// @desc    Get all customers
// @route   GET /api/admin/customers
// @access  Private/Admin
const getAllCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', isActive } = req.query;

    let customers = (await firebaseStorage.getAllUsers()).filter(u => (u.role || 'customer') === 'customer');

    if (search) {
      const q = String(search).toLowerCase();
      customers = customers.filter(u =>
        String(u.name || '').toLowerCase().includes(q) ||
        String(u.phone || '').toLowerCase().includes(q) ||
        String(u.email || '').toLowerCase().includes(q)
      );
    }

    if (isActive !== undefined) {
      const active = isActive === 'true';
      customers = customers.filter(u => (u.isActive !== false) === active);
    }

    customers.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    const total = customers.length;
    const skip = (Number(page) - 1) * Number(limit);
    const paginated = customers.slice(skip, skip + Number(limit));

    res.json({
      customers: paginated,
      totalPages: Math.max(1, Math.ceil(total / Number(limit))),
      currentPage: Number(page),
      totalCustomers: total
    });
  } catch (error) {
    console.error('Get Customers Error:', error);
    res.status(500).json({ message: 'Failed to get customers', error: error.message });
  }
};

// @desc    Get single customer
// @route   GET /api/admin/customers/:id
// @access  Private/Admin
const getCustomer = async (req, res) => {
  try {
    const customer = await firebaseStorage.findUserById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    console.error('Get Customer Error:', error);
    res.status(500).json({ message: 'Failed to get customer', error: error.message });
  }
};

// @desc    Update customer
// @route   PUT /api/admin/customers/:id
// @access  Private/Admin
const updateCustomer = async (req, res) => {
  try {
    const { isActive, address } = req.body;
    const customer = await firebaseStorage.updateUser(req.params.id, { isActive, address });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({ message: 'Customer updated successfully', customer });
  } catch (error) {
    console.error('Update Customer Error:', error);
    res.status(500).json({ message: 'Failed to update customer', error: error.message });
  }
};

// @desc    Block/Unblock customer
// @route   PATCH /api/admin/customers/:id/block
// @access  Private/Admin
const blockCustomer = async (req, res) => {
  try {
    const { isBlocked } = req.body;
    const customer = await firebaseStorage.updateUser(req.params.id, { isActive: !isBlocked });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({
      message: `Customer ${isBlocked ? 'unblocked' : 'blocked'} successfully`,
      customer
    });
  } catch (error) {
    console.error('Block Customer Error:', error);
    res.status(500).json({ message: 'Failed to update customer', error: error.message });
  }
};

// ==================== ANALYTICS ====================

// @desc    Get sales analytics
// @route   GET /api/admin/analytics/sales
// @access  Private/Admin
const getSalesAnalytics = async (req, res) => {
  try {
    const { db } = getFirebase();
    const { period = '7days' } = req.query;

    const now = new Date();
    const daysMap = { '7days': 7, '30days': 30, '90days': 90 };
    const days = daysMap[period] || 7;
    const since = new Date(now - days * 24 * 60 * 60 * 1000).toISOString();

    const snapshot = await db.collection('orders').where('createdAt', '>=', since).get();
    const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

    const totalSales = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    const statusBreakdown = {
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length
    };

    // Aggregate daily sales in memory
    const dailySalesMap = {};
    orders.forEach(o => {
      const day = (o.createdAt || '').slice(0, 10);
      if (!dailySalesMap[day]) dailySalesMap[day] = { _id: day, total: 0, count: 0 };
      dailySalesMap[day].total += Number(o.total || 0);
      dailySalesMap[day].count += 1;
    });
    const dailySales = Object.values(dailySalesMap).sort((a, b) => a._id.localeCompare(b._id));

    res.json({ totalSales, totalOrders, avgOrderValue, statusBreakdown, dailySales, period });
  } catch (error) {
    console.error('Sales Analytics Error:', error);
    res.status(500).json({ message: 'Failed to get sales analytics', error: error.message });
  }
};

// @desc    Upload image to Cloudinary
// @route   POST /api/admin/upload
// @access  Private/Admin
const uploadImage = async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: 'No image uploaded' });
    }
    res.json({ url: req.file.path });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: 'Failed to upload image', error: error.message });
  }
};

module.exports = {
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
};