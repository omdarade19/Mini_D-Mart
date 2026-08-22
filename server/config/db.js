const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mini-dmart';
    const conn = await mongoose.connect(connStr);
    console.log(`[MongoDB] Connected: ${conn.connection.host} / DB: ${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Error] ${error.message}`);
    console.warn(`[MongoDB Warning] Operating in disconnected fallback mode if MongoDB local service is offline. Please provide MONGODB_URI in server/.env for full database features.`);
  }
};

module.exports = connectDB;
