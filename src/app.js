const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { errorHandler } = require('./middlewares/error.middleware');
const { aiLimiter } = require('./middlewares/rate-limit.middleware');

const authRoutes = require('./routes/auth.routes');
const aiRoutes = require('./routes/ai.routes');
const goalRoutes = require('./routes/goal.routes');
const taskRoutes = require('./routes/task.routes');
const userRoutes = require('./routes/user.routes');
const moderationRoutes = require('./routes/moderation.routes');

const app = express();

// Set security HTTP headers
app.use(helmet());

// Parse json request body
app.use(express.json());

// Parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// Enable cors
app.use(cors());

// HTTP request logger
app.use(morgan('dev'));

// Routes
app.use('/auth', authRoutes);
app.use('/ai', aiLimiter, aiRoutes); // Apply rate limiting to AI routes
app.use('/goals', goalRoutes);
app.use('/tasks', taskRoutes);
app.use('/users', userRoutes);
app.use('/moderation', moderationRoutes);

// Unknown routes
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'API Not Found' });
});

// Error handling defined in middleware
app.use(errorHandler);

module.exports = app;
