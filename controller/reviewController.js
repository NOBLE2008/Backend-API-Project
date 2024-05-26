const catchAsync = require("../utils/catchAsync");
const Reviews = require("../models/reviewModel");
const { deleteOne, updateOne, getAll } = require("./handlerFactory");

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

  exports.getAllReviews = getAll(Reviews)

  exports.updateReview = updateOne(Reviews)

  exports.deleteReview = deleteOne(Reviews);