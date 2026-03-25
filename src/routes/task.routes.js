const express = require('express');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const taskValidation = require('../validations/task.validation');
const taskController = require('../controllers/task.controller');

const router = express.Router();

router.route('/:id')
  .put(auth, validate(taskValidation.updateTask), taskController.updateTask);

module.exports = router;
