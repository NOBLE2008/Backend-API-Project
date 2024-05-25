const Tours = require('../models/tourModel');
const APIFeatures = require('../utils/APIFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

//Get all tours
exports.getAllTours = catchAsync(async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const features = new APIFeatures(Tours.find(), req.query)
    .filter()
    .sort()
    .fields()
    .alias(next)
    .paginate();
  if (req.query.page) {
    const numDocuments = await Tours.countDocuments();
    const pageCount = req.query.page * 1 * 3;
    if (numDocuments < pageCount) {
      next(new AppError('The page does not exist', 400))
    } else if (pageCount <= 0) {
      next(new AppError('The page does not exist', 400))
    }
  }

  const tours = await features.query.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  res.status(200).json({
    status: 'Success',
    currentPage: page,
    tourLength: tours.length,
    data: {
      tours,
    },
  });
})

exports.aggregate = catchAsync(async (req, res, next) => {
    const aggregateFeature = new APIFeatures(Tours, req.query)
      .aggregateDifficulty()
      .paginate();
    const stats = await aggregateFeature.query;

    const page = req.query.page || 1;

    res.status(200).json({
      status: 'Success',
      currentPage: page,
      tourLength: stats.length,
      data: {
        stats,
      },
    });
})

exports.aggregateMonthly = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Tours, req.params).aggregateMonthly();
    const stats = await features.query;

    res.status(200).json({
      status: 'Success',
      tourLength: stats.length,
      data: {
        stats,
      },
    });
})

//Get tour by Id
exports.getTourById = catchAsync(async (req, res, next) => {
    const {id} = req.params;
    const tour = await Tours.findById(id).populate({
      path: 'guides',
      select: '-__v -passwordChangedAt',
    });
    if(!tour){
      return next(new AppError('Tour wasn,t found', 404))
    }
    res.status(200).json({
      status: 'Success',
      data: {
        tour,
      },
    });
})

//Update entire tour (PUT)
exports.updateEntireTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const tourTest = await Tours.findById(id);
  if(!tourTest){
    return next(new AppError('Tour wasn,t found', 404))
  }
    const tour = await Tours.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate({
      path: 'guides',
      select: '-__v -passwordChangedAt',
    });
    res.status(200).json({
      status: 'Success',
      data: {
        tour,
      },
    });
})

//Post new tour
exports.addNewTour = catchAsync(async (req, res, next) => {
    const tour = (await Tours.create(req.body)).populate({
      path: 'guides',
      select: '-__v -passwordChangedAt',
    });
    res.status(200).json({
      status: 'Success',
      data: {
        tour,
      },
    });
})

//Delete a tour
exports.deleteATour = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Tours.findByIdAndDelete(id);
    res.status(204).json({
      status: 'Success',
      data: null,
    });
})

exports.updateTourPartially = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Tours.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
    const newTour = await Tours.findById(id).populate({
      path: 'guides',
      select: '-__v -passwordChangedAt',
    });
    res.status(200).json({
      status: 'Success',
      data: {
        newTour,
      },
    });
  });

  
exports.myTours = catchAsync(async (req, res, next) => {
  const { id } = req.user;
  const tours = await Tours.find({guides: { $in: [id] }}).select('-guides');
  res.status(200).json({
    status: 'Success',
    data: {
      tours,
    },
  })
})
