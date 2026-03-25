const rateLimit = require('express-rate-limit');

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes.' },
  skipFailedRequests: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: { success: false, message: 'Too many auth requests from this IP, please try again after 15 minutes.' },
  skipSuccessfulRequests: true,
});

module.exports = {
  aiLimiter,
  authLimiter,
};
