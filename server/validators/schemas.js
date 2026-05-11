const Joi = require('joi');

// ─── Shared Patterns ─────────────────────────────────────────────────────────

const indianPhone = Joi.string()
  .pattern(/^[+]?[\d\s\-()]{10,15}$/)
  .messages({ 'string.pattern.base': 'Please provide a valid phone number (10–15 digits)' });

const password = Joi.string().min(8).max(128)
  .messages({ 'string.min': 'Password must be at least 8 characters' });

const objectId = Joi.string().min(1).max(128); // Firestore doc IDs

const safeString = Joi.string().max(500).trim();
const longString = Joi.string().max(5000).trim();

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════

const checkPhone = Joi.object({
  phone: indianPhone.required()
});

const sendOtp = Joi.object({
  phone: indianPhone.required()
});

const sendEmailOtp = Joi.object({
  phone: indianPhone.required(),
  email: Joi.string().email().allow('', null)
});

const verifyOtp = Joi.object({
  phone: indianPhone.required(),
  otp: Joi.string().length(6).pattern(/^\d+$/).required()
    .messages({ 'string.pattern.base': 'OTP must be a 6-digit number' }),
  email: Joi.string().email().allow('', null),
  name: safeString.allow('', null),
  firstName: safeString.allow('', null),
  lastName: safeString.allow('', null),
  password: password.allow('', null),
  loginPassword: password.allow('', null),
  address: Joi.object().allow(null)
});

const verifyFirebase = Joi.object({
  idToken: Joi.string().min(1).required(),
  name: safeString.allow('', null),
  firstName: safeString.allow('', null),
  lastName: safeString.allow('', null),
  email: Joi.string().email().allow('', null),
  password: password.allow('', null),
  address: Joi.object().allow(null)
});

const register = Joi.object({
  firstName: safeString.required(),
  lastName: safeString.allow('', null),
  phone: indianPhone.required(),
  email: Joi.string().email().allow('', null),
  password: password.required(),
  address: Joi.object().allow(null)
});

const login = Joi.object({
  phone: indianPhone.allow('', null),
  email: Joi.string().email().allow('', null),
  password: password.required()
}).or('phone', 'email')
  .messages({ 'object.missing': 'Phone number or email is required' });

const adminLogin = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const updateProfile = Joi.object({
  firstName: safeString.allow('', null),
  lastName: safeString.allow('', null),
  name: safeString.allow('', null),
  email: Joi.string().email().allow('', null),
  address: Joi.object().allow(null)
});

const changePassword = Joi.object({
  currentPassword: password.required(),
  newPassword: password.required()
});

const setPassword = Joi.object({
  newPassword: password.required()
});

const resetPasswordWithOtp = Joi.object({
  otp: Joi.string().length(6).pattern(/^\d+$/).required(),
  newPassword: password.required()
});

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════

const adminCreateProduct = Joi.object({
  name: safeString.required(),
  description: longString.allow('', null),
  price: Joi.number().min(0).required(),
  comparePrice: Joi.number().min(0).allow(null, 0),
  category: safeString.allow('', null),
  images: Joi.array().items(Joi.string().uri().allow('')).max(20),
  stock: Joi.number().integer().min(0).default(0),
  variants: Joi.array().items(Joi.object()).max(50),
  tags: Joi.array().items(safeString).max(30),
  isActive: Joi.boolean(),
  isFeatured: Joi.boolean(),
  shortBenefit: safeString.allow('', null),
  highlightBadge: safeString.allow('', null),
  salesCount: Joi.alternatives().try(Joi.number(), Joi.string()).allow('', null),
  rating: Joi.number().min(0).max(5),
}).options({ allowUnknown: true }); // Allow product-type-specific fields

const adminUpdateProduct = Joi.object({
  name: safeString,
  description: longString.allow('', null),
  price: Joi.number().min(0),
  comparePrice: Joi.number().min(0).allow(null, 0),
  category: safeString.allow('', null),
  images: Joi.array().items(Joi.string().uri().allow('')).max(20),
  image: Joi.string().allow('', null),
  stock: Joi.number().integer().min(0),
  variants: Joi.array().items(Joi.object()).max(50),
  tags: Joi.array().items(safeString).max(30),
  isActive: Joi.boolean(),
  isFeatured: Joi.boolean(),
  shortBenefit: safeString.allow('', null),
  highlightBadge: safeString.allow('', null),
  salesCount: Joi.alternatives().try(Joi.number(), Joi.string()).allow('', null),
  rating: Joi.number().min(0).max(5),
}).options({ allowUnknown: true });

const adminUpdateOrderStatus = Joi.object({
  status: Joi.string().valid(
    'placed', 'pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'
  ).required(),
  trackingNumber: safeString.allow('', null),
  notes: longString.allow('', null)
});

const adminUpdateProductStock = Joi.object({
  stock: Joi.number().integer().min(0).required(),
  operation: Joi.string().valid('set', 'increase', 'decrease').default('set')
});

const adminUpdateCustomer = Joi.object({
  isActive: Joi.boolean(),
  address: Joi.object().allow(null)
});

const adminBlockCustomer = Joi.object({
  isBlocked: Joi.boolean().required()
});

// ═══════════════════════════════════════════════════════════════════════════════
// ORDER SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════

const placeOrder = Joi.object({
  items: Joi.array().items(
    Joi.object({
      product: objectId.required(),
      name: safeString.required(),
      price: Joi.number().min(0).required(),
      quantity: Joi.number().integer().min(1).required(),
      image: Joi.string().allow('', null),
      variantId: safeString.allow('', null),
      variantDesc: safeString.allow('', null),
    }).options({ allowUnknown: true })
  ).min(1).required(),
  customerName: safeString.allow('', null),
  customerPhone: indianPhone.allow('', null),
  customerEmail: Joi.string().email().allow('', null),
  address: Joi.object().allow(null),
  total: Joi.number().min(0),
  subtotal: Joi.number().min(0),
  discount: Joi.number().min(0).allow(null, 0),
  taxRate: Joi.number().min(0).allow(null, 0),
  taxAmount: Joi.number().min(0).allow(null, 0),
  deliveryCharge: Joi.number().min(0),
  paymentMethod: Joi.string().valid('cod', 'online', 'razorpay', 'upi', 'cash', 'card', 'split').allow('', null),
  status: Joi.string().allow('', null),
  paymentStatus: Joi.string().allow('', null),
  customerType: Joi.string().allow('', null),
  source: Joi.string().allow('', null),
  orderType: Joi.string().allow('', null),
  cashier: Joi.string().allow('', null),
  cashierId: objectId.allow('', null),
  posOrderId: Joi.string().allow('', null),
  deliveryMode: Joi.string().allow('', null),
  deliveryStatus: Joi.string().allow('', null),
  notes: longString.allow('', null),
}).options({ allowUnknown: true });

const orderUpdateStatus = Joi.object({
  status: Joi.string().valid(
    'placed', 'pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'
  ),
  paymentStatus: Joi.string().valid('pending', 'paid', 'failed', 'refunded').allow(null, ''),
  refundStatus: Joi.string().allow('', null),
  trackingNumber: safeString.allow('', null),
  notes: longString.allow('', null),
  adminNotes: longString.allow('', null)
}).or('status', 'paymentStatus').options({ allowUnknown: true });

const cancelMyOrder = Joi.object({
  reasonKey: safeString.allow('', null),
  reasonText: longString.allow('', null)
});

// ═══════════════════════════════════════════════════════════════════════════════
// USER SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════

const updateUserProfile = Joi.object({
  name: safeString.allow('', null),
  email: Joi.string().email().allow('', null),
  address: Joi.object().allow(null)
});

const addUserAddress = Joi.object({
  address: safeString.required(),
  city: safeString.required(),
  state: safeString.required(),
  zipCode: Joi.string().pattern(/^\d{6}$/).allow('', null)
    .messages({ 'string.pattern.base': 'ZIP code must be a 6-digit number' }),
  country: safeString.default('India'),
  latitude: Joi.number().min(-90).max(90).allow(null),
  longitude: Joi.number().min(-180).max(180).allow(null),
  type: Joi.string().valid('home', 'work', 'other').default('home'),
  isDefault: Joi.boolean().default(false)
});

const updateUserAddress = Joi.object({
  address: safeString,
  city: safeString,
  state: safeString,
  zipCode: Joi.string().pattern(/^\d{6}$/).allow('', null),
  country: safeString,
  latitude: Joi.number().min(-90).max(90).allow(null),
  longitude: Joi.number().min(-180).max(180).allow(null),
  type: Joi.string().valid('home', 'work', 'other')
});

// ═══════════════════════════════════════════════════════════════════════════════
// PAYMENT SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════

const createPaymentOrder = Joi.object({
  amount: Joi.number().min(1).required(),
  currency: Joi.string().valid('INR', 'USD').default('INR'),
  orderId: objectId.required(),
  customerId: objectId.allow('', null),
  description: safeString.allow('', null)
});

const verifyPayment = Joi.object({
  razorpayOrderId: Joi.string().required(),
  razorpayPaymentId: Joi.string().required(),
  razorpaySignature: Joi.string().required(),
  orderId: objectId.allow('', null)
});

const refundPayment = Joi.object({
  razorpayPaymentId: Joi.string().required(),
  reason: safeString.required(),
  amount: Joi.number().min(0).allow(null)
});

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT SCHEMAS (public routes)
// ═══════════════════════════════════════════════════════════════════════════════

const addReview = Joi.object({
  name: safeString.required(),
  rating: Joi.number().min(1).max(5).required(),
  comment: longString.allow('', null)
});

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════

const createSection = Joi.object({
  page: safeString.required(),
  type: safeString.required(),
  data: Joi.object().allow(null)
}).options({ allowUnknown: true });

const updateSection = Joi.object({}).options({ allowUnknown: true }); // Very dynamic structure

const reorderSections = Joi.object({
  sectionIds: Joi.array().items(objectId).min(1).required()
});

const bulkSaveSections = Joi.object({
  sections: Joi.array().items(Joi.object()).min(1).required()
});

// ═══════════════════════════════════════════════════════════════════════════════
// LOCATION SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════

const detectLocation = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required()
});

const reverseGeocode = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required()
});

const validateAddress = Joi.object({
  address: safeString.required(),
  city: safeString.required(),
  state: safeString.required(),
  zipCode: Joi.string().pattern(/^\d{6}$/).allow('', null)
});

// ═══════════════════════════════════════════════════════════════════════════════
// MARKETING SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════

const sendBroadcast = Joi.object({
  message: Joi.string().min(5).max(1000).required(),
  channel: Joi.string().valid('sms', 'whatsapp').default('sms')
});

const createBanner = Joi.object({
  title: safeString.required(),
  subtitle: safeString.allow('', null),
  link: Joi.string().max(2000).allow('', null),
  order: Joi.number().integer().min(0).default(0)
}).options({ allowUnknown: true }); // Allow file upload fields

const updateBanner = Joi.object({
  title: safeString,
  subtitle: safeString.allow('', null),
  link: Joi.string().max(2000).allow('', null),
  order: Joi.number().integer().min(0)
}).options({ allowUnknown: true });

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
  // Auth
  auth: {
    checkPhone,
    sendOtp,
    sendEmailOtp,
    verifyOtp,
    verifyFirebase,
    register,
    login,
    adminLogin,
    updateProfile,
    changePassword,
    setPassword,
    resetPasswordWithOtp,
  },

  // Admin
  admin: {
    createProduct: adminCreateProduct,
    updateProduct: adminUpdateProduct,
    updateOrderStatus: adminUpdateOrderStatus,
    updateProductStock: adminUpdateProductStock,
    updateCustomer: adminUpdateCustomer,
    blockCustomer: adminBlockCustomer,
  },

  // Orders
  orders: {
    placeOrder,
    updateStatus: orderUpdateStatus,
    cancelMyOrder,
  },

  // Users
  users: {
    updateProfile: updateUserProfile,
    addAddress: addUserAddress,
    updateAddress: updateUserAddress,
  },

  // Payments
  payments: {
    createOrder: createPaymentOrder,
    verify: verifyPayment,
    refund: refundPayment,
  },

  // Products
  products: {
    addReview,
  },

  // Sections
  sections: {
    create: createSection,
    update: updateSection,
    reorder: reorderSections,
    bulkSave: bulkSaveSections,
  },

  // Locations
  locations: {
    detect: detectLocation,
    reverse: reverseGeocode,
    validate: validateAddress,
  },

  // Marketing
  marketing: {
    sendBroadcast,
    createBanner,
    updateBanner,
  },
};
