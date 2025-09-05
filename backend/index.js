require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db.js');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

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
    ? ['https://rida-production-d2a6.up.railway.app', 'https://www.ridaapp.com', 'https://ridaapp.com']
    : [process.env.FRONTEND_URL || 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// Create uploads directory if it doesn't exist
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

// API Routes - Keep these BEFORE static file serving
app.get('/', (req, res) => {
    res.json({ message: 'Driver Booking Platform API running' });
});

app.use('/api/auth', authRoutes || ((req, res) => res.status(500).json({error: 'Auth routes failed to load'})));
app.use('/api/bookings', bookingRoutes || ((req, res) => res.status(500).json({error: 'Booking routes failed to load'})));
app.use('/api/drivers', driverRoutes || ((req, res) => res.status(500).json({error: 'Driver routes failed to load'})));
app.use('/api/reviews', reviewsRoutes || ((req, res) => res.status(500).json({error: 'Reviews routes failed to load'})));
app.use('/api/admin', adminRoutes || ((req, res) => res.status(500).json({error: 'Admin routes failed to load'})));

// For production - serve React build
if (process.env.NODE_ENV === 'production') {
    const buildPath = path.join(__dirname, '../frontend/build');
    
    console.log('🚀 Production mode: Serving React app from', buildPath);
    
    // Check if build directory exists
    if (fs.existsSync(buildPath)) {
        console.log('✅ Build directory found');
        
        // Serve static files (JS, CSS, images, etc.) - THIS MUST COME FIRST
        app.use(express.static(buildPath, {
            maxAge: '1d', // Cache static assets
            index: false  // Don't automatically serve index.html for directories
        }));
        
        // Handle React Router - send index.html for non-API, non-static routes
        app.get('*', (req, res) => {
            console.log(`📄 Serving React app for route: ${req.url}`);
            res.sendFile(path.join(buildPath, 'index.html'));
        });
        
    } else {
        console.error('❌ Build directory not found at:', buildPath);
        console.error('Make sure to run "npm run build" in the frontend directory');
    }
}

// Error handling middleware - Only for API routes
app.use('/api/*', (req, res, next) => {
    const error = new Error(`Cannot ${req.method} ${req.originalUrl}`);
    error.status = 404;
    next(error);
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Error:', error.message);
    
    // Only send JSON error for API routes
    if (req.url.startsWith('/api/')) {
        res.status(error.status || 500).json({
            error: {
                message: error.message,
                status: error.status || 500
            }
        });
    } else {
        // For non-API routes in production, serve the React app
        if (process.env.NODE_ENV === 'production') {
            const buildPath = path.join(__dirname, '../frontend/build');
            res.sendFile(path.join(buildPath, 'index.html'));
        } else {
            res.status(500).send('Something went wrong!');
        }
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    
    if (process.env.NODE_ENV === 'production') {
        console.log('📦 Serving React app from ../frontend/build');
    }
});
