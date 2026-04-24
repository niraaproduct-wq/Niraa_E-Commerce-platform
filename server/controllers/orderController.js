const { getFirebase } = require('../config/firebase');
const { publishEvent } = require('../utils/realtimeHub');

const ORDERS_COLLECTION = 'orders';

const toPlainOrder = (doc) => {
  if (!doc.exists) return null;
  return { id: doc.id, _id: doc.id, ...doc.data() };
};

// @desc    Place new order (guest checkout)
const placeOrder = async (req, res) => {
  try {
    const { db } = getFirebase();
    
    const orderData = {
      ...req.body,
      status: 'placed',
      paymentStatus: req.body.paymentMethod === 'upi' ? 'pending' : 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection(ORDERS_COLLECTION).add(orderData);
    
    const savedOrder = { id: docRef.id, _id: docRef.id, ...orderData };
    
    publishEvent('orders.changed', { type: 'created', orderId: savedOrder._id });
    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get all orders (admin)
const getAllOrders = async (req, res) => {
  try {
    const { db } = getFirebase();
    const snapshot = await db.collection(ORDERS_COLLECTION).orderBy('createdAt', 'desc').get();
    
    const orders = snapshot.docs.map(toPlainOrder);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get single order
const getOrder = async (req, res) => {
  try {
    const { db } = getFirebase();
    const doc = await db.collection(ORDERS_COLLECTION).doc(req.params.id).get();
    
    if (!doc.exists) return res.status(404).json({ message: 'Order not found' });
    
    res.json(toPlainOrder(doc));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update order status (admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { db } = getFirebase();
    const docRef = db.collection(ORDERS_COLLECTION).doc(req.params.id);
    
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ message: 'Order not found' });
    
    await docRef.update({ 
      status,
      updatedAt: new Date().toISOString()
    });
    
    const updated = await docRef.get();
    const updatedOrder = toPlainOrder(updated);

    publishEvent('orders.changed', { type: 'status_updated', orderId: updatedOrder._id, status: updatedOrder.status });
    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get order stats (admin)
const getOrderStats = async (req, res) => {
  try {
    const { db } = getFirebase();
    const snapshot = await db.collection(ORDERS_COLLECTION).get();
    
    const statsMap = {};
    snapshot.forEach(doc => {
      const o = doc.data();
      const key = o.status || 'placed';
      if (!statsMap[key]) {
        statsMap[key] = { _id: key, count: 0, totalAmount: 0 };
      }
      statsMap[key].count += 1;
      statsMap[key].totalAmount += Number(o.total || 0);
    });
    
    res.json(Object.values(statsMap));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get orders for current user
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const { db } = getFirebase();
    
    // We use the authenticated user's ID to look up their phone number
    // Then we query orders by customerPhone since placeOrder saves customerPhone
    const userSnapshot = await db.collection('users').doc(req.user.id).get();
    
    if (!userSnapshot.exists) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userData = userSnapshot.data();
    
    const snapshot = await db.collection(ORDERS_COLLECTION)
      .where('customerPhone', '==', userData.phone)
      .get();
      
    const orders = snapshot.docs.map(toPlainOrder);
    
    // Sort client-side if needed since Firestore requires composite index for where + orderBy
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(orders);
  } catch (err) {
    console.error('Get My Orders Error:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  placeOrder,
  getAllOrders,
  getOrder,
  updateOrderStatus,
  getOrderStats,
  getMyOrders,
};
