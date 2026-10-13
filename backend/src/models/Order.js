const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true }, // snapshot at order time
  image: { type: String, default: '' },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // For guest orders
  guestInfo: {
    name: String,
    email: String,
    phone: String,
  },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    wilaya: { type: String, required: true },
    country: { type: String, default: 'Algérie' },
    notes: { type: String, default: '' },
  },
  subtotal: { type: Number, required: true },
  shippingCost: { type: Number, default: 0 },
  total: { type: Number, required: true },
  currency: { type: String, default: 'DZD' },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'rejected'],
    default: 'pending',
  },
  agentNotes: { type: String, default: '' }, // notes from agent
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // which agent handled it
  confirmedAt: Date,
  shippedAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  orderNumber: { type: String, unique: true },
  lang: { type: String, enum: ['fr', 'ar', 'en'], default: 'fr' },
}, { timestamps: true });

// Auto-generate order number
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
