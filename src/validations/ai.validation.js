const Joi = require('joi');

const generatePlan = {
  body: Joi.object().keys({
    goal: Joi.string().required().min(5).max(500),
  }),
};

module.exports = {
  generatePlan,
};
