const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
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
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    title: {
      type: String,
      required: [true, 'Review title is required'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// One review per user per bike
reviewSchema.index({ user: 1, bike: 1 }, { unique: true });

// Static method: update bike average rating
reviewSchema.statics.updateBikeRating = async function (bikeId) {
  const stats = await this.aggregate([
    { $match: { bike: bikeId, isVisible: true } },
    {
      $group: {
        _id: '$bike',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  const Bike = require('./Bike');
  if (stats.length > 0) {
    await Bike.findByIdAndUpdate(bikeId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].count,
    });
  } else {
    await Bike.findByIdAndUpdate(bikeId, {
      averageRating: 0,
      totalReviews: 0,
    });
  }
};

// Update rating after save
reviewSchema.post('save', function () {
  this.constructor.updateBikeRating(this.bike);
});

// Update rating after delete
reviewSchema.post('remove', function () {
  this.constructor.updateBikeRating(this.bike);
});

reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.updateBikeRating(doc.bike);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
