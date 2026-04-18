const Order = require('../models/Order');
const { saveOrderToExcel } = require('../utils/excelHelper');

// @desc    Place new order (guest checkout)
const placeOrder = async (req, res) => {
  try {
    // If DB is unavailable (dev), return a mock order instead of saving
    if (process.env.DB_CONNECTED === 'false') {
      const mockOrder = {
        _id: `mock_${Date.now()}`,
        ...req.body,
        status: 'placed',
        paymentStatus: req.body.paymentMethod === 'upi' ? 'pending' : 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await saveOrderToExcel(mockOrder);
      return res.status(201).json(mockOrder);
    }

    const order = new Order(req.body);
    const savedOrder = await order.save();
    await saveOrderToExcel(savedOrder);
    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get all orders (admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate('items.product');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get single order
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update order status (admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get order stats (admin)
const getOrderStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$total' } } }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  placeOrder,
  getAllOrders,
  getOrder,
  updateOrderStatus,
  getOrderStats,
};
