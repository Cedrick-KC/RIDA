"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const User_js_1 = __importDefault(require("../models/User.js"));
const Driver_js_1 = __importDefault(require("../models/Driver.js"));
const router = express_1.default.Router();
// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
    (0, express_validator_1.body)('name', 'Name is required').not().isEmpty(),
    (0, express_validator_1.body)('email', 'Please include a valid email').isEmail(),
    (0, express_validator_1.body)('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    (0, express_validator_1.body)('phone', 'Phone number is required').not().isEmpty(),
    (0, express_validator_1.body)('userType', 'User type is required').isIn(['customer', 'driver', 'admin'])
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password, phone, userType, vehicle, pricing, bio, ageRange, yearsOfExperience, transmissionProficiency, vehicleTypesComfortable, preferredServiceAreas, timeAvailability, openToServices, languagesSpoken } = req.body;
    try {
        // Normalize email
        const normalizedEmail = email.toLowerCase().trim();
        console.log('🔍 Checking if user exists with email:', normalizedEmail);
        // Check if user already exists
        let user = await User_js_1.default.findOne({ email: normalizedEmail });
        if (user) {
            console.log('❌ User already exists:', {
                id: user._id,
                name: user.name,
                email: user.email,
                userType: user.userType
            });
            return res.status(400).json({ msg: 'User already exists' });
        }
        console.log('✅ Email is available, proceeding with registration');
        // Create new user
        user = new User_js_1.default({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password,
            phone: phone.trim(),
            userType,
            location: '' // Added empty string as default for location
        });
        // Hash password
        const salt = await bcryptjs_1.default.genSalt(10);
        user.password = await bcryptjs_1.default.hash(password, salt);
        // Verify password was hashed correctly
        if (!user.password) {
            throw new Error('Failed to hash password');
        }
        console.log('✅ Password hashed successfully');
        // Save user first
        await user.save();
        console.log(`✅ User created: ${user.name} (${user.email})`);
        // If user is a driver, create a detailed driver profile
        if (userType === 'driver') {
            try {
                // Validate required driver fields
                if (!vehicle || !vehicle.make || !vehicle.model || !vehicle.licensePlate || !vehicle.color) {
                    return res.status(400).json({ msg: 'Vehicle details are required for a driver.' });
                }
                if (!ageRange || !yearsOfExperience || !transmissionProficiency) {
                    return res.status(400).json({ msg: 'Driver profile information is incomplete.' });
                }
                const driverData = {
                    user: user._id,
                    email: user.email,
                    // Basic driver information
                    ageRange,
                    yearsOfExperience: parseInt(yearsOfExperience),
                    bio: bio || '',
                    // Vehicle information
                    vehicle: {
                        make: vehicle.make,
                        model: vehicle.model,
                        licensePlate: vehicle.licensePlate.toUpperCase(),
                        color: vehicle.color,
                        year: vehicle.year || new Date().getFullYear()
                    },
                    // Driver preferences
                    transmissionProficiency,
                    vehicleTypesComfortable: vehicleTypesComfortable || [],
                    preferredServiceAreas: preferredServiceAreas || ['kigali'],
                    timeAvailability: timeAvailability || 'flexible',
                    openToServices: openToServices || ['shortTrips'],
                    languagesSpoken: languagesSpoken || ['english', 'kinyarwanda'],
                    // Pricing
                    pricing: {
                        hourlyRate: pricing?.hourlyRate || 25,
                        dailyRate: pricing?.dailyRate || 200,
                        weeklyRate: pricing?.weeklyRate || 1200,
                        monthlyRate: pricing?.monthlyRate || 4000
                    }
                };
                const driver = new Driver_js_1.default(driverData);
                await driver.save();
                console.log(`✅ Driver profile created for: ${user.name}`);
            }
            catch (driverError) {
                console.error('❌ Error creating driver profile:', driverError);
                console.error('Driver creation failed but user was created successfully');
                // If driver creation fails, we should delete the user that was already created
                await User_js_1.default.findByIdAndDelete(user._id);
                console.log(`❌ Deleted user ${user._id} due to driver profile creation failure`);
                // This re-throws the error to be caught by the outer try-catch block
                throw driverError;
            }
        }
        // Generate JWT token
        const payload = {
            user: {
                id: user.id,
                userType: user.userType,
            },
        };
        jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET || 'supersecretkey', { expiresIn: '24h' }, (err, token) => {
            if (err) {
                console.error('JWT signing error:', err);
                throw err;
            }
            res.status(201).json({
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    userType: user.userType,
                    phone: user.phone
                },
                msg: 'User registered successfully'
            });
        });
    }
    catch (err) {
        console.error('Registration error:', err);
        console.error('Error stack:', err.stack);
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(400).json({
                msg: `${field} already exists. Please use a different ${field}.`
            });
        }
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(error => error.message);
            return res.status(400).json({
                msg: messages.join(', '),
                errors: err.errors
            });
        }
        if (err.name === 'MongoServerError') {
            return res.status(400).json({
                msg: 'Database error occurred. Please try again.',
                details: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        }
        res.status(500).json({
            msg: 'Server Error during registration',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});
// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
    (0, express_validator_1.body)('email', 'Please include a valid email').isEmail(),
    (0, express_validator_1.body)('password', 'Password is required').exists(),
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
        console.log('Login attempt for email:', email);
        // Find user by email (case insensitive) and explicitly include password
        let user = await User_js_1.default.findOne({ email: email.toLowerCase().trim() }).select('+password');
        if (!user) {
            console.log('User not found with email:', email);
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        console.log('User found:', user._id, user.name);
        // Verify password exists
        if (!user.password) {
            console.error('Password field missing for user:', user._id);
            return res.status(500).json({ msg: 'Server configuration error' });
        }
        // Compare password
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            console.log('Password mismatch for user:', user._id);
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        // Generate JWT token
        const payload = {
            user: {
                id: user.id,
                userType: user.userType,
            },
        };
        jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET || 'supersecretkey', { expiresIn: '24h' }, (err, token) => {
            if (err) {
                console.error('JWT signing error:', err);
                throw err;
            }
            res.json({
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    userType: user.userType,
                    phone: user.phone
                }
            });
        });
    }
    catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ msg: 'Server Error' });
    }
});
exports.default = router;
