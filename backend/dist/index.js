"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./config/db"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const security_1 = __importDefault(require("./middleware/security"));
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const bookings_1 = __importDefault(require("./routes/bookings"));
const drivers_1 = __importDefault(require("./routes/drivers"));
const reviews_1 = __importDefault(require("./routes/reviews"));
const admin_1 = __importDefault(require("./routes/admin"));
// Load environment variables
dotenv_1.default.config();
console.log('🔍 Starting backend service...');
const app = (0, express_1.default)();
// Connect to Database
(0, db_1.default)();
// CORS - Allow your frontend to connect
app.use((0, cors_1.default)({
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
const security = (0, security_1.default)();
app.use(security[0]); // helmet
app.use(security[1]); // rate limiting
app.use(security[2]); // mongo sanitize
app.use(security[3]); // xss clean
app.use(security[4]); // hpp
app.use(express_1.default.json());
// Create uploads directory if it doesn't exist
const uploadsDir = path_1.default.join(__dirname, 'uploads');
const profilesDir = path_1.default.join(uploadsDir, 'profiles');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir);
    console.log('Created uploads directory');
}
if (!fs_1.default.existsSync(profilesDir)) {
    fs_1.default.mkdirSync(profilesDir);
    console.log('Created profiles directory');
}
// Serve static files from uploads directory
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
// API Routes
app.get('/', (req, res) => {
    res.json({ message: 'Driver Booking Platform API running' });
});
app.use('/api/auth', auth_1.default || ((req, res) => res.status(500).json({ error: 'Auth routes failed to load' })));
app.use('/api/bookings', bookings_1.default || ((req, res) => res.status(500).json({ error: 'Booking routes failed to load' })));
app.use('/api/drivers', drivers_1.default || ((req, res) => res.status(500).json({ error: 'Driver routes failed to load' })));
app.use('/api/reviews', reviews_1.default || ((req, res) => res.status(500).json({ error: 'Reviews routes failed to load' })));
app.use('/api/admin', admin_1.default || ((req, res) => res.status(500).json({ error: 'Admin routes failed to load' })));
app.use('/api', (req, res, next) => {
    const error = new Error(`Cannot ${req.method} ${req.originalUrl}`);
    // @ts-ignore
    error.status = 404;
    next(error);
});
// Global error handler
app.use((error, req, res, next) => {
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
    }
    else {
        res.status(500).send('Something went wrong!');
    }
});
const PORT = parseInt(process.env.PORT || '5000', 10);
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
