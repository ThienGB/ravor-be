const ApiError = require('../utils/ApiError');

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

  res.status(statusCode || 500).json(response);
};

module.exports = {
  errorHandler,
};
