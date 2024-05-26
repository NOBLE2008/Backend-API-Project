const Reviews = require("../models/reviewModel");
const { deleteOne, updateOne, getAll, createOne } = require("./handlerFactory");

  exports.createReview = createOne(Reviews)

  exports.getAllReviews = getAll(Reviews)

  exports.updateReview = updateOne(Reviews)

  exports.deleteReview = deleteOne(Reviews)