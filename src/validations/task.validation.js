const Joi = require('joi');

const updateTask = {
  body: Joi.object().keys({
    isDone: Joi.boolean().optional(),
    title: Joi.string().optional(),
    description: Joi.string().optional().allow(''),
    resourceLink: Joi.string().optional().allow(''),
    day: Joi.number().integer().optional(),
    timeOfDay: Joi.string().optional(),
    startTime: Joi.string().optional(),
    duration: Joi.string().optional(),
    priority: Joi.string().valid('low', 'medium', 'high').optional(),
    order: Joi.number().integer().optional(),
    scheduledAt: Joi.string().isoDate().optional(),
  }),
};

module.exports = {
  updateTask,
};
