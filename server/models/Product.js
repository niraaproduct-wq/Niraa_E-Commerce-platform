const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  slug:        { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, required: true },
  category:    {
    type: String,
    required: true,
    enum: ['floor-cleaner', 'toilet-cleaner', 'dish-wash', 'detergent', 'tiles-cleaner', 'combo'],
  },
  price:         { type: Number, required: true },
  originalPrice: { type: Number },
  discount:      { type: Number, default: 0 },        // base percentage
  quantity:      { type: String, default: '1 litre' }, // base size
  stock:         { type: Number, default: 100 },       // base stock
  
  variants: [{
    variantId: { type: String, required: true },
    size: { type: String }, 
    type: { type: String }, // e.g., 'Bottle', 'Refill'
    fragrance: { type: String },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    stockQuantity: { type: Number, default: 100 }
  }],

  image:         { type: String, default: '' },
  images:        [{ type: String }],
  features:      [{ type: String }],                   // e.g. ['Kills 99.9% germs', 'Eco-friendly']
  usage:         { type: String },                     // Usage instructions
  isCombo:       { type: Boolean, default: false },
  comboItems:    [{ type: String }],                   // Names of products in combo
  isRefill:      { type: Boolean, default: false },
  subscriptionAvailable: { type: Boolean, default: true },
  isFeatured:    { type: Boolean, default: false },
  isActive:      { type: Boolean, default: true },
  reviews:       [reviewSchema],
  rating:        { type: Number, default: 0 },
  numReviews:    { type: Number, default: 0 },
}, { timestamps: true });

// Auto-calculate rating before save
productSchema.pre('save', function (next) {
  if (this.reviews.length > 0) {
    this.rating = this.reviews.reduce((sum, r) => sum + r.rating, 0) / this.reviews.length;
    this.numReviews = this.reviews.length;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);