const catchAsync = require("../utils/catchAsync");
const Reviews = require("../models/reviewModel");
const AppError = require("../utils/appError");

exports.createReview = catchAsync(async (req, res, next) => {
    const { tourId } = req.params;
    const review = await Reviews.create({
      user: req.user.id,
      tour: tourId,
      review: req.body.review,
      rating: req.body.rating,
    });
    res.status(201).json({
      status:'success',
      data: {
        review,
      },
    });
  });

  exports.getAllReviews = catchAsync(async (req, res, next) => {
    const { tourId } = req.params;
    const reviews = await Reviews.find({ tour: tourId });
    res.status(200).json({
      status:'success',
      data: {
        reviews,
      },
    });
  });

  exports.updateReview = catchAsync(async (req, res, next) => {
    const { reviewId } = req.params;
    const {id} = req.user;

    const review = await Reviews.findById(reviewId)
    if (!review) {
      return next(new AppError('Review not found', 404));
    }
    
    if(review.user.toString()!== id.toString()) {
      return next(new AppError('You are not authorized to update this review as you are not the person who made it', 401));
    }
    review.review = req.body.review || review.review;
    review.rating = req.body.rating || review.rating;
    await review.save();
    res.status(200).json({
      status:'success',
      data: {
        review,
      },
    });
  });

  exports.deleteReview = catchAsync(async (req, res, next) => {
    const { reviewId } = req.params;
    const {id} = req.user;

    const review = await Reviews.findById(reviewId)
    if (!review) {
      return next(new AppError('Review not found', 404));
    }
    if(review.user.toString()!== id.toString()) {
      return next(new AppError('You are not authorized to update this review as you are not the person who made it', 401));
    }

    await Reviews.findByIdAndDelete(reviewId);
    res.status(204).json({
      status:'success',
      data: null,
    });
  })