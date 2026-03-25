const catchAsync = require('../utils/catchAsync');
const userService = require('../services/user.service');

const getProfile = catchAsync(async (req, res) => {
  const profile = await userService.getUserProfile(req.user._id);
  res.json({ success: true, data: profile });
});

module.exports = {
  getProfile,
};
