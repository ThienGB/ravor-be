const Task = require('../models/task.model');
const Goal = require('../models/goal.model');
const ApiError = require('../utils/ApiError');

const getTasksByGoal = async (goalId, userId) => {
  // ensure the goal belongs to the user
  const goal = await Goal.findOne({ _id: goalId, userId });
  if (!goal) {
    throw new ApiError(404, 'Goal not found');
  }

  return Task.find({ goalId }).sort({ order: 1 });
};

const updateTask = async (taskId, updateBody, userId) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  const goal = await Goal.findOne({ _id: task.goalId, userId });
  if (!goal) {
    throw new ApiError(403, 'Not authorized to modify this task');
  }

  Object.assign(task, updateBody);
  await task.save();
  return task;
};

const getTaskById = async (taskId, userId) => {
  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  const goal = await Goal.findOne({ _id: task.goalId, userId });
  if (!goal) {
    throw new ApiError(403, 'Not authorized to view this task');
  }

  return task;
};

const createTask = async (taskBody, userId) => {
  const goal = await Goal.findOne({ _id: taskBody.goalId, userId });
  if (!goal) {
    throw new ApiError(404, 'Goal not found');
  }

  const task = await Task.create(taskBody);
  return task;
};

module.exports = {
  getTasksByGoal,
  updateTask,
  getTaskById,
  createTask,
};
