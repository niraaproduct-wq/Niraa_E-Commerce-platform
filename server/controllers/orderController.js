const jwt = require('jsonwebtoken');
const { getFirebase } = require('../config/firebase');
const { publishEvent } = require('../utils/realtimeHub');
const logger = require('../utils/logger');

const ORDERS_COLLECTION = 'orders';

const toPlainOrder = (doc) => {
  if (!doc.exists) return null;
  return { id: doc.id, _id: doc.id, ...doc.data() };
};

// @desc    Place new order (guest or authenticated)
const placeOrder = async (req, res) => {
  try {
    const { db } = getFirebase();
    const { items } = req.body;
    
    // Check if user is authenticated (optional)
    let userId = null;
    const authHeader = req.headers.authorization;
    const token = req.cookies?.niraa_token || (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded) userId = decoded.id;
      } catch (e) {
        // Ignore invalid token for guest checkout
      }
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    const orderId = await db.runTransaction(async (transaction) => {
      // 1. Read all required product documents first
      const productDocsMap = {};
      const uniqueProductIds = [...new Set(items.map(item => item.product))];
      
      for (const prodId of uniqueProductIds) {
        const productRef = db.collection('products').doc(prodId);
        const productDoc = await transaction.get(productRef);
        if (!productDoc.exists) {
          const itemName = items.find(it => it.product === prodId)?.name || 'Unknown';
          throw new Error(`Product "${itemName}" not found`);
        }
        productDocsMap[prodId] = { ref: productRef, data: productDoc.data() };
      }

      // 2. Perform validations and prepare data
      for (const item of items) {
        const productInfo = productDocsMap[item.product];
        const productData = productInfo.data;
        
        if (item.variantId) {
          const variantIndex = productData.variants?.findIndex(v => v.variantId === item.variantId);
          if (variantIndex === -1 || variantIndex === undefined) {
            throw new Error(`Variant for product "${item.name}" not found`);
          }
          
          const variant = productData.variants[variantIndex];
          const stock = Number(variant.stockQuantity || 0);
          if (stock < item.quantity) {
            throw new Error(`Insufficient stock for "${item.name}" (${item.variantDesc}). Only ${stock} left.`);
          }
          
          // Update variant stock in our local map object
          productData.variants[variantIndex].stockQuantity = stock - item.quantity;
        } else {
          const stock = Number(productData.stock || 0);
          if (stock < item.quantity) {
            throw new Error(`Insufficient stock for "${item.name}". Only ${stock} left.`);
          }
          // Update base product stock in our local map object
          productData.stock = stock - item.quantity;
        }
      }

      // 3. Execute all updates after all reads are finished
      for (const prodId in productDocsMap) {
        const info = productDocsMap[prodId];
        transaction.update(info.ref, { 
          stock: info.data.stock !== undefined ? info.data.stock : 0, 
          variants: info.data.variants || [],
          updatedAt: new Date().toISOString() 
        });
      }

      // 4. Create the order
      const isPosOrder = (req.body.customerType === 'walkin' || req.body.source === 'pos');
      const orderData = {
        ...req.body,
        userId: userId || req.body.userId || null,
        status: req.body.status ?? (isPosOrder ? 'delivered' : 'placed'),
        paymentStatus: req.body.paymentStatus ?? (isPosOrder ? 'paid' : 'pending'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const orderRef = db.collection(ORDERS_COLLECTION).doc();
      transaction.set(orderRef, orderData);
      return orderRef.id;
    });

    // Read back saved order document so the client receives accurate stored values
    const orderDoc = await db.collection(ORDERS_COLLECTION).doc(orderId).get();
    const savedOrder = toPlainOrder(orderDoc);
    
    // Notify clients about the new order
    publishEvent('orders.changed', { type: 'created', orderId: savedOrder._id });
    
    // Notify clients about potential stock changes
    publishEvent('products.changed', { type: 'batch_update' });
    
    // Telemetry: Log business event
    const businessLogger = require('../utils/businessLogger');
    businessLogger.logOrderCreated(savedOrder._id, savedOrder.userId || 'guest', savedOrder.total || 0, savedOrder.items?.length || 0);
    
    res.status(201).json(savedOrder);
  } catch (err) {
    logger.error('Place Order Error:', err.message);
    
    // Telemetry: Log failure event
    const businessLogger = require('../utils/businessLogger');
    businessLogger.logOrderFailed(req.body.id || 'draft', req.body.userId || 'guest', err.message);
    
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get all orders (admin)
const getAllOrders = async (req, res) => {
  try {
    const { db } = getFirebase();
    const { page, limit } = req.query;

    // If page or limit is explicitly provided, return paginated object
    if (page || limit) {
      const pageNum = Number(page || 1);
      const limitNum = Number(limit || 10);
      const skip = (pageNum - 1) * limitNum;

      let baseQuery = db.collection(ORDERS_COLLECTION);
      let orders;
      let total;

      try {
        const orderedQuery = baseQuery.orderBy('createdAt', 'desc');
        const countSnapshot = await orderedQuery.count().get();
        total = countSnapshot.data().count;

        const snapshot = await orderedQuery.offset(skip).limit(limitNum).get();
        orders = snapshot.docs.map(toPlainOrder);
      } catch (indexError) {
        logger.warn('[Orders] Server-side ordered query failed (likely missing composite index). Falling back to safe in-memory sorting.', { error: indexError.message });
        const snapshot = await baseQuery.get();
        let allOrders = snapshot.docs.map(toPlainOrder);
        allOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        total = allOrders.length;
        orders = allOrders.slice(skip, skip + limitNum);
      }

      return res.json({
        orders,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum)
      });
    }

    // Default path (backwards compatible for Admin Dashboard/POS): return plain array of all orders
    let orders;
    try {
      const snapshot = await db.collection(ORDERS_COLLECTION)
        .orderBy('createdAt', 'desc')
        .get();
      orders = snapshot.docs.map(toPlainOrder);
    } catch (indexError) {
      logger.warn('[Orders] Server-side orderBy failed. Fetching raw list and sorting in memory.', { error: indexError.message });
      const snapshot = await db.collection(ORDERS_COLLECTION).get();
      orders = snapshot.docs.map(toPlainOrder);
      orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    res.json(orders);
  } catch (err) {
    logger.error('Get All Orders Error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private (owner or admin)
const getOrder = async (req, res) => {
  try {
    const { db } = getFirebase();
    const doc = await db.collection(ORDERS_COLLECTION).doc(req.params.id).get();
    
    if (!doc.exists) return res.status(404).json({ message: 'Order not found' });
    
    const order = toPlainOrder(doc);

    // Security check: Only admin or the customer who placed the order can see it
    const isAdmin = req.user?.role === 'admin';
    const isOwner = req.user && (
      order.customerPhone === req.user.phone ||
      order.userId === req.user.id
    );

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Access denied. You can only view your own orders.' });
    }
    
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update order status (admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const { db } = getFirebase();
    const docRef = db.collection(ORDERS_COLLECTION).doc(req.params.id);
    
    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);
      if (!doc.exists) throw new Error('Order not found');
      
      const order = doc.data();
      const oldStatus = order.status;

      // Restore stock if status changes TO cancelled (from any other status except cancelled)
      if (status === 'cancelled' && oldStatus !== 'cancelled') {
        const items = order.items || [];
        const productDocsMap = {};
        const uniqueProductIds = [...new Set(items.map(item => item.product))];

        // 1. READ ALL PRODUCT DOCS FIRST
        for (const prodId of uniqueProductIds) {
          const productRef = db.collection('products').doc(prodId);
          const productDoc = await transaction.get(productRef);
          if (productDoc.exists) {
            productDocsMap[prodId] = { ref: productRef, data: productDoc.data() };
          }
        }

        // 2. CALCULATE NEW STOCK VALUES
        for (const item of items) {
          const productInfo = productDocsMap[item.product];
          if (!productInfo) continue;

          const productData = productInfo.data;
          if (item.variantId) {
            const variantIndex = productData.variants?.findIndex(v => v.variantId === item.variantId);
            if (variantIndex !== -1 && variantIndex !== undefined) {
              productData.variants[variantIndex].stockQuantity = (Number(productData.variants[variantIndex].stockQuantity) || 0) + item.quantity;
            }
          } else {
            productData.stock = (Number(productData.stock) || 0) + item.quantity;
          }
        }

        // 3. QUEUE ALL WRITES
        for (const prodId in productDocsMap) {
          const info = productDocsMap[prodId];
          transaction.update(info.ref, {
            stock: info.data.stock !== undefined ? info.data.stock : 0,
            variants: info.data.variants || [],
            updatedAt: new Date().toISOString()
          });
        }
      }

      const updates = { 
        updatedAt: new Date().toISOString()
      };
      if (status) updates.status = status;
      if (paymentStatus) updates.paymentStatus = paymentStatus;
      if (req.body.refundStatus) updates.refundStatus = req.body.refundStatus;

      transaction.update(docRef, updates);
    });
    
    const updated = await docRef.get();
    const updatedOrder = toPlainOrder(updated);

    publishEvent('orders.changed', { type: 'status_updated', orderId: updatedOrder._id, status: updatedOrder.status });
    
    // Notify clients about stock restoration
    if (status === 'cancelled') {
      publishEvent('products.changed', { type: 'batch_update' });
    }
    
    res.json(updatedOrder);
  } catch (err) {
    logger.error('Update Order Status Error:', err.message);
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
    const { page = 1, limit = 10 } = req.query;
    const limitNum = Number(limit);
    const skip = (Number(page) - 1) * limitNum;
    
    const userData = req.user;
    
    if (!userData) {
      logger.warn('[Orders] getMyOrders called without user data');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userId = userData.id;
    const userPhone = userData.phone ? String(userData.phone).replace(/\D/g, '').slice(-10) : null;
    
    logger.debug(`[Orders] Fetching orders for User: ${userId}, Phone: ${userPhone}`);

    // Build targeted index-based queries to search by userId, email, or phone
    const queryPromises = [];
    
    if (userId) {
      queryPromises.push(db.collection(ORDERS_COLLECTION).where('userId', '==', String(userId)).get());
    }
    
    const userEmail = userData.email ? String(userData.email).toLowerCase().trim() : null;
    if (userEmail) {
      queryPromises.push(db.collection(ORDERS_COLLECTION).where('customerEmail', '==', userEmail).get());
      if (userData.email !== userEmail) {
        queryPromises.push(db.collection(ORDERS_COLLECTION).where('customerEmail', '==', userData.email).get());
      }
    }
    
    if (userData.phone) {
      const rawPhone = String(userData.phone).trim();
      queryPromises.push(db.collection(ORDERS_COLLECTION).where('customerPhone', '==', rawPhone).get());
      
      const tenDigit = rawPhone.replace(/\D/g, '').slice(-10);
      if (tenDigit && tenDigit !== rawPhone) {
        queryPromises.push(db.collection(ORDERS_COLLECTION).where('customerPhone', '==', tenDigit).get());
        queryPromises.push(db.collection(ORDERS_COLLECTION).where('customerPhone', '==', `+91${tenDigit}`).get());
      }
    }

    // Execute queries in parallel
    const snapshots = await Promise.all(queryPromises);
    const ordersMap = new Map();
    
    for (const snap of snapshots) {
      for (const doc of snap.docs) {
        const plainOrder = toPlainOrder(doc);
        if (plainOrder) {
          ordersMap.set(doc.id, plainOrder);
        }
      }
    }

    let orders = Array.from(ordersMap.values());

    // Triple-check validation to completely secure data against cross-user leakage
    orders = orders.filter(o => {
      if (!o) return false;
      
      // 1. Match by userId
      const orderUserId = o.userId || o.customerId || o.user || o.uid || null;
      if (orderUserId && userId && String(orderUserId) === String(userId)) return true;
      
      // 2. Match by email
      const orderEmail = o.customerEmail ? String(o.customerEmail).toLowerCase().trim() : null;
      if (userEmail && orderEmail && userEmail === orderEmail) return true;
      
      // 3. Match by phone
      if (userPhone && o.customerPhone) {
        const orderPhone = String(o.customerPhone).replace(/\D/g, '').slice(-10);
        const match = orderPhone === userPhone;
        if (match) logger.debug(`[Orders] Phone match found for order ${o.id}`);
        return match;
      }
      
      return false;
    });

    logger.info(`[Orders] Found ${orders.length} orders for User: ${userId} (Phone: ${userPhone})`);

    // Sort in memory (descending by createdAt)
    orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    const total = orders.length;
    const paginated = orders.slice(skip, skip + limitNum);
    
    res.json({
      orders: paginated,
      total,
      page: Number(page),
      pages: Math.ceil(total / limitNum)
    });
  } catch (err) {
    logger.error('Get My Orders Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Cancel an order (customer)
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelMyOrder = async (req, res) => {
  try {
    const { db } = getFirebase();
    const orderId = req.params.id;
    const userId = req.user.id;
    const { reasonKey, reasonText } = req.body;

    // 1. Verify user exists
    const userSnapshot = await db.collection('users').doc(userId).get();
    if (!userSnapshot.exists) {
      return res.status(404).json({ message: 'User not found' });
    }
    const userPhone = userSnapshot.data().phone;

    const orderRef = db.collection(ORDERS_COLLECTION).doc(orderId);
    
    const result = await db.runTransaction(async (transaction) => {
      const orderDoc = await transaction.get(orderRef);
      if (!orderDoc.exists) throw new Error('Order not found');
      
      const order = orderDoc.data();

      // Security: Ensure order belongs to the user
      if (order.customerPhone !== userPhone) {
        throw new Error('Unauthorized to cancel this order');
      }

      const status = order.status || 'placed';

      if (['placed', 'confirmed', 'packed'].includes(status)) {
        // Instant cancellation allowed
        const items = order.items || [];
        const productDocsMap = {};
        const uniqueProductIds = [...new Set(items.map(item => item.product))];

        for (const prodId of uniqueProductIds) {
          const productRef = db.collection('products').doc(prodId);
          const productDoc = await transaction.get(productRef);
          if (productDoc.exists) {
            productDocsMap[prodId] = { ref: productRef, data: productDoc.data() };
          }
        }

        for (const item of items) {
          const productInfo = productDocsMap[item.product];
          if (!productInfo) continue;
          const productData = productInfo.data;
          if (item.variantId) {
            const variantIndex = productData.variants?.findIndex(v => v.variantId === item.variantId);
            if (variantIndex !== -1 && variantIndex !== undefined) {
              productData.variants[variantIndex].stockQuantity = (Number(productData.variants[variantIndex].stockQuantity) || 0) + item.quantity;
            }
          } else {
            productData.stock = (Number(productData.stock) || 0) + item.quantity;
          }
        }

        for (const prodId in productDocsMap) {
          const info = productDocsMap[prodId];
          transaction.update(info.ref, {
            stock: info.data.stock !== undefined ? info.data.stock : 0,
            variants: info.data.variants || [],
            updatedAt: new Date().toISOString()
          });
        }

        transaction.update(orderRef, {
          status: 'cancelled',
          updatedAt: new Date().toISOString(),
          cancelledBy: 'customer',
          cancellationReasonKey: reasonKey || 'not_specified',
          cancellationReasonText: reasonText || '',
          cancelNote: `Cancelled by customer: ${reasonKey || 'not_specified'}${reasonText ? ` (${reasonText})` : ''}`
        });

        return { type: 'cancelled' };
      } else if (status === 'shipped') {
        // Request cancellation
        transaction.update(orderRef, {
          cancellationRequested: true,
          cancellationReasonKey: reasonKey || 'not_specified',
          cancellationReasonText: reasonText || '',
          cancellationRequestedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        return { type: 'requested' };
      } else {
        throw new Error(`Cancellation not allowed at "${status}" stage`);
      }
    });

    const updated = await orderRef.get();
    const updatedOrder = toPlainOrder(updated);

    publishEvent('orders.changed', { 
      type: result.type === 'cancelled' ? 'status_updated' : 'cancellation_requested', 
      orderId: updatedOrder._id, 
      status: updatedOrder.status 
    });
    
    if (updatedOrder.status === 'cancelled') {
      publishEvent('products.changed', { type: 'batch_update' });
    }

    res.json(updatedOrder);
  } catch (err) {
    logger.error('Cancel Order Error:', err.message);
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  placeOrder,
  getAllOrders,
  getOrder,
  updateOrderStatus,
  getOrderStats,
  getMyOrders,
  cancelMyOrder,
};