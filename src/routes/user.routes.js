const express = require('express');
const auth = require('../middlewares/auth.middleware');
const userController = require('../controllers/user.controller');

const router = express.Router();

router.get('/me', auth, userController.getProfile);
router.delete('/me', auth, userController.deleteMe);

module.exports = router;
