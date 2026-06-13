const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Bike = require('../models/Bike');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const AppError = require('../utils/appError');
const ApiResponse = require('../utils/apiResponse');

// @desc   Admin dashboard analytics
// @route  GET /api/admin/dashboard
// @access Admin
const getDashboard = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalBikes,
    availableBikes,
    totalBookings,
    activeBookings,
    pendingBookings,
    completedBookings,
    cancelledBookings,
    revenueAgg,
    recentBookings,
    topBikes,
    monthlyRevenue,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Bike.countDocuments(),
    Bike.countDocuments({ isAvailable: true }),
    Booking.countDocuments(),
    Booking.countDocuments({ bookingStatus: { $in: ['approved', 'active'] } }),
    Booking.countDocuments({ bookingStatus: 'pending' }),
    Booking.countDocuments({ bookingStatus: 'completed' }),
    Booking.countDocuments({ bookingStatus: 'cancelled' }),

    // Total revenue from completed bookings
    Booking.aggregate([
      { $match: { bookingStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$subtotal' } } },
    ]),

    // Recent 5 bookings
    Booking.find()
      .populate('user', 'name email avatar')
      .populate('bike', 'name brand model images')
      .sort({ createdAt: -1 })
      .limit(5),

    // Top rented bikes
    Bike.find().sort({ totalBookings: -1 }).limit(5).select('name brand model images totalBookings averageRating'),

    // Monthly revenue (last 6 months)
    Booking.aggregate([
      { $match: { bookingStatus: 'completed', createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$subtotal' },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);

  const totalRevenue = revenueAgg[0]?.total || 0;

  ApiResponse.success(res, 200, 'Dashboard data fetched', {
    stats: {
      totalUsers,
      totalBikes,
      availableBikes,
      totalBookings,
      activeBookings,
      pendingBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue,
    },
    recentBookings,
    topBikes,
    monthlyRevenue,
  });
});

// @desc   Get all users
// @route  GET /api/admin/users
// @access Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const { search, isBlocked, page = 1, limit = 20 } = req.query;

  const query = { role: 'user' };
  if (search) query.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];
  if (isBlocked !== undefined) query.isBlocked = isBlocked === 'true';

  const skip = (Number(page) - 1) * Number(limit);
  const total = await User.countDocuments(query);
  const users = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));

  ApiResponse.paginated(res, 'Users fetched', users, page, limit, total);
});

// @desc   Get single user (Admin)
// @route  GET /api/admin/users/:id
// @access Admin
const getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('User not found', 404));

  const bookings = await Booking.find({ user: user._id })
    .populate('bike', 'name brand model images')
    .sort({ createdAt: -1 })
    .limit(5);

  ApiResponse.success(res, 200, 'User fetched', { user, recentBookings: bookings });
});

// @desc   Block/Unblock user (Admin)
// @route  PUT /api/admin/users/:id/block
// @access Admin
const toggleBlockUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('User not found', 404));

  if (user.role === 'admin') {
    return next(new AppError('Cannot block an admin account', 403));
  }

  user.isBlocked = !user.isBlocked;
  await user.save({ validateBeforeSave: false });

  ApiResponse.success(res, 200, `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`, {
    isBlocked: user.isBlocked,
  });
});

// @desc   Delete user (Admin)
// @route  DELETE /api/admin/users/:id
// @access Admin
const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('User not found', 404));

  if (user.role === 'admin') {
    return next(new AppError('Cannot delete an admin account', 403));
  }

  await user.deleteOne();

  ApiResponse.success(res, 200, 'User deleted successfully');
});

module.exports = { getDashboard, getAllUsers, getUserById, toggleBlockUser, deleteUser };
