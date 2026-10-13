const express = require('express');
const router = express.Router();
// Cart is managed client-side (localStorage) with server-side validation
// This endpoint validates cart items and returns updated prices/stock info

const Product = require('../models/Product');

// POST /api/cart/validate — validate cart items (prices + stock)
router.post('/validate', async (req, res) => {
  try {
    const { items } = req.body;
    const validated = [];
    for (const item of items) {
      const product = await Product.findById(item.product).populate('category', 'name');
      if (!product || !product.isActive) {
        validated.push({ ...item, valid: false, reason: 'product_unavailable' });
        continue;
      }
      if (product.stock < item.quantity) {
        validated.push({ ...item, currentStock: product.stock, valid: false, reason: 'insufficient_stock' });
        continue;
      }
      validated.push({
        product: product._id,
        name: product.name,
        image: product.images[0] || '',
        price: product.price,
        comparePrice: product.comparePrice,
        stock: product.stock,
        quantity: item.quantity,
        category: product.category,
        valid: true,
      });
    }
    res.json({ success: true, data: validated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
