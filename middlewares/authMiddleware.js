const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.isAuth = catchAsync(async (req, res, next) => {
    if(!req.headers.authorization || !req.headers.authorization.startsWith("Bearer")){
        return next(new AppError("You are not authorized", 401));
    }
});
