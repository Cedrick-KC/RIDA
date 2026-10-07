import dotenv from 'dotenv';
import express from 'express';
import connectDB from './config/db';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import securityMiddleware from './middleware/security';

// Import routes
import authRoutes from './routes/auth';
import bookingRoutes from './routes/bookings';
import driverRoutes from './routes/drivers';
import reviewsRoutes from './routes/reviews';
import adminRoutes from './routes/admin';

// Load environment variables
dotenv.config();

console.log('🔍 Starting backend service...');

const app = express();

// Connect to Database
connectDB();

// CORS - Allow your frontend to connect
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [
        'https://rida-production-d2a6.up.railway.app',
        'https://www.ridaapp.com',
        'https://ridaapp.com',
        'https://rida-1.onrender.com'
      ]
    : [process.env.FRONTEND_URL || 'http://localhost:3000'],
  credentials: true
}));

// Security middleware
const security = securityMiddleware();
app.use(security[0]); // helmet
app.use(security[1]); // rate limiting
app.use(security[2]); // mongo sanitize
app.use(security[3]); // xss clean
app.use(security[4]); // hpp

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

app.use('/api', (req, res, next) => {
  const error = new Error(`Cannot ${req.method} ${req.originalUrl}`);
  // @ts-ignore
  error.status = 404;
  next(error);
});

// Global error handler
app.use((error: any, req: any, res: any, next: any) => {
  console.error('Error:', error.message);

  if (req.url.startsWith('/api/')) {
    // @ts-ignore
    const status = error.status || 500;
    res.status(status).json({
      error: {
        message: error.message,
        status: status
      }
    });
  } else {
    res.status(500).send('Something went wrong!');
  }
});

const PORT = parseInt(process.env.PORT || '5000', 10);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});