const mongoose = require('mongoose');

const bikeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Bike name is required'],
      trim: true,
      maxlength: [100, 'Bike name cannot exceed 100 characters'],
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: [1990, 'Year must be 1990 or later'],
      max: [new Date().getFullYear() + 1, 'Year cannot be in the future'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['Sport', 'Cruiser', 'Adventure', 'Scooter', 'Electric', 'Off-Road', 'Touring', 'Naked'],
        message: 'Invalid category',
      },
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    engineCapacity: {
      type: Number,
      required: [true, 'Engine capacity is required'],
      min: [50, 'Engine capacity must be at least 50cc'],
    },
    fuelType: {
      type: String,
      required: [true, 'Fuel type is required'],
      enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
      default: 'Petrol',
    },
    mileage: {
      type: Number,
      required: [true, 'Mileage is required'],
      min: [0, 'Mileage cannot be negative'],
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Price per day is required'],
      min: [0, 'Price cannot be negative'],
    },
    securityDeposit: {
      type: Number,
      required: [true, 'Security deposit is required'],
      min: [0, 'Security deposit cannot be negative'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    features: [{ type: String }],
    images: [
      {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    location: {
      type: String,
      default: 'Main Branch',
    },
    condition: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair'],
      default: 'Excellent',
    },
    totalBookings: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for search and filter
bikeSchema.index({ name: 'text', brand: 'text', model: 'text', description: 'text' });
bikeSchema.index({ category: 1, isAvailable: 1 });
bikeSchema.index({ pricePerDay: 1 });
bikeSchema.index({ averageRating: -1 });

// Virtual for reviews
bikeSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'bike',
});

module.exports = mongoose.model('Bike', bikeSchema);
