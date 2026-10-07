import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/driver-booking'
    );

    console.log(`📅 MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);
  } catch (err: any) {
    console.error('❌ Database connection error:', err.message);

    // Try connecting without options if the first attempt fails
    try {
      console.log('🔄 Retrying connection...');
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/driver-booking');
      console.log('✅ MongoDB Connected (retry successful)');
    } catch (retryErr: any) {
      console.error('❌ Database retry connection failed:', retryErr.message);
      process.exit(1);
    }
  }

  // Connection event listeners
  mongoose.connection.on('error', (err: any) => {
    console.error('❌ MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('📡 MongoDB disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔄 MongoDB reconnected');
  });
};

export default connectDB;