const AppError = require('../utils/appError');

const sendErrorProd = (err, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    fields: err.fields || null
  });

const sendErrorDev = (err, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });

const handleCastError = (res) => {
  const error = new AppError("Tour wasn't Found.", 400);
  return sendErrorProd(error, res);
};

const handleDuplicateFields = (res) => {
  const error = new AppError(
    'User with specified email already exists',
    401,
  );
  return sendErrorProd(error, res);
};

const handleValidationError = (err, res) => {
  const errors = Object.values(err.errors).map(el => el.message)
  const error = new AppError(
    'Validation Failed',
    401,
  );
  error.fields = errors;
  return sendErrorProd(error, res);
};

const errorMiddleware = (err, req, res, next) => {
  err.status = err.status || 'error';
  err.statusCode = err.statusCode || 500;
  console.log(res.statusCode);
  console.log(process.env.NODE_ENV);

  if (process.env.NODE_ENV === 'production') {
    if (err.name === 'CastError') {
      return handleCastError(res);
    } else if (err.code === 11000) {
      return handleDuplicateFields(res);
    }else if(err.name === 'ValidationError'){
      return handleValidationError(err, res)
    }
    sendErrorProd(err, res);
  }
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  }
};

module.exports = errorMiddleware;
