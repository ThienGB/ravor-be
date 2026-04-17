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
    const today = new Date();
    const mappedTasks = tasks.map((t, index) => {
      // Tính toán ngày dựa trên "Day X"
      const dayStr = String(t.day || '1');
      const dayOffset = parseInt(dayStr.replace(/\D/g, '') || '1') - 1;
      const scheduledDate = new Date(today);
      scheduledDate.setDate(today.getDate() + dayOffset);
      
      // Gán giờ nếu có startTime (HH:mm)
      const startTimeStr = String(t.startTime || '');
      if (startTimeStr.includes(':')) {
          const [hours, minutes] = startTimeStr.split(':');
          scheduledDate.setHours(parseInt(hours), parseInt(minutes), 0);
      }

      return {
        goalId: goal._id,
        title: t.task || t.title,
        description: t.description || '',
        day: t.day,
        timeOfDay: t.timeOfDay,
        startTime: t.startTime,
        duration: t.duration,
        priority: (t.priority || 'medium').toLowerCase(),
        resourceLink: t.resourceLink || t.link || '',
        scheduledAt: scheduledDate,
        order: index,
      };
    });
    await Task.insertMany(mappedTasks);
  }
 
  // Trả về object goal đầy đủ kèm task và stats
  return getGoalById(goal._id, userId);
};

const getGoalsByUser = async (userId) => {
  const goals = await Goal.find({ userId }).sort({ createdAt: -1 }).lean();
  
  // For each goal, fetch task statistics
  // In a real app, aggregation is better, but this is simple for now
  const goalsWithStats = await Promise.all(goals.map(async (goal) => {
    const tasks = await Task.find({ goalId: goal._id });
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.isDone).length;
    
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

const getGoalById = async (goalId, userId) => {
  const goal = await Goal.findOne({ _id: goalId, userId }).lean();
  if (!goal) {
    throw new ApiError(404, 'Goal not found');
  }

  // Fetch tasks
  const tasks = await Task.find({ goalId: goal._id }).sort({ order: 1 });
  
  // Calculate progress
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.isDone).length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) : 0;

  return {
    ...goal,
    tasks,
    totalTasks,
    completedTasks,
    progress
  };
};

const updateGoalStatus = async (goalId, userId, status) => {
  const goal = await Goal.findOne({ _id: goalId, userId });
  if (!goal) {
    throw new ApiError(404, 'Goal not found');
  }
  goal.status = status;
  await goal.save();
  return getGoalById(goalId, userId);
};

const updateGoal = async (goalId, userId, updateBody) => {
  const goal = await Goal.findOne({ _id: goalId, userId });
  if (!goal) {
    throw new ApiError(404, 'Goal not found');
  }
  Object.assign(goal, updateBody);
  await goal.save();
  return getGoalById(goalId, userId);
};

module.exports = {
  createGoalWithTasks,
  getGoalsByUser,
  getGoalById,
  deleteGoal,
  updateGoalStatus,
  updateGoal,
};
