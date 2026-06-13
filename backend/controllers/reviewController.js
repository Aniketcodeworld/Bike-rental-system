const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Bike = require('../models/Bike');
const AppError = require('../utils/appError');
const ApiResponse = require('../utils/apiResponse');

// @desc   Create review
// @route  POST /api/reviews
// @access Private (User)
const createReview = asyncHandler(async (req, res, next) => {
  const { bikeId, rating, title, comment, bookingId } = req.body;

  // Verify bike exists
  const bike = await Bike.findById(bikeId);
  if (!bike) return next(new AppError('Bike not found', 404));

  // Check if user already reviewed
  const existingReview = await Review.findOne({ user: req.user._id, bike: bikeId });
  if (existingReview) {
    return next(new AppError('You have already reviewed this bike', 400));
  }

  // Optionally verify completed booking
  if (bookingId) {
    const booking = await Booking.findOne({
      _id: bookingId,
      user: req.user._id,
      bike: bikeId,
      bookingStatus: 'completed',
    });
    if (!booking) {
      return next(new AppError('You can only review bikes you have rented', 403));
    }
  }

  const review = await Review.create({
    user: req.user._id,
    bike: bikeId,
    booking: bookingId || null,
    rating,
    title,
    comment,
  });

  const populatedReview = await Review.findById(review._id).populate('user', 'name avatar');

  ApiResponse.success(res, 201, 'Review added successfully', populatedReview);
});

// @desc   Get reviews for a bike
// @route  GET /api/reviews/bike/:bikeId
// @access Public
const getBikeReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const total = await Review.countDocuments({ bike: req.params.bikeId, isVisible: true });
  const reviews = await Review.find({ bike: req.params.bikeId, isVisible: true })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  ApiResponse.paginated(res, 'Reviews fetched', reviews, page, limit, total);
});

// @desc   Update review
// @route  PUT /api/reviews/:id
// @access Private (User - own review)
const updateReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('Review not found', 404));

  if (review.user.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to update this review', 403));
  }

  const { rating, title, comment } = req.body;
  if (rating) review.rating = rating;
  if (title) review.title = title;
  if (comment) review.comment = comment;

  await review.save();

  // Manually trigger rating update
  await Review.updateBikeRating(review.bike);

  ApiResponse.success(res, 200, 'Review updated successfully', review);
});

// @desc   Delete review
// @route  DELETE /api/reviews/:id
// @access Private (User - own review, Admin - any)
const deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (!review) return next(new AppError('Review not found', 404));

  const isOwner = review.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return next(new AppError('Not authorized to delete this review', 403));
  }

  await review.deleteOne();

  ApiResponse.success(res, 200, 'Review deleted successfully');
});

// @desc   Get all reviews (Admin)
// @route  GET /api/reviews
// @access Admin
const getAllReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const total = await Review.countDocuments();
  const reviews = await Review.find()
    .populate('user', 'name email avatar')
    .populate('bike', 'name brand model')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  ApiResponse.paginated(res, 'All reviews fetched', reviews, page, limit, total);
});

module.exports = { createReview, getBikeReviews, updateReview, deleteReview, getAllReviews };
