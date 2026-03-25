const catchAsync = require('../utils/catchAsync');
const goalService = require('../services/goal.service');
const aiService = require('../services/ai.service');

const createGoal = catchAsync(async (req, res) => {
  const goal = await goalService.createGoalWithTasks(req.user._id, req.body);
  res.status(201).json({ success: true, data: goal });
});

const getGoals = catchAsync(async (req, res) => {
  const goals = await goalService.getGoalsByUser(req.user._id);
  res.json({ success: true, data: goals });
});

const deleteGoal = catchAsync(async (req, res) => {
  await goalService.deleteGoal(req.params.id, req.user._id);
  res.json({ success: true, message: 'Goal deleted successfully' });
});

// Gộp: AI generate plan → lưu vào DB → trả về goal + tasks
const generateAndSave = catchAsync(async (req, res) => {
  const { goal: goalText, timeframe, pace, preferences } = req.body;
  
  // AI tạo kế hoạch dựa trên các tham số cá nhân hóa
  const aiPlan = await aiService.generatePlan({
    goal: goalText,
    timeframe,
    pace,
    preferences
  });

  // Lưu vào DB kèm theo các preferences của người dùng
  const saved = await goalService.createGoalWithTasks(req.user._id, {
      ...aiPlan,
      timeframe,
      pace,
      preferences
  });

  res.status(201).json({ success: true, data: saved });
});

module.exports = {
  createGoal,
  getGoals,
  deleteGoal,
  generateAndSave,
};
