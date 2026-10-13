const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: {
    fr: { type: String, required: true },
    ar: { type: String, required: true },
    en: { type: String, required: true },
  },
  description: {
    fr: { type: String, default: '' },
    ar: { type: String, default: '' },
    en: { type: String, default: '' },
  },
  price: { type: Number, required: true, min: 0 },
  comparePrice: { type: Number, default: 0 }, // original price for discounts
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  images: [{ type: String }], // Cloudinary URLs
  stock: { type: Number, required: true, default: 0, min: 0 },
  sku: { type: String, unique: true, sparse: true },
  tags: [{ type: String }],
  reviews: [reviewSchema],
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  attributes: mongoose.Schema.Types.Mixed, // flexible: size, color, weight, etc.
}, { timestamps: true });

// Update avg rating
productSchema.methods.updateRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
  } else {
    this.rating = this.reviews.reduce((acc, r) => acc + r.rating, 0) / this.reviews.length;
    this.numReviews = this.reviews.length;
  }
};

// Text search index
productSchema.index({ 'name.fr': 'text', 'name.ar': 'text', 'name.en': 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
