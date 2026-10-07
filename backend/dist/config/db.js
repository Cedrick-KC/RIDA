"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const conn = await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/driver-booking');
        console.log(`📅 MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database Name: ${conn.connection.name}`);
    }
    catch (err) {
        console.error('❌ Database connection error:', err.message);
        // Try connecting without options if the first attempt fails
        try {
            console.log('🔄 Retrying connection...');
            await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/driver-booking');
            console.log('✅ MongoDB Connected (retry successful)');
        }
        catch (retryErr) {
            console.error('❌ Database retry connection failed:', retryErr.message);
            process.exit(1);
        }
    }
    // Connection event listeners
    mongoose_1.default.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
    });
    mongoose_1.default.connection.on('disconnected', () => {
        console.log('📡 MongoDB disconnected');
    });
    mongoose_1.default.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected');
    });
};
exports.default = connectDB;
