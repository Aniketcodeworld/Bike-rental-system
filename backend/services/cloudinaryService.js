const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const AppError = require('../utils/appError');

/**
 * Upload a single image buffer to Cloudinary
 */
const uploadToCloudinary = (buffer, folder = 'bike-rental') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 800, crop: 'limit', quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) reject(new AppError(`Cloudinary upload failed: ${error.message}`, 500));
        else resolve({ public_id: result.public_id, url: result.secure_url });
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Upload multiple image buffers
 */
const uploadMultipleImages = async (files, folder = 'bike-rental/bikes') => {
  if (!files || files.length === 0) return [];

  const uploadPromises = files.map((file) => uploadToCloudinary(file.buffer, folder));
  return await Promise.all(uploadPromises);
};

/**
 * Delete an image from Cloudinary
 */
const deleteFromCloudinary = async (public_id) => {
  if (!public_id) return;
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    console.error(`Cloudinary delete error: ${error.message}`);
  }
};

/**
 * Delete multiple images from Cloudinary
 */
const deleteMultipleImages = async (images) => {
  if (!images || images.length === 0) return;
  const deletePromises = images.map((img) => deleteFromCloudinary(img.public_id));
  await Promise.all(deletePromises);
};

module.exports = {
  uploadToCloudinary,
  uploadMultipleImages,
  deleteFromCloudinary,
  deleteMultipleImages,
};
