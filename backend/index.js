require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db.js');
const cors = require('cors');
const path = require('path');
console.log('🔍 Starting route registration debugging...');
// Import routes
const authRoutes = require('./routes/auth.js');
const bookingRoutes = require('./routes/bookings.js');
const driverRoutes = require('./routes/drivers.js');
const reviewsRoutes = require('./routes/reviews.js');
const adminRoutes = require('./routes/admin.js');

const app = express();

// Connect to Database
connectDB();

// CORS - Allow your frontend to connect
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://rida-1mt4.onrender.com']
    : [process.env.FRONTEND_URL || 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
const profilesDir = path.join(uploadsDir, 'profiles');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
    console.log('Created uploads directory');
}

if (!fs.existsSync(profilesDir)) {
    fs.mkdirSync(profilesDir);
    console.log('Created profiles directory');
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.get('/', (req, res) => {
    res.json({ message: 'Driver Booking Platform API running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((req, res, next) => {
    const error = new Error(`Cannot ${req.method} ${req.originalUrl}`);
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    console.error('Error:', error.message);
    res.status(error.status || 500).json({
        error: {
            message: error.message,
            status: error.status || 500
        }
    });
});

// For production - serve React build
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static(path.join(__dirname, '../build')));
    
    // Any routes that don't match API routes will be handled by React
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../build', 'index.html'));
    });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
