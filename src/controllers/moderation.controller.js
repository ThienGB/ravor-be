const catchAsync = require('../utils/catchAsync');
const moderationService = require('../services/moderation.service');

const report = catchAsync(async (req, res) => {
  const report = await moderationService.createReport({
    ...req.body,
    reporterId: req.user._id,
  });
  res.status(201).json({ success: true, data: report });
});

const block = catchAsync(async (req, res) => {
  const block = await moderationService.createBlock(req.user._id, req.body.blockedId);
  res.status(201).json({ success: true, data: block });
});

module.exports = {
  report,
  block,
};
