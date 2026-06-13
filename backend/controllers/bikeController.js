const asyncHandler = require('express-async-handler');
const Bike = require('../models/Bike');
const AppError = require('../utils/appError');
const ApiResponse = require('../utils/apiResponse');
const { uploadMultipleImages, deleteMultipleImages, deleteFromCloudinary } = require('../services/cloudinaryService');

// @desc   Get all bikes with search, filter, sort, pagination
// @route  GET /api/bikes
// @access Public
const getAllBikes = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    fuelType,
    minPrice,
    maxPrice,
    minRating,
    isAvailable,
    sortBy = 'createdAt',
    order = 'desc',
    page = 1,
    limit = 10,
  } = req.query;

  const query = {};

  // Text search
  if (search) {
    query.$text = { $search: search };
  }

  // Filters
  if (category) query.category = category;
  if (fuelType) query.fuelType = fuelType;
  if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';

  // Price range
  if (minPrice || maxPrice) {
    query.pricePerDay = {};
    if (minPrice) query.pricePerDay.$gte = Number(minPrice);
    if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
  }

  // Rating filter
  if (minRating) query.averageRating = { $gte: Number(minRating) };

  // Sorting
  const sortObj = {};
  sortObj[sortBy] = order === 'asc' ? 1 : -1;

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Bike.countDocuments(query);
  const bikes = await Bike.find(query).sort(sortObj).skip(skip).limit(Number(limit));

  ApiResponse.paginated(res, 'Bikes fetched successfully', bikes, page, limit, total);
});

// @desc   Get single bike by ID
// @route  GET /api/bikes/:id
// @access Public
const getBikeById = asyncHandler(async (req, res, next) => {
  const bike = await Bike.findById(req.params.id).populate({
    path: 'reviews',
    populate: { path: 'user', select: 'name avatar' },
    options: { sort: { createdAt: -1 }, limit: 10 },
  });

  if (!bike) {
    return next(new AppError('Bike not found', 404));
  }

  ApiResponse.success(res, 200, 'Bike fetched successfully', bike);
});

// @desc   Create new bike (Admin)
// @route  POST /api/bikes
// @access Admin
const createBike = asyncHandler(async (req, res, next) => {
  const bikeData = { ...req.body, createdBy: req.user._id };

  // Upload images to Cloudinary
  if (req.files && req.files.length > 0) {
    const uploadedImages = await uploadMultipleImages(req.files, 'bike-rental/bikes');
    bikeData.images = uploadedImages;
  }

  if (!bikeData.images || bikeData.images.length === 0) {
    return next(new AppError('At least one bike image is required', 400));
  }

  const bike = await Bike.create(bikeData);

  ApiResponse.success(res, 201, 'Bike created successfully', bike);
});

// @desc   Update bike (Admin)
// @route  PUT /api/bikes/:id
// @access Admin
const updateBike = asyncHandler(async (req, res, next) => {
  let bike = await Bike.findById(req.params.id);

  if (!bike) {
    return next(new AppError('Bike not found', 404));
  }

  const updateData = { ...req.body };

  // Handle new image uploads
  if (req.files && req.files.length > 0) {
    // Delete old images from Cloudinary
    if (bike.images && bike.images.length > 0) {
      await deleteMultipleImages(bike.images);
    }
    const uploadedImages = await uploadMultipleImages(req.files, 'bike-rental/bikes');
    updateData.images = uploadedImages;
  }

  bike = await Bike.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  ApiResponse.success(res, 200, 'Bike updated successfully', bike);
});

// @desc   Delete bike (Admin)
// @route  DELETE /api/bikes/:id
// @access Admin
const deleteBike = asyncHandler(async (req, res, next) => {
  const bike = await Bike.findById(req.params.id);

  if (!bike) {
    return next(new AppError('Bike not found', 404));
  }

  // Delete images from Cloudinary
  if (bike.images && bike.images.length > 0) {
    await deleteMultipleImages(bike.images);
  }

  await bike.deleteOne();

  ApiResponse.success(res, 200, 'Bike deleted successfully');
});

// @desc   Toggle bike availability
// @route  PUT /api/bikes/:id/availability
// @access Admin
const toggleAvailability = asyncHandler(async (req, res, next) => {
  const bike = await Bike.findById(req.params.id);
  if (!bike) return next(new AppError('Bike not found', 404));

  bike.isAvailable = !bike.isAvailable;
  await bike.save();

  ApiResponse.success(res, 200, `Bike is now ${bike.isAvailable ? 'available' : 'unavailable'}`, bike);
});

module.exports = {
  getAllBikes,
  getBikeById,
  createBike,
  updateBike,
  deleteBike,
  toggleAvailability,
};
