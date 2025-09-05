require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db.js');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

console.log('🔍 Starting backend service...');

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
    ? [
        'https://rida-production-d2a6.up.railway.app', 
        'https://www.ridaapp.com',
        'https://ridaapp.com'
      ]
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

// API Routes
app.get('/', (req, res) => {
  res.json({ message: 'Driver Booking Platform API running' });
});

app.use('/api/auth', authRoutes || ((req, res) => res.status(500).json({ error: 'Auth routes failed to load' })));
app.use('/api/bookings', bookingRoutes || ((req, res) => res.status(500).json({ error: 'Booking routes failed to load' })));
app.use('/api/drivers', driverRoutes || ((req, res) => res.status(500).json({ error: 'Driver routes failed to load' })));
app.use('/api/reviews', reviewsRoutes || ((req, res) => res.status(500).json({ error: 'Reviews routes failed to load' })));
app.use('/api/admin', adminRoutes || ((req, res) => res.status(500).json({ error: 'Admin routes failed to load' })));

// Catch-all for undefined API routes (fixed path-to-regexp issue)
app.all('/api/*', (req, res, next) => {
  const error = new Error(`Cannot ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Error:', error.message);

  if (req.url.startsWith('/api/')) {
    res.status(error.status || 500).json({
      error: {
        message: error.message,
        status: error.status || 500
      }
    });
  } else {
    res.status(500).send('Something went wrong!');
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
