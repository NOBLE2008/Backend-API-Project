const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Sessions = require('../models/sessionModel');

exports.isAuth = catchAsync(async (req, res, next) => {
  if (
    !req.cookies.jwt
  ) {
    return next(new AppError('You are not authorized', 401));
  }
  const token = req.cookies.jwt;
  req.token = token;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if(!user) {
    await Sessions.deleteMany({ip: req.ip});
    return next(new AppError('You are no more logged into your account.', 404));
  }
  if (await user.passwordChangedAfter(decoded.iat)) {
    await Sessions.deleteMany({ip: req.ip});
    return next(
      new AppError(
        'Password has been changed recently. Login to regain access',
        401,
      ),
    );
  }
  const session = await Sessions.findOne({jtok: token});
  if(!session) {
    return next(new AppError('You\'ve been logged out of your account. Login to regain access', 401));
  }
  req.user = decoded;
  next();
});

exports.restrictTo = (roles) => catchAsync( async (req, res, next) => {
  let authenticated = false;
  const { permissions } = await User.findById(req.user.id);
  roles.forEach((e) => {
    if (permissions.includes(e)) {
      authenticated = true;
    }
  });
  if (!authenticated) {
    return next(
      new AppError('You are not authorized to perform this action', 401),
    );
  }
  next();
});

exports.isAuthAdmin = catchAsync(async (req, res, next) => {
    const { role } = await User.findById(req.user.id);
    if (role === 'Admin') {
        return next();
    }
    return next(new AppError('You are not authorized to perform this action', 401));
});

