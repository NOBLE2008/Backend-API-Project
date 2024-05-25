const catchAsync = require("../utils/catchAsync");
const Reviews = require("../models/reviewModel");

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