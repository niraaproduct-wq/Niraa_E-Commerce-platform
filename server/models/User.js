const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  name: { type: String, trim: true },
  email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  password: { type: String },
  phone: { type: String, required: true, unique: true },
  role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  hasPassword: { type: Boolean, default: false },

  address: {
    street: { type: String },
    city: { type: String, default: 'Dharmapuri' },
    pincode: { type: String },
    state: { type: String, default: 'Tamil Nadu' },
    landmark: { type: String },
    lat: { type: Number },
    lng: { type: Number },
    locationName: { type: String }
  },

  profileComplete: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.virtual('fullName').get(function () {
  if (this.firstName && this.lastName) return `${this.firstName} ${this.lastName}`;
  return this.name || this.phone;
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
