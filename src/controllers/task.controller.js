const catchAsync = require('../utils/catchAsync');
const taskService = require('../services/task.service');

const getTasks = catchAsync(async (req, res) => {
  // Assuming the route is /goals/:id/tasks, the id is params.id
  const tasks = await taskService.getTasksByGoal(req.params.id, req.user._id);
  res.json({ success: true, data: tasks });
});

const updateTask = catchAsync(async (req, res) => {
  const task = await taskService.updateTask(req.params.id, req.body, req.user._id);
  res.json({ success: true, data: task });
});

const getTask = catchAsync(async (req, res) => {
  const task = await taskService.getTaskById(req.params.id, req.user._id);
  res.json({ success: true, data: task });
});

const createTask = catchAsync(async (req, res) => {
  const task = await taskService.createTask(req.body, req.user._id);
  res.status(201).json({ success: true, data: task });
});

module.exports = {
  getTasks,
  updateTask,
  getTask,
  createTask,
};
