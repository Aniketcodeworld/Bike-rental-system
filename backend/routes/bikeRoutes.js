const express = require('express');
const router = express.Router();
const {
  getAllBikes,
  getBikeById,
  createBike,
  updateBike,
  deleteBike,
  toggleAvailability,
} = require('../controllers/bikeController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', getAllBikes);
router.get('/:id', getBikeById);

// Admin routes
router.post('/', protect, adminOnly, upload.array('images', 5), createBike);
router.put('/:id', protect, adminOnly, upload.array('images', 5), updateBike);
router.delete('/:id', protect, adminOnly, deleteBike);
router.put('/:id/availability', protect, adminOnly, toggleAvailability);

module.exports = router;
