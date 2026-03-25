const Joi = require('joi');

const taskSchema = Joi.object().keys({
  title: Joi.string().required(),
  description: Joi.string().optional().allow(''),
  start_date: Joi.string().optional(),
  end_date: Joi.string().optional(),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
});

const createGoal = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().optional().allow(''),
    timeframe: Joi.string().required(),
    pace: Joi.string().optional().default('Moderate'),
    preferences: Joi.object().keys({
        weekendsOff: Joi.boolean().default(false),
        earlyBird: Joi.boolean().default(true),
        focusFundamentals: Joi.boolean().default(false)
    }).optional(),
    tasks: Joi.array().items(taskSchema).optional(),
  }),
};

// Endpoint gộp: generate AI plan rồi lưu thẳng vào DB
const generateAndSave = {
  body: Joi.object().keys({
    goal: Joi.string().required(),
    timeframe: Joi.string().required(),
    pace: Joi.string().optional().default('Moderate'),
    preferences: Joi.object().keys({
        weekendsOff: Joi.boolean().default(false),
        earlyBird: Joi.boolean().default(true),
        focusFundamentals: Joi.boolean().default(false)
    }).optional(),
  }),
};

module.exports = {
  createGoal,
  generateAndSave,
};
