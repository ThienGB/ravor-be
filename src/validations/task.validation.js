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

const createTask = {
  body: Joi.object().keys({
    goalId: Joi.string().required(),
    title: Joi.string().required(),
    description: Joi.string().optional().allow(''),
    resourceLink: Joi.string().optional().allow(''),
    day: Joi.number().integer().optional(),
    timeOfDay: Joi.string().optional(),
    startTime: Joi.string().optional(),
    duration: Joi.string().optional(),
    priority: Joi.string().valid('low', 'medium', 'high').optional().default('medium'),
    order: Joi.number().integer().optional(),
  }),
};

module.exports = {
  createTask,
  updateTask,
};
