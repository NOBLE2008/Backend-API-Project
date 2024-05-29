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
      next(new AppError('The page does not exist', 400));
    } else if (pageCount <= 0) {
      next(new AppError('The page does not exist', 400));
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
});

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
});

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
});

//Get tour by Id
exports.getTourById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const tour = await Tours.findById(id)
    .populate({
      path: 'guides',
      select: '-__v -passwordChangedAt',
    })
    .populate({
      path: 'reviews',
      select: '-__v -passwordChangedAt',
    });
  if (!tour) {
    return next(new AppError('Tour wasn,t found', 404));
  }
  res.status(200).json({
    status: 'Success',
    data: {
      tour,
    },
  });
});

//Update entire tour (PUT)
exports.updateEntireTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const tourTest = await Tours.findById(id);
  if (!tourTest) {
    return next(new AppError('Tour wasn,t found', 404));
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
});

//Post new tour
exports.addNewTour = catchAsync(async (req, res, next) => {
  const tour = (await Tours.create(req.body)).populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  tour.ratingsAverage = 0;
  tour.ratingsQuantity = 0;
  await tour.save();
  res.status(200).json({
    status: 'Success',
    data: {
      tour,
    },
  });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  if (!distance || !latlng) {
    return next(new AppError('Invalid Request. Try Again', 400));
  }
  let radians;
  let tunit
  if(!unit){
    radians = distance / 3959;
    tunit ='mi'
  }
  if(unit ==='mi'){
    radians = distance / 3959;
    tunit ='mi'
  }if(unit === 'km'){
    radians = distance / 6371;
    tunit ='km'
  }if(unit !=='mi' && unit!== 'km'){
    radians = distance / 3959;
    tunit ='mi'
  }
  const [lat, lng] = latlng.split(',');
  const tours = await Tours.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lat, lng], radians],
      },
    },
  });
  res.status(200).json({
    status: 'success',
    distanceUnit: tunit,
    tourLength: tours.length,
    tours,
  });
});

//Delete a tour
exports.deleteATour = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  await Tours.findByIdAndDelete(id);
  res.status(204).json({
    status: 'Success',
    data: null,
  });
});

exports.distanceCheck = catchAsync(async (req, res, next) => {
  const { lnglat, unit } = req.params;
  const [lng, lat] = lnglat.split(',');
  let multiplier
  let tunit
  if(!unit){
    multiplier = 0.000621371
    tunit ='mi'
  }
  if(unit ==='mi'){
    multiplier = 0.000621371
    tunit ='mi'
  }if(unit === 'km'){
    multiplier = 0.001
    tunit ='km'
  }if(unit !=='mi' && unit!== 'km'){
    multiplier = 0.000621371
    tunit ='mi'
  }
  const distances = await Tours.aggregate([{
    $geoNear:{
      near: {
        type: 'Point',
        coordinates: [lng*1, lat*1],
      },
      distanceField: 'distance',
      distanceMultiplier: multiplier, 
    }
  },
  {
    $project: {
      distance: 1,
      name: 1
    }
  }    
]);

res.status(200).json({
  status: 'Success',
  data: {
    unit: tunit,
    distances,
  },
})
});

exports.updateTourPartially = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  await Tours.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
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
  const tours = await Tours.find({ guides: { $in: [id] } }).select('-guides');
  res.status(200).json({
    status: 'Success',
    data: {
      tours,
    },
  });
});
