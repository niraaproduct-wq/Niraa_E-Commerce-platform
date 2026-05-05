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
    const { items } = req.body;

    if (!items || items.length === 0) {
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
      const orderData = {
        ...req.body,
        status: req.body.status || 'placed',
        paymentStatus: req.body.paymentStatus || 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const orderRef = db.collection(ORDERS_COLLECTION).doc();
      transaction.set(orderRef, orderData);
      return orderRef.id;
    });

    const savedOrder = { id: orderId, _id: orderId, ...req.body, status: 'placed' };
    
    // Notify clients about the new order
    publishEvent('orders.changed', { type: 'created', orderId: savedOrder._id });
    
    // Notify clients about potential stock changes
    publishEvent('products.changed', { type: 'batch_update' });
    
    res.status(201).json(savedOrder);
  } catch (err) {
    console.error('Place Order Error:', err.message);
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
    console.error('Update Order Status Error:', err.message);
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
    console.error('Cancel Order Error:', err.message);
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
