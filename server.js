const mongoose = require('mongoose');
const app = require('./src/app');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ravor-planner';

let server;
mongoose.connect(MONGODB_URI).then(() => {
  console.log('Connected to MongoDB');
  server = app.listen(PORT, () => {
    console.log(`Listening to port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
});
