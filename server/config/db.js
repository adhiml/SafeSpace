const mongoose = require('mongoose');
const seedUsers = require('./seedUsers');
const { failStalePending } = require('../services/analysisJobs');
const seedDevRoom = require('./seedDevRoom');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    await seedUsers();
    if (process.env.NODE_ENV !== 'production') await seedDevRoom();
    await failStalePending(require('../models/Journal'), require('../models/PeerPost'));
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
