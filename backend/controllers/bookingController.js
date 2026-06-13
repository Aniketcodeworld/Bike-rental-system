const asyncHandler = require('express-async-handler');
const Booking = require('../models/Booking');
const Bike = require('../models/Bike');
const Payment = require('../models/Payment');
const AppError = require('../utils/appError');
const ApiResponse = require('../utils/apiResponse');

// @desc   Create new booking
// @route  POST /api/bookings
// @access Private (User)
const createBooking = asyncHandler(async (req, res, next) => {
  const { bikeId, startDate, endDate, notes, pickupLocation, dropoffLocation, paymentMethod } = req.body;

  // Check bike exists and is available
  const bike = await Bike.findById(bikeId);
  if (!bike) return next(new AppError('Bike not found', 404));
  if (!bike.isAvailable) return next(new AppError('This bike is currently not available for rental', 400));

  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (start < today) return next(new AppError('Start date cannot be in the past', 400));
  if (end <= start) return next(new AppError('End date must be after start date', 400));

  // Check for overlapping bookings
  const overlap = await Booking.findOne({
    bike: bikeId,
    bookingStatus: { $in: ['pending', 'approved', 'active'] },
    $or: [
      { startDate: { $lte: end }, endDate: { $gte: start } },
    ],
  });

  if (overlap) {
    return next(new AppError('Bike is already booked for the selected dates', 409));
  }

  const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  const subtotal = totalDays * bike.pricePerDay;
  const totalAmount = subtotal + bike.securityDeposit;

  const booking = await Booking.create({
    user: req.user._id,
    bike: bikeId,
    startDate: start,
    endDate: end,
    totalDays,
    pricePerDay: bike.pricePerDay,
    securityDeposit: bike.securityDeposit,
    subtotal,
    totalAmount,
    notes,
    pickupLocation,
    dropoffLocation,
    paymentMethod: paymentMethod || 'cash',
  });

  // Create payment record
  await Payment.create({
    booking: booking._id,
    user: req.user._id,
    amount: totalAmount,
    paymentMethod: paymentMethod || 'cash',
    paymentStatus: 'pending',
  });

  // Increment bike bookings count
  await Bike.findByIdAndUpdate(bikeId, { $inc: { totalBookings: 1 } });

  const populatedBooking = await Booking.findById(booking._id)
    .populate('bike', 'name brand model images pricePerDay')
    .populate('user', 'name email phone');

  ApiResponse.success(res, 201, 'Booking created successfully! Awaiting admin approval.', populatedBooking);
});

// @desc   Get user's own bookings
// @route  GET /api/bookings/my
// @access Private (User)
const getMyBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query = { user: req.user._id };
  if (status) query.bookingStatus = status;

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Booking.countDocuments(query);

  const bookings = await Booking.find(query)
    .populate('bike', 'name brand model images pricePerDay category')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  ApiResponse.paginated(res, 'Bookings fetched successfully', bookings, page, limit, total);
});

// @desc   Get all bookings (Admin)
// @route  GET /api/bookings
// @access Admin
const getAllBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10, userId, bikeId } = req.query;

  const query = {};
  if (status) query.bookingStatus = status;
  if (userId) query.user = userId;
  if (bikeId) query.bike = bikeId;

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Booking.countDocuments(query);

  const bookings = await Booking.find(query)
    .populate('user', 'name email phone avatar')
    .populate('bike', 'name brand model images pricePerDay category')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  ApiResponse.paginated(res, 'All bookings fetched', bookings, page, limit, total);
});

// @desc   Get single booking
// @route  GET /api/bookings/:id
// @access Private
const getBookingById = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate('user', 'name email phone avatar')
    .populate('bike', 'name brand model images pricePerDay category registrationNumber');

  if (!booking) return next(new AppError('Booking not found', 404));

  // Users can only view their own bookings
  if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to view this booking', 403));
  }

  ApiResponse.success(res, 200, 'Booking fetched successfully', booking);
});

// @desc   Approve booking (Admin)
// @route  PUT /api/bookings/:id/approve
// @access Admin
const approveBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return next(new AppError('Booking not found', 404));

  if (booking.bookingStatus !== 'pending') {
    return next(new AppError(`Cannot approve a booking with status: ${booking.bookingStatus}`, 400));
  }

  booking.bookingStatus = 'approved';
  booking.approvedAt = new Date();
  booking.adminNotes = req.body.adminNotes || '';
  await booking.save();

  // Update payment status
  await Payment.findOneAndUpdate(
    { booking: booking._id },
    { paymentStatus: 'pending' }
  );

  ApiResponse.success(res, 200, 'Booking approved successfully', booking);
});

// @desc   Reject booking (Admin)
// @route  PUT /api/bookings/:id/reject
// @access Admin
const rejectBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return next(new AppError('Booking not found', 404));

  if (!['pending', 'approved'].includes(booking.bookingStatus)) {
    return next(new AppError(`Cannot reject a booking with status: ${booking.bookingStatus}`, 400));
  }

  booking.bookingStatus = 'rejected';
  booking.rejectedAt = new Date();
  booking.cancellationReason = req.body.reason || 'Rejected by admin';
  booking.adminNotes = req.body.adminNotes || '';
  await booking.save();

  ApiResponse.success(res, 200, 'Booking rejected', booking);
});

// @desc   Cancel booking (User or Admin)
// @route  PUT /api/bookings/:id/cancel
// @access Private
const cancelBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return next(new AppError('Booking not found', 404));

  const isAdmin = req.user.role === 'admin';
  const isOwner = booking.user.toString() === req.user._id.toString();

  if (!isAdmin && !isOwner) {
    return next(new AppError('Not authorized to cancel this booking', 403));
  }

  if (!['pending', 'approved'].includes(booking.bookingStatus)) {
    return next(new AppError(`Cannot cancel a booking with status: ${booking.bookingStatus}`, 400));
  }

  booking.bookingStatus = 'cancelled';
  booking.cancelledAt = new Date();
  booking.cancelledBy = isAdmin ? 'admin' : 'user';
  booking.cancellationReason = req.body.reason || 'Cancelled by ' + (isAdmin ? 'admin' : 'user');
  await booking.save();

  ApiResponse.success(res, 200, 'Booking cancelled successfully', booking);
});

// @desc   Complete booking (Admin)
// @route  PUT /api/bookings/:id/complete
// @access Admin
const completeBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return next(new AppError('Booking not found', 404));

  if (!['approved', 'active'].includes(booking.bookingStatus)) {
    return next(new AppError(`Cannot complete a booking with status: ${booking.bookingStatus}`, 400));
  }

  booking.bookingStatus = 'completed';
  booking.completedAt = new Date();
  booking.paymentStatus = 'paid';
  await booking.save();

  await Payment.findOneAndUpdate(
    { booking: booking._id },
    { paymentStatus: 'completed' }
  );

  ApiResponse.success(res, 200, 'Booking completed successfully', booking);
});

module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBookingById,
  approveBooking,
  rejectBooking,
  cancelBooking,
  completeBooking,
};
