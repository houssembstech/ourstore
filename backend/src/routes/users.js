const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

// GET /api/users — Admin: get all users
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
    res.json({ success: true, data: users, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/users/:id/role — Admin: change user role
router.put('/:id/role', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/users/:id/status — Admin: activate/deactivate user
router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Wishlist
router.post('/wishlist/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const idx = user.wishlist.indexOf(req.params.productId);
    if (idx > -1) {
      user.wishlist.splice(idx, 1);
    } else {
      user.wishlist.push(req.params.productId);
    }
    await user.save();
    res.json({ success: true, wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/wishlist', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist', 'name price images rating');
    res.json({ success: true, data: user.wishlist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
