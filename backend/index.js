// Load environment variables from a .env file
require('dotenv').config();

// Import necessary modules
const express = require('express');
const connectDB = require('./config/db.js');
const cors = require('cors');
const path = require('path');

// Import all your route files
const authRoutes = require('./routes/auth.js');
const bookingRoutes = require('./routes/bookings.js');
const driverRoutes = require('./routes/drivers.js');
const reviewsRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');

// Initialize the Express app
const app = express();

// Connect to the database
connectDB();

// -------------------------------------------------------------------
// Middleware
// NOTE: These must be placed BEFORE any route definitions to work correctly.
// -------------------------------------------------------------------

// Enable CORS for all routes
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://rida-1mt4.onrender.com']  // Your Render URL
    : [process.env.FRONTEND_URL || 'http://localhost:3000'],
  credentials: true
}));

// Body parser middleware to handle JSON data
app.use(express.json());

// -------------------------------------------------------------------
// Define all API routes
// -------------------------------------------------------------------

// Root route for API health check
app.get('/', (req, res) => {
    res.json({ message: 'Driver Booking Platform API running' });
});

// Mount your routers from the routes directory
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/admin', adminRoutes);

// -------------------------------------------------------------------
// Serve Static Files in Production
// This serves your React app's build files
// -------------------------------------------------------------------
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app build directory
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  // Handle React routing - send all non-API requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// -------------------------------------------------------------------
// Error Handling Middleware
// This must be the last middleware in the chain to handle 404 errors.
// -------------------------------------------------------------------
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

// -------------------------------------------------------------------
// Server Setup
// -------------------------------------------------------------------
const PORT = process.env.PORT || 5000;

// Use 0.0.0.0 for Render deployment
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Visit: http://localhost:${PORT}`);
});
