const Tours = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { reviewId } = req.params;
    const { id } = req.user;

    const review = await Model.findOne({_id: reviewId});
    if (!review) {
      return next(new AppError('Review not found', 404));
    }
    if (review.user._id.toString() !== id.toString()) {
      return next(
        new AppError(
          'You are not authorized to delete this review as you are not the person who made it',
          401,
        ),
      );
    }

    await Model.findOneAndDelete({_id: reviewId});
    res.status(204).json({
      status: 'success',
      message: 'Review deleted successfully',
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { reviewId } = req.params;
    const { id } = req.user;

    const review = await Model.findById(reviewId);
    if (!review) {
      return next(new AppError('Review not found', 404));
    }

    if (review.user._id.toString() !== id.toString()) {
      return next(
        new AppError(
          'You are not authorized to update this review as you are not the person who made it',
          401,
        ),
      );
    }
    review.review = req.body.review || review.review;
    review.rating = req.body.rating || review.rating;
    await review.save();
    res.status(200).json({
      status: 'success',
      data: {
        review,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const { tourId } = req.params;
    const reviews = await Model.find({ tour: tourId });
    res.status(200).json({
      status: 'success',
      data: {
        reviews,
      },
    });
  });

  exports.createOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const { tourId } = req.params;
        const tour = await Tours.findById(tourId);
        if (!tour) {
          return next(new AppError('The tour you\'re trying to make review for doesn\'t exist', 404));
        }
        const duplicateReview = await Model.findOne({ user: req.user.id, tour: tourId })
        if (duplicateReview) {
            return next(new AppError('You have made a Review for this tour. You can only update the review.', 401))
        }
        const review = await Model.create({
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
