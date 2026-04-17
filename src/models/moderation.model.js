const mongoose = require('mongoose');

const reportSchema = mongoose.Schema({
  reporterId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
  },
  targetUserId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
  },
  targetGoalId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Goal',
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

const blockSchema = mongoose.Schema({
  blockerId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
  },
  blockedId: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

const Report = mongoose.model('Report', reportSchema);
const Block = mongoose.model('Block', blockSchema);

module.exports = {
  Report,
  Block,
};
