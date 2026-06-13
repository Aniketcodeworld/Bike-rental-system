const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const User = require('../models/User');
const AppError = require('../utils/appError');
const ApiResponse = require('../utils/apiResponse');
const { sendTokenResponse } = require('../utils/generateToken');
const { sendEmail, passwordResetEmailTemplate } = require('../utils/sendEmail');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');

// @desc   Register user
// @route  POST /api/auth/register
// @access Public
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Email already registered. Please login.', 400));
  }

  const user = await User.create({ name, email, password, phone });

  sendTokenResponse(user, 201, res, 'Registration successful! Welcome to BikeRental.');
});

// @desc   Login user
// @route  POST /api/auth/login
// @access Public
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  if (user.isBlocked) {
    return next(new AppError('Your account has been blocked. Please contact support.', 403));
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res, 'Login successful! Welcome back.');
});

// @desc   Logout user
// @route  POST /api/auth/logout
// @access Private
const logout = asyncHandler(async (req, res) => {
  res.cookie('token', '', {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });

  ApiResponse.success(res, 200, 'Logged out successfully');
});

// @desc   Get current user profile
// @route  GET /api/auth/profile
// @access Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  ApiResponse.success(res, 200, 'Profile fetched successfully', user);
});

// @desc   Update user profile
// @route  PUT /api/auth/profile
// @access Private
const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, phone, address, drivingLicense } = req.body;

  const updateData = {};
  if (name) updateData.name = name;
  if (phone) updateData.phone = phone;
  if (address) updateData.address = address;
  if (drivingLicense) updateData.drivingLicense = drivingLicense;

  // Handle avatar upload
  if (req.file) {
    const user = await User.findById(req.user._id);
    if (user.avatar?.public_id) {
      await deleteFromCloudinary(user.avatar.public_id);
    }
    const result = await uploadToCloudinary(req.file.buffer, 'bike-rental/avatars');
    updateData.avatar = result;
  }

  const user = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true,
  });

  ApiResponse.success(res, 200, 'Profile updated successfully', user);
});

// @desc   Change password
// @route  PUT /api/auth/change-password
// @access Private
const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new AppError('Please provide current and new password', 400));
  }

  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError('Current password is incorrect', 401));
  }

  if (newPassword.length < 6) {
    return next(new AppError('New password must be at least 6 characters', 400));
  }

  user.password = newPassword;
  await user.save();

  ApiResponse.success(res, 200, 'Password changed successfully');
});

// @desc   Forgot password - send reset email
// @route  POST /api/auth/forgot-password
// @access Public
const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('No user found with that email address', 404));
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'BikeRental - Password Reset Request',
      html: passwordResetEmailTemplate(user.name, resetUrl),
      text: `Reset your password: ${resetUrl}`,
    });

    ApiResponse.success(res, 200, `Password reset email sent to ${user.email}`);
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Email could not be sent. Please try again later.', 500));
  }
});

// @desc   Reset password
// @route  POST /api/auth/reset-password/:token
// @access Public
const resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Invalid or expired reset token. Please request a new one.', 400));
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password reset successful! You are now logged in.');
});

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
};
