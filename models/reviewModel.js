const mongoose = require('mongoose');

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

reviewSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'user',
        select: '_id name photo'
    })
    next();
})

module.exports = mongoose.model('Reviews', reviewSchema);