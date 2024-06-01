const os = require('os');
const fs = require('fs');
const crypto = require('crypto');
const Users = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/sendEmail');
const Sessions = require('../models/sessionModel');
const { cookieRes } = require('../utils/cookieRes');

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
  await Sessions.create({
    jtok: token,
    ip: req.ip,
    device: os.hostname(),
    email: req.body.email,
    date: Date.now(),
  });
  cookieRes(res, token);
  res.status(200).json({
    status: 'Success',
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const userTest = await Users.findById(id).select('+active');
  if (!userTest) {
    return next(new AppError('User wasn,t found', 404));
  }

  userTest.active = false;
  await userTest.save();
  res.status(204).json({
    status: 'Success',
    message: 'User deleted successfully',
  });
});

exports.signUp = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  console.log(process.env.JWT_SECRET);
  const User = await Users.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });
  const token = await User.generateToken();

  await Sessions.create({
    jtok: token,
    ip: req.ip,
    device: os.hostname(),
    email: req.body.email,
    date: Date.now(),
  });
  const emailSubject = 'Welcome to Kaitind Resturant!';
  const emailText = `Welcome to Our Online Shop!
  Thank you for joining us. We're excited to have you as part of our community.
  Explore our latest products, exclusive offers, and more. If you have any questions, feel free to reach out to our support team.
  Happy shopping!`;
  fs.readFile(
    `${__dirname}/../Emails/welcome.html`,
    'utf8',
    async (err, data) => {
      new Email(email, emailSubject, emailText, data).sendEmail(res, next);

      if (err) {
        console.log(err);
        return next(
          new AppError('Something went really wrong. Try again.', 500),
        );
      }
    },
  );
  cookieRes(res, token);
  res.status(200).json({
    status: 'Success',
  });
});

exports.getLoggedInUser = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const user = await Users.findById(id);
  const session = await Sessions.find({ email: user.email }).select(
    '-_id -__v',
  );
  res.status(200).json({
    status: 'Success',
    data: {
      session: session,
    },
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
  const user = await Users.findById(id).select('+password +passwordChangedAt');
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
  const user = await Users.findOne({ email });
  if (!user) {
    return next(new AppError('There is no user with this email', 404));
  }
  const token = await user.generatePasswordResetToken();
  const resetUrl = `http://localhost:${process.env.PORT}/api/v2/users/reset-password/${token}`;
  const emailText = `A password reset has been initiated. click on the link below to reset your password. ${resetUrl}`;
  const emailSubject = 'Password Reset';
  fs.readFile(`${__dirname}/../Emails/passwordreset.html`, 'utf-8', (err, data) => {
    if(err){
      console.log(err);
      return next(new AppError('Something went really wrong. Try again.', 500));
    }
    const emailHtml = data.replace('{{url}}', resetUrl).replace('{{firstname}}', user.name.split(' ')[0]);
    new Email(email, emailSubject, emailText, emailHtml).sendEmail(res, next);
  })
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const { newPassword } = req.body;
  const user = await Users.findOne({ passwordResetToken: hashedToken }).select(
    '+password +passwordChangedAt +passwordResetExpires +PasswordResetToken',
  );
  if (!user) {
    return next(new AppError('Invalid token', 400));
  }
  if (Date.now() > user.passwordResetExpires) {
    return next(new AppError('Password reset timeout try again.', 400));
  }
  if (!newPassword) {
    return next(new AppError('Please provide your new password', 400));
  }
  user.password = newPassword;
  user.passwordChangedAt = Date.now();
  user.passwordResetToken = '';
  user.passwordResetExpires = undefined;
  console.log(user);
  await user.save();
  res.status(200).json({
    status: 'success',
    message: 'Password changed successfully',
  });
});
exports.logOutUser = catchAsync(async (req, res, next) => {
  const { ip } = req.body;
  await Sessions.deleteMany({ ip });
  res.status(200).json({
    status: 'Success',
    message: 'Device logged out successfully',
  });
});
