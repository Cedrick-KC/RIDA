const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/driver-booking',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log(`📅 MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
    
    // Try connecting without options if the first attempt fails
    try {
      console.log('🔄 Retrying connection without deprecated options...');
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/driver-booking');
      console.log('✅ MongoDB Connected (retry successful)');
    } catch (retryErr) {
      console.error('❌ Database retry connection failed:', retryErr.message);
      process.exit(1);
    }
  }

  // Connection event listeners
  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('📡 MongoDB disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔄 MongoDB reconnected');
  });
};

module.exports = connectDB;