const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    fr: { type: String, required: true },
    ar: { type: String, required: true },
    en: { type: String, required: true },
  },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: {
    fr: { type: String, default: '' },
    ar: { type: String, default: '' },
    en: { type: String, default: '' },
  },
  image: { type: String, default: '' },
  icon: { type: String, default: '📦' },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
