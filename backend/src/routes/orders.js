const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// POST /api/orders — Create order (guest or authenticated)
router.post('/', async (req, res) => {
  try {
    const { items, shippingAddress, guestInfo, lang } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Commande vide' });
    }

    // Calculate totals from DB prices (security)
    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        return res.status(400).json({ success: false, message: `Produit ${item.product} introuvable` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Stock insuffisant pour ${product.name.fr}` });
      }
      const price = product.price;
      subtotal += price * item.quantity;
      orderItems.push({
        product: product._id,
        name: product.name[lang || 'fr'] || product.name.fr,
        image: product.images[0] || '',
        price,
        quantity: item.quantity,
      });
    }

    const shippingCost = 0; // Free shipping for now
    const total = subtotal + shippingCost;

    const orderData = {
      items: orderItems,
      shippingAddress,
      subtotal,
      shippingCost,
      total,
      lang: lang || 'fr',
    };

    if (req.headers.authorization) {
      // Try to get user from token
      try {
        const jwt = require('jsonwebtoken');
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        orderData.user = decoded.id;
      } catch (e) { /* guest order */ }
    }

    if (!orderData.user) {
      orderData.guestInfo = guestInfo;
    }

    const order = await Order.create(orderData);
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders/my — Get authenticated user orders
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders/:id — Get single order
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name images')
      .populate('agentId', 'name');
    if (!order) return res.status(404).json({ success: false, message: 'Commande introuvable' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders — Admin: get all orders
router.get('/', protect, authorize('admin', 'agent'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
        { 'shippingAddress.phone': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('agentId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      data: orders,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/orders/:id/status — Admin/Agent: update order status
router.patch('/:id/status', protect, authorize('admin', 'agent'), async (req, res) => {
  try {
    const { status, agentNotes } = req.body;
    const allowedStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'rejected'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Statut invalide' });
    }

    const update = { status, agentId: req.user._id };
    if (agentNotes) update.agentNotes = agentNotes;
    if (status === 'confirmed') update.confirmedAt = new Date();
    if (status === 'shipped') update.shippedAt = new Date();
    if (status === 'delivered') update.deliveredAt = new Date();
    if (status === 'cancelled' || status === 'rejected') update.cancelledAt = new Date();

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Commande introuvable' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/orders/stats — Admin: dashboard stats
router.get('/admin/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const total = await Order.countDocuments();
    const pending = await Order.countDocuments({ status: 'pending' });
    const confirmed = await Order.countDocuments({ status: 'confirmed' });
    const delivered = await Order.countDocuments({ status: 'delivered' });
    const revenue = await Order.aggregate([
      { $match: { status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    res.json({
      success: true,
      data: {
        total, pending, confirmed, delivered,
        revenue: revenue[0]?.total || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
