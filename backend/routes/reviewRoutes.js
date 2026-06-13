const express = require('express');
const router = express.Router();
const {
  createReview,
  getBikeReviews,
  updateReview,
  deleteReview,
  getAllReviews,
} = require('../controllers/reviewController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, createReview);
router.get('/bike/:bikeId', getBikeReviews);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

// Admin
router.get('/', protect, adminOnly, getAllReviews);

module.exports = router;
