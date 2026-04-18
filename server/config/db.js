const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    process.env.DB_CONNECTED = 'true';
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    // Don't exit the process in dev; mark DB as unavailable so server can serve mock data
    process.env.DB_CONNECTED = 'false';
  }
};

module.exports = connectDB;