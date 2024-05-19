const Users = require('../models/userModel');
const APIFeatures = require('../utils/APIFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

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
  if (!email ||!password) {
    return next(new AppError('Please provide email and password', 400));
  }
  const user = await Users.findOne({ email }).select('+password');
  if (!user ||!(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  const token = await user.generateToken();
  res.status(200).json({
    status: 'Success',
    token
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
    token: token
  });
});

exports.changePassword = catchAsync(async (req, res, next) => {
  const {id} = req.user
  const {password, newPassword} = req.body;
  if(!password ||!newPassword){
    return next(new AppError('Please provide your current password and new password', 400));
  }
  const user = await Users.findById(id).select('+password');
 if(!(await user.correctPassword(password, user.password))){
   return next(new AppError('Incorrect password provided', 401));
}

user.password =  newPassword;
user.passwordChangedAt = Date.now();
await user.save();
})
