const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    bike: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bike',
      required: [true, 'Bike is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    totalDays: {
      type: Number,
      required: true,
      min: [1, 'Minimum 1 day booking required'],
    },
    pricePerDay: {
      type: Number,
      required: true,
    },
    securityDeposit: {
      type: Number,
      required: true,
      default: 0,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    bookingStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'active', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded', 'partial'],
      default: 'unpaid',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'online', 'card'],
      default: 'cash',
    },
    pickupLocation: {
      type: String,
      default: 'Main Branch',
    },
    dropoffLocation: {
      type: String,
      default: 'Main Branch',
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    adminNotes: {
      type: String,
      maxlength: [500, 'Admin notes cannot exceed 500 characters'],
    },
    approvedAt: Date,
    rejectedAt: Date,
    cancelledAt: Date,
    completedAt: Date,
    cancelledBy: {
      type: String,
      enum: ['user', 'admin'],
    },
    cancellationReason: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
bookingSchema.index({ user: 1, bookingStatus: 1 });
bookingSchema.index({ bike: 1, bookingStatus: 1 });
bookingSchema.index({ startDate: 1, endDate: 1 });
bookingSchema.index({ createdAt: -1 });

// Validate end date > start date
bookingSchema.pre('validate', function (next) {
  if (this.startDate && this.endDate) {
    if (this.endDate <= this.startDate) {
      this.invalidate('endDate', 'End date must be after start date');
    }
    // Calculate total days
    const diffTime = Math.abs(this.endDate - this.startDate);
    this.totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    this.subtotal = this.totalDays * this.pricePerDay;
    this.totalAmount = this.subtotal + this.securityDeposit;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
