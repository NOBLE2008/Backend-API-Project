const path = require('path');
const sharp = require('sharp');
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

exports.getPhotoById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await Users.findById(id);
  if (!user) {
    return next(new AppError('User wasn,t found', 404));
  }
  const imgpath = path.join(__dirname, `../public/img/users/${user.photo}`);
  res.sendFile(imgpath);
});

exports.getMyPhoto = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const user = await Users.findById(id);
  if (!user) {
    return next(new AppError('User wasn,t found', 404));
  }
  const imgpath = path.join(__dirname, `../public/img/users/${user.photo}`);
  res.sendFile(imgpath);
});

exports.photoUpload = catchAsync(async (req, res, next) => {
  console.log(req.file);
  const { id } = req.user;
  if (!req.file) {
    return next(new AppError('No Photo Uploaded', 400));
  }
  if(!req.file.mimetype.startsWith('image')) {
    return next(new AppError('Please upload an image file', 400));
  }
  req.file.filename = `user-${id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .toFile(`public/img/users/${req.file.filename}`);
  const user = await Users.findById(id);
  if (!user) {
    return next(new AppError('User wasn,t found', 404));
  }
  user.photo = req.file.filename;
  await user.save();
  res.status(200).json({
    status: 'Success',
    data: {
      user,
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

exports.updateEntireUser = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const userTest = await Users.findById(id);
  if (!userTest) {
    return next(new AppError('Tour wasn,t found', 404));
  }

  const excludedFields = [
    'password',
    'confirmPassword',
    'role',
    'permissions',
    'passwordChangedAt',
    'passwordResetToken',
    'passwordResetExpires',
  ];
  excludedFields.map((el) => delete req.body[el]);
  // eslint-disable-next-line no-constant-condition, no-cond-assign
  if ((req.body = {})) {
    return next(new AppError("You didn't update the permitted data", 400));
  }
  await Users.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'Success',
    message: 'User updated successfully',
  });
});

exports.addTourToCart = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const userTest = await Users.findById(id);
  if (!userTest) {
    return next(new AppError('User wasn,t found', 404));
  }
  const { tourId, quantity } = req.body;
  const product = await Tours.findById(tourId);
  if (!product) {
    return next(new AppError('Tour wasn,t found', 404));
  }
  const newTour = {
    tour: product._id,
    quantity: quantity,
    price: product.price,
  }
  userTest.cart.push(newTour);
  await userTest.save();
  res.status(200).json({
    status: 'Success',
    data: {
      user: userTest,
    },
  });
})

exports.myInfo = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const userTest = await Users.findById(id);
  if (!userTest) {
    return next(new AppError('User wasn,t found', 404));
  }
  res.status(200).json({
    status: 'Success',
    data: {
      user: userTest,
    },
  });
});
