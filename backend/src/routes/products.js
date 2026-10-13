const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

// GET /api/products?category=&search=&minPrice=&maxPrice=&sort=&page=&limit=&featured=
router.get('/', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sort, page = 1, limit = 12, featured } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (featured === 'true') query.isFeatured = true;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$or = [
        { 'name.fr': { $regex: search, $options: 'i' } },
        { 'name.ar': { $regex: search, $options: 'i' } },
        { 'name.en': { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      rating: { rating: -1 },
    };
    const sortObj = sortOptions[sort] || { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug icon')
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug icon').populate('reviews.user', 'name avatar');
    if (!product) return res.status(404).json({ success: false, message: 'Produit introuvable' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/products (admin)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/products/:id (admin)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Produit introuvable' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/products/:id (admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Produit supprimé' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/products/:id/reviews (authenticated)
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Produit introuvable' });

    const alreadyReviewed = product.reviews.find(r => r.user.toString() === req.user._id.toString());
    if (alreadyReviewed) return res.status(400).json({ success: false, message: 'Vous avez déjà laissé un avis' });

    product.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
    product.updateRating();
    await product.save();
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
