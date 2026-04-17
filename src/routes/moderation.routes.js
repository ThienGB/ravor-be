const express = require('express');
const auth = require('../middlewares/auth.middleware');
const moderationController = require('../controllers/moderation.controller');

const router = express.Router();

router.post('/report', auth, moderationController.report);
router.post('/block', auth, moderationController.block);

module.exports = router;
