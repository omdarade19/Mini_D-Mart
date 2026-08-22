const mongoose = require('mongoose');
const dns = require('dns');

// Override DNS servers to Google/Cloudflare public DNS to resolve MongoDB Atlas SRV records on Windows
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore if custom DNS fallback fails
}

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mini-dmart';
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 10000,
      family: 4
    });
    console.log(`[MongoDB] Connected: ${conn.connection.host} / DB: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error] ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
