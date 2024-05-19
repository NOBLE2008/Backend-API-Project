const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.isAuth = catchAsync(async (req, res, next) => {
    if(!req.headers.authorization || !req.headers.authorization.startsWith("Bearer")){
        return next(new AppError("You are not authorized", 401));
    }
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if(await user.passwordChangedAt){
        return next(new AppError("Password has been changed recently. Login to regain access", 401));
    }
    req.user = decoded;
    next();
});
