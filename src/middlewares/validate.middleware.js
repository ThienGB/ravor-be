const Joi = require('joi');
const ApiError = require('../utils/ApiError');
const pick = require('../utils/pick');

/**
 * Middleware để validate request chống lại schema đã định nghĩa.
 * Tự động bóc tách body, query, hoặc params để validate.
 */
const validate = (schema) => (req, res, next) => {
  const validSchema = pick(schema, ['params', 'query', 'body']);
  const object = pick(req, Object.keys(validSchema));
  
  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(object);

  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    return next(new ApiError(400, errorMessage));
  }
  
  // Gán lại các giá trị đã được sanitize/validate vào request
  Object.assign(req, value);
  return next();
};

module.exports = validate;
