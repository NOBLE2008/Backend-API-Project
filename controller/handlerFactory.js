const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.deleteOne = (Model) =>
    catchAsync(async(req, res, next) =>{
        const { reviewId } = req.params;
        const {id} = req.user;
    
        const review = await Model.findById(reviewId)
        if (!review) {
          return next(new AppError('Review not found', 404));
        }
        if(review.user._id.toString()!== id.toString()) {
          return next(new AppError('You are not authorized to delete this review as you are not the person who made it', 401));
        }
    
        await Model.findByIdAndDelete(reviewId);

        res.status(204).json({
          status:'success',
          message: 'Review deleted successfully'
        })
    })