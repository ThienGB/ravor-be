const express = require('express');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const goalValidation = require('../validations/goal.validation');
const goalController = require('../controllers/goal.controller');
const taskController = require('../controllers/task.controller');

const router = express.Router();

// POST /api/goals/generate-and-save — AI sinh plan rồi lưu luôn (1 request)
router.post('/generate-and-save', auth, validate(goalValidation.generateAndSave), goalController.generateAndSave);

router.route('/')
  .post(auth, validate(goalValidation.createGoal), goalController.createGoal)
  .get(auth, goalController.getGoals);

router.route('/:id')
  .get(auth, goalController.getGoal)
  .patch(auth, validate(goalValidation.updateGoal), goalController.updateGoal)
  .delete(auth, goalController.deleteGoal);

router.patch('/:id/complete', auth, goalController.completeGoal);

router.get('/:id/tasks', auth, taskController.getTasks);

module.exports = router;

