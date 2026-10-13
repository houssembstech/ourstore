const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { protect, authorize } = require('../middleware/auth');

// Multer - memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Seules les images sont acceptées'), false);
  },
});

// POST /api/upload — Upload image to Cloudinary
router.post('/', protect, authorize('admin'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Aucun fichier fourni' });

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'ourstore/products', transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' }] },
        (error, result) => { if (error) reject(error); else resolve(result); }
      );
      stream.end(req.file.buffer);
    });

    res.json({ success: true, url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/upload/:publicId — Delete image from Cloudinary
router.delete('/:publicId', protect, authorize('admin'), async (req, res) => {
  try {
    await cloudinary.uploader.destroy(req.params.publicId);
    res.json({ success: true, message: 'Image supprimée' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
