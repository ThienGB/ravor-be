const express = require('express');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const aiValidation = require('../validations/ai.validation');
const aiController = require('../controllers/ai.controller');

const router = express.Router();

// Rate limiting is applied in app.js for /api/ai
router.post('/generate', auth, validate(aiValidation.generatePlan), aiController.generatePlan);

module.exports = router;
