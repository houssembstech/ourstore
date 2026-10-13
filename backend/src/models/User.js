const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin', 'agent'], default: 'user' },
  avatar: { type: String, default: '' },
  addresses: [{
    label: String,
    street: String,
    city: String,
    wilaya: String,
    country: { type: String, default: 'Algérie' },
    isDefault: { type: Boolean, default: false },
  }],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  isActive: { type: Boolean, default: true },
  preferredLang: { type: String, enum: ['fr', 'ar', 'en'], default: 'fr' },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
