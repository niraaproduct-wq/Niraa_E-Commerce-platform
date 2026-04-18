const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: String }, // Link to product variant
  name:      { type: String, required: true },
  variantDesc:{type: String }, // e.g. "500ml, Bottle"
  image:     { type: String },
  price:     { type: Number, required: true },
  quantity:  { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema({
  // Customer info (no login required for local customers)
  customerName:  { type: String, required: true, trim: true },
  customerPhone: { type: String, required: true, trim: true },
  customerEmail: { type: String, trim: true },

  // Delivery address
  address: {
    street:  { type: String, required: true },
    city:    { type: String, required: true },
    district:{ type: String, default: 'Dharmapuri' },
    state:   { type: String, default: 'Tamil Nadu' },
    pincode: { type: String, required: true },
  },

  // Order items
  items: [orderItemSchema],

  // Pricing
  subtotal:  { type: Number, required: true },
  discount:  { type: Number, default: 0 },
  total:     { type: Number, required: true },

  // Payment
  paymentMethod: {
    type: String,
    enum: ['cod', 'upi'],
    default: 'cod',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  },
  upiTransactionId: { type: String },

  // Order status
  status: {
    type: String,
    enum: ['placed', 'confirmed', 'packed', 'out-for-delivery', 'delivered', 'cancelled'],
    default: 'placed',
  },

  // Notes
  notes: { type: String },

  // Via WhatsApp?
  viaWhatsApp: { type: Boolean, default: false },
  isSubscription: { type: Boolean, default: false },

}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);