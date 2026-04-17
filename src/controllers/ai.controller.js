const catchAsync = require('../utils/catchAsync');
const aiService = require('../services/ai.service');

const generatePlan = catchAsync(async (req, res) => {
  const { goal } = req.body;
  const plan = await aiService.generatePlan({ goal });
  res.json({ success: true, data: plan });
});

module.exports = {
  generatePlan,
};
