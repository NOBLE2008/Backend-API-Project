const crypto = require('crypto');
const Users = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { sendEmail } = require('../utils/sendEmail');


exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  const user = await Users.findOne({ email }).select('+password');
  console.log(user);
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  const token = await user.generateToken();
  res.status(200).json({
    status: 'Success',
    token,
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
})



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
  const resetUrl = `http://localhost:${process.env.PORT}/api/v2/users/reset-password/${token}`;
  const emailText = `A password reset has been initiated. click on the link below to reset your password. ${resetUrl}`;
  const emailSubject = 'Password Reset';
  const emailHtml = `<h1 style="color: blue;">Password reset</h1>
  <p>A password reset has been initiated. click on the button below to reset your password.</p>
  <a href="${resetUrl}"><button style="background-color: blue; color: white; padding: 10px; text-decoration: none; display: inline-block">Reset Password</button></a>`;

  const emailUser = sendEmail(email, emailSubject, emailText, emailHtml);
  await emailUser(req, res, next);
  res.status(200).json({
    status: 'Success',
    message: 'Token sent to email'
  });
});

exports.changePassword = catchAsync(async (req, res, next) => {
  const {id} = req.user
  console.log(id)
  const {password, newPassword} = req.body;
  if(!password ||!newPassword){
    return next(new AppError('Please provide your current password and new password', 400));
  }
  const user = await Users.findById(id).select('+password');
 if(!(await user.correctPassword(password))){
   return next(new AppError('Incorrect password provided', 401));
}

user.password =  newPassword;
user.passwordChangedAt = Date.now();
await user.save();
res.status(200).json({
  status: 'success',
  message: 'Password changed successfully'
})
})

exports.resetPassword = catchAsync(async (req, res, next) => {
  const {token} = req.params;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const {newPassword} = req.body;
  const user = await Users.findOne({passwordResetToken: hashedToken}).select('+password');
  console.log(user)
  if(!user){
    return next(new AppError('Invalid token', 400));
  }
  if(Date.now() > user.passwordResetExpires){
    return next(new AppError('Password reset timeout try again.', 400));
  }
  if(!newPassword){
    return next(new AppError('Please provide your new password', 400));
  }
  user.password =  newPassword;
  user.passwordChangedAt = Date.now();
  user.passwordResetToken = '';
  user.passwordResetExpires = undefined;
  console.log(user)
  await user.save();
  res.status(200).json({
    status:'success',
    message: 'Password changed successfully'
  })
})
