require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db.js');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth.js');
const bookingRoutes = require('./routes/bookings.js');
const driverRoutes = require('./routes/drivers.js');
const reviewsRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');

const app = express();
connectDB();

// CORS - Allow your frontend to connect
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://rida-1mt4.onrender.com']
    : [process.env.FRONTEND_URL || 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// API Routes
app.get('/', (req, res) => {
    res.json({ message: 'Driver Booking Platform API running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/admin', adminRoutes);

// Error handling
app.use((req, res, next) => {
    const error = new Error(`Cannot ${req.method} ${req.originalUrl}`);
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
        error: {
            message: error.message,
            status: error.status || 500
        }
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
