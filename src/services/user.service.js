const User = require('../models/user.model');
const Goal = require('../models/goal.model');
const Task = require('../models/task.model');
const ApiError = require('../utils/ApiError');

const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Calculate stats
  const goalsCount = await Goal.countDocuments({ userId });
  
  // Tasks stats
  const goals = await Goal.find({ userId }).select('_id');
  const goalIds = goals.map(g => g._id);
  
  const totalTasks = await Task.countDocuments({ goalId: { $in: goalIds } });
  const completedTasks = await Task.countDocuments({ goalId: { $in: goalIds }, isDone: true });

  return {
    user,
    stats: {
      goalsCount,
      totalTasks,
      completedTasks,
      achievementPoints: completedTasks * 10 // Example point system
    }
  };
};

const deleteUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Delete all tasks associated with user's goals
  const goals = await Goal.find({ userId }).select('_id');
  const goalIds = goals.map(g => g._id);
  await Task.deleteMany({ goalId: { $in: goalIds } });

  // Delete all goals
  await Goal.deleteMany({ userId });

  // Delete the user
  await user.deleteOne();
  
  return user;
};

module.exports = {
  getUserProfile,
  deleteUser,
};
