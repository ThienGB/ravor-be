const { Report, Block } = require('../models/moderation.model');
const ApiError = require('../utils/ApiError');

const createReport = async (reportData) => {
  return Report.create(reportData);
};

const createBlock = async (blockerId, blockedId) => {
  if (blockerId.toString() === blockedId.toString()) {
    throw new ApiError(400, 'You cannot block yourself');
  }
  const existingBlock = await Block.findOne({ blockerId, blockedId });
  if (existingBlock) {
    return existingBlock;
  }
  return Block.create({ blockerId, blockedId });
};

const getBlockedUsers = async (userId) => {
  const blocks = await Block.find({ blockerId: userId });
  return blocks.map(b => b.blockedId);
};

module.exports = {
  createReport,
  createBlock,
  getBlockedUsers,
};
