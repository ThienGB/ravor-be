const ApiError = require('../utils/ApiError');

/**
 * Middleware xử lý lỗi tập trung.
 * Phải có đủ 4 tham số (err, req, res, next) để Express nhận diện là Error Middleware.
 */
const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;
  
  if (!(err instanceof ApiError)) {
    statusCode = statusCode || 500;
    message = message || 'Internal Server Error';
  }

  const response = {
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  if (process.env.NODE_ENV === 'development') {
      console.error(err);
  }

  res.status(statusCode).json(response);
};

module.exports = {
  errorHandler,
};
