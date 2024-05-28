const mongoose = require('mongoose');
const Tours = require('./tourModel');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'A review must have a review Content']
    },
    rating: {
        type: Number,
        required: [true, 'A review must have a rating'],
        min: [1, 'A review must have a rating of at least 1'],
        max: [5, 'A review must have a rating of at most 5']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tours',
        required: [true, 'A review must belong to a tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'Users',
        required: [true, 'A review must belong to a user']
    }
})

reviewSchema.statics.calcAverageRating = async function(tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ])
    if (stats.length > 0) {
        stats[0].avgRating = Number(stats[0].avgRating.toFixed(1));
        await Tours.findByIdAndUpdate(tourId, {
          ratingsQuantity: stats[0].nRating,
          ratingsAverage: stats[0].avgRating
        });
      } else {
        await Tours.findByIdAndUpdate(tourId, {
          ratingsQuantity: 0,
          ratingsAverage: 0
        });
      }
}

reviewSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'user',
        select: '_id name photo'
    })
    next();
})




reviewSchema.post('save', async function() {
    this.constructor.calcAverageRating(this.tour)
})

reviewSchema.pre(/^findOneAnd/, async function(next) {
    this.r = await this.model.findOne();
    next();
});

reviewSchema.post(/^findOneAnd/, async function() {
    await this.model.calcAverageRating(this.r.tour)
})

module.exports = mongoose.model('Reviews', reviewSchema);