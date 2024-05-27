const AppError = require('../utils/appError');
const Sessions = require('../models/sessionModel');

const sendErrorProd = (err, res) => 
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    fields: err.fields || null
  })
const sendErrorDev = (err, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });

const handleCastError = (res) => {
  const error = new AppError("Invalid Request Format", 400);
  return sendErrorProd(error, res);
};

const handleDuplicateFields = (res, err) => {
  if(err.keyPattern.email){
    const error = new AppError(
      'User with specified email already exists',
      401,
    );
    
  return sendErrorProd(error, res);
  }if(!err.keyPattern.email){
    const error = new AppError(
      'Invalid Input. Try Again',
      401,
    );
    
  return sendErrorProd(error, res);
  }
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

const handleTokenExpired = async (err, res, req) => {
  await Sessions.deleteMany({jtok: req.token});
  const error = new AppError('Session has expired', 401);
  return sendErrorProd(error, res);
}

const handleTokenError = (err, res) => {
  const error = new AppError('Invalid Token. Try logging in again', 401);
  return sendErrorProd(error, res);
}

const handleJWTMalformedError = (err, res) => {
  const error = new AppError('Invalid Token. Try logging in again', 401);
  return sendErrorProd(error, res);
}

const errorMiddleware = (err, req, res, next) => {
  console.log(err);
  err.status = err.status || 'error';
  err.statusCode = err.statusCode || 500;
  console.log(res.statusCode);
  console.log(process.env.NODE_ENV);

  if (process.env.NODE_ENV === 'production') {
    if (err.name === 'CastError') {
      return handleCastError(res);
    } if (err.code === 11000) {
      return handleDuplicateFields(res, err);
    } if(err.name === 'ValidationError'){
      return handleValidationError(err, res)
    } if(err.name === 'TokenExpiredError'){
      return handleTokenExpired(err, res, req)
    } if(err.name === 'JsonWebTokenError'){
      return handleTokenError(err, res)
    }if(err.message === 'jwt malformed'){
      return handleJWTMalformedError(err, res)
    }
    sendErrorProd(err, res);
  }
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  }
};

module.exports = errorMiddleware;