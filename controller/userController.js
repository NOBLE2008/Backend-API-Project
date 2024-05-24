const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/APIFeatures');
const Users = require('../models/userModel');
const Tours = require('../models/tourModel');

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
  console.log(id);
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

exports.myTours = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  console.log(id);
  const tours = await Tours.find({guides: { $in: [id] }}).select('-guides');
  res.status(200).json({
    status: 'Success',
    data: {
      tours,
    },
  })
})

exports.updateEntireUser = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const userTest = await Users.findById(id);
  if (!userTest) {
    return next(new AppError('Tour wasn,t found', 404));
  }

  const excludedFields = ['password', 'confirmPassword', 'role', 'permissions', 'passwordChangedAt', 'passwordResetToken', 'passwordResetExpires'];
  excludedFields.map((el) => delete req.body[el]);
  // eslint-disable-next-line no-constant-condition, no-cond-assign
  if(req.body = {}){
    return next(new AppError('You didn\'t update the permitted data', 400));
  }
  await Users.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    status: 'Success',
    message: 'User updated successfully',
  });
});
