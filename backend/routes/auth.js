const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User.js');
const Driver = require('../models/Driver.js');
const auth = require('../middleware/auth.js');

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    body('phone', 'Phone number is required').not().isEmpty(),
    body('userType', 'User type is required').isIn(['customer', 'driver'])
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone, userType, location, vehicle, pricing, bio } = req.body;

    try {
        // Normalize email
        const normalizedEmail = email.toLowerCase().trim();
        console.log('🔍 Checking if user exists with email:', normalizedEmail);
        
        // Check if user already exists
        let user = await User.findOne({ email: normalizedEmail });
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
        user = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password,
            phone: phone.trim(),
            userType,
            location: location || ''
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        
        // Save user first
        await user.save();
        console.log(`✅ User created: ${user.name} (${user.email})`);

        // If user is a driver, create a detailed driver profile
        if (userType === 'driver') {
            try {
                // Add this check to ensure the vehicle object exists
                if (!vehicle || !vehicle.make || !vehicle.model || !vehicle.licensePlate) {
                    return res.status(400).json({ msg: 'Vehicle details are required for a driver.' });
                }

                const driverData = {
                    user: user._id,
                    email: user.email,
                    licensePlate: vehicle.licensePlate, 
                    vehicle: {
                        make: vehicle.make,
                        model: vehicle.model,
                        color: vehicle.color,
                    },
                    pricing: {
                        hourlyRate: pricing.hourlyRate,
                    },
                    bio: bio,
                };

                const driver = new Driver(driverData);
                await driver.save();
                // ... success logic
            } catch (driverError) {
                console.error('❌ Error creating driver profile:', driverError);
                console.error('Driver creation failed but user was created successfully');
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

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'supersecretkey',
            { expiresIn: '24h' },
            (err, token) => {
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
            }
        );

    } catch (err) {
        console.error('Registration error:', err);
        
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

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // Find user by email (case insensitive)
        let user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Generate JWT token
        const payload = {
            user: {
                id: user.id,
                userType: user.userType,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'supersecretkey',
            { expiresIn: '24h' },
            (err, token) => {
                if (err) {
                    console.error('JWT signing error:', err);
                    throw err;
                }
                
                console.log(`✅ User logged in: ${user.name} (${user.email})`);
                
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
            }
        );

    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ 
            msg: 'Server Error during login',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        
        res.json(user);
    } catch (err) {
        console.error('Get user error:', err.message);
        res.status(500).json({ 
            msg: 'Server Error',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// @route   POST api/auth/create-admin
// @desc    Create a new admin user using a common secret password
// @access  Public (but secured by a secret)
router.post(
    '/create-admin',
    [
        body('name', 'Name is required').not().isEmpty(),
        body('email', 'Please include a valid email').isEmail(),
        body('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
        body('phone', 'Phone number is required').not().isEmpty(),
        body('adminSecret', 'Admin secret is required').not().isEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password, phone, adminSecret } = req.body;

        try {
            // 1. Validate the admin secret
            if (adminSecret !== process.env.ADMIN_SECRET) {
                return res.status(401).json({ msg: 'Unauthorized: Invalid admin secret' });
            }

            // 2. Check if a user with this email already exists
            const normalizedEmail = email.toLowerCase().trim();
            let user = await User.findOne({ email: normalizedEmail });
            if (user) {
                return res.status(400).json({ msg: 'User with this email already exists' });
            }

            // 3. Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // 4. Create the new admin user
            user = new User({
                name: name.trim(),
                email: normalizedEmail,
                password: hashedPassword,
                phone: phone.trim(),
                userType: 'admin',
                isVerified: true, // Admins should be auto-verified
            });

            await user.save();
            res.status(201).json({ msg: 'Admin user created successfully' });

        } catch (err) {
            console.error('Admin creation error:', err);
            res.status(500).json({ msg: 'Server Error', error: err.message });
        }
    }
);


module.exports = router;
