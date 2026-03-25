const Joi = require('joi');

const updateTask = {
  body: Joi.object().keys({
    isDone: Joi.boolean().optional(),
    startDate: Joi.string().optional(),
    endDate: Joi.string().optional(),
    title: Joi.string().optional(),
    description: Joi.string().optional().allow(''),
    priority: Joi.string().valid('low', 'medium', 'high').optional(),
  }),
};

module.exports = {
  updateTask,
};
