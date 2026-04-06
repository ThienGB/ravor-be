const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  resourceLink: {
    type: String,
    trim: true,
  },
  // Mốc thời gian tương đối
  // Mốc thời gian tương đối
  day: {
    type: Number, // e.g. 1, 2, 3...
  },
  timeOfDay: {
    type: String, // e.g. "Morning", "Afternoon"
  },
  startTime: {
    type: String, // e.g. "09:00" - Dùng để bắn Notification sau này
  },
  duration: {
    type: String, // e.g. "1-2h"
  },
  // Mốc thời gian tuyệt đối (Dùng cho Calendar/Notifications)
  scheduledAt: {
    type: Date,
  },
  isDone: {
    type: Boolean,
    default: false,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  order: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Task', taskSchema);
