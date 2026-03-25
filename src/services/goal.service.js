const Goal = require('../models/goal.model');
const Task = require('../models/task.model');
const ApiError = require('../utils/ApiError');

const createGoalWithTasks = async (userId, goalData) => {
  const { title, timeframe, pace, preferences, description, tasks } = goalData;

  const goal = await Goal.create({
    userId,
    title,
    description: description || '',
    timeframe,
    pace: pace || 'Moderate',
    preferences: preferences || { weekendsOff: false, earlyBird: true, focusFundamentals: false }
  });

  if (tasks && tasks.length > 0) {
    const mappedTasks = tasks.map((t, index) => ({
      ...t,
      title: t.title,
      description: t.description,
      startDate: t.start_date ? new Date(t.start_date) : new Date(),
      endDate: t.end_date ? new Date(t.end_date) : new Date(),
      priority: t.priority || 'medium',
      goalId: goal._id,
      order: index,
    }));
    await Task.insertMany(mappedTasks);
  }

  return goal;
};

const getGoalsByUser = async (userId) => {
  const goals = await Goal.find({ userId }).sort({ createdAt: -1 }).lean();
  
  // For each goal, fetch task statistics
  // In a real app, aggregation is better, but this is simple for now
  const goalsWithStats = await Promise.all(goals.map(async (goal) => {
    const tasks = await Task.find({ goalId: goal._id });
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    
    return {
      ...goal,
      totalTasks,
      completedTasks,
      progress: totalTasks > 0 ? (completedTasks / totalTasks) : 0
    };
  }));

  return goalsWithStats;
};

const deleteGoal = async (goalId, userId) => {
  const goal = await Goal.findOne({ _id: goalId, userId });
  if (!goal) {
    throw new ApiError(404, 'Goal not found');
  }
  
  await Task.deleteMany({ goalId: goal._id });
  await goal.deleteOne();
  return goal;
};

module.exports = {
  createGoalWithTasks,
  getGoalsByUser,
  deleteGoal,
};
