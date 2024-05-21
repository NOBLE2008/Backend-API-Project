const Users = require('../models/userModel');
const APIFeatures = require('../utils/APIFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { sendEmail } = require('../utils/sendEmail');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const features = new APIFeatures(Users.find(), req.query)
    .filter()
    .sort()
    .fields()
    .alias(next)
    .paginate();
  if (req.query.page) {
    const numDocuments = await Users.countDocuments();
    const pageCount = req.query.page * 1 * 3;
    if (numDocuments < pageCount) {
      next(new AppError('The page does not exist', 400));
    } else if (pageCount <= 0) {
      next(new AppError('The page does not exist', 400));
    }
  }

  const users = await features.query;
  res.status(200).json({
    status: 'Success',
    currentPage: page,
    userLength: users.length,
    data: {
      users,
    },
  });
});

exports.getUserById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await Users.findById(id);
  if (!user) {
    return next(new AppError('user wasn,t found', 404));
  }
  res.status(200).json({
    status: 'Success',
    data: {
      user,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  const user = await Users.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  const token = await user.generateToken();
  res.status(200).json({
    status: 'Success',
    token,
  });
});

exports.updateEntireUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userTest = await Users.findById(id);
  if (!userTest) {
    return next(new AppError('Tour wasn,t found', 404));
  }
  const user = await Users.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'Success',
    data: {
      user,
    },
  });
});

exports.signUp = catchAsync(async (req, res, next) => {
  console.log(process.env.JWT_SECRET);
  const User = await Users.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });
  const token = await User.generateToken();
  res.status(200).json({
    status: 'Success',
    token: token,
  });
});

exports.changePassword = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  console.log(id);
  const { password, newPassword } = req.body;
  if (!password || !newPassword) {
    return next(
      new AppError(
        'Please provide your current password and new password',
        400,
      ),
    );
  }
  const user = await Users.findById(id).select('+password');
  if (!(await user.correctPassword(password))) {
    return next(new AppError('Incorrect password provided', 401));
  }

  user.password = newPassword;
  user.passwordChangedAt = Date.now();
  await user.save();
  res.status(200).json({
    status: 'success',
    message: 'Password changed successfully',
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  console.log(email);
  const user = await Users.findOne({ email });
  if (!user) {
    return next(new AppError('There is no user with this email', 404));
  }
  const token = await user.generatePasswordResetToken();
  const resetUrl = `http://localhost:${process.env.PORT}/api/v2/reset-password/${token}`;
  const emailText = `A password reset has been initiated. click on the link below to reset your password. ${resetUrl}`;
  const emailSubject = 'Password Reset';
  const emailHtml = `<h1 style="color: blue;">Password reset</h1>
  <p>A password reset has been initiated. click on the button below to reset your password.</p>
  <a href="${resetUrl}"><button style="background-color: blue; color: white; padding: 10px; text-decoration: none; display: inline-block">Reset Password</button></a>`;

  const emailUser = sendEmail(email, emailSubject, emailText, emailHtml);
  await emailUser(req, res, next);
  res.status(200).json({
    status: 'Success',
    message: 'Token sent to email',
  });
});
