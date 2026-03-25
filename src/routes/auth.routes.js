const express = require('express');
const validate = require('../middlewares/validate.middleware');
const authValidation = require('../validations/auth.validation');
const authController = require('../controllers/auth.controller');
const { authLimiter } = require('../middlewares/rate-limit.middleware');

const router = express.Router();

router.post('/register', authLimiter, validate(authValidation.register), authController.register);
router.post('/login', authLimiter, validate(authValidation.login), authController.login);
router.post('/google', authLimiter, validate(authValidation.googleLogin), authController.googleLogin);
router.post('/refresh', authLimiter, validate(authValidation.refresh), authController.refresh);
router.post('/logout', authController.logout);

module.exports = router;
