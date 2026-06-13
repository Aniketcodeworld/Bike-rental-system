const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBookingById,
  approveBooking,
  rejectBooking,
  cancelBooking,
  completeBooking,
} = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/auth');

// User routes
router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/cancel', protect, cancelBooking);

// Admin routes
router.get('/', protect, adminOnly, getAllBookings);
router.put('/:id/approve', protect, adminOnly, approveBooking);
router.put('/:id/reject', protect, adminOnly, rejectBooking);
router.put('/:id/complete', protect, adminOnly, completeBooking);

module.exports = router;
