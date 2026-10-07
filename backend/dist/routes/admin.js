"use strict";
// routes/admin.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = __importDefault(require("../models/User"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_1 = __importDefault(require("../middleware/auth")); // Middleware for token verification
const adminAuth_1 = __importDefault(require("../middleware/adminAuth")); // Middleware to check if the user is an admin
const express_validator_1 = require("express-validator");
const router = express_1.default.Router();
// @route   POST api/admin/create-admin
// @desc    Create a new admin user (requires existing admin privileges)
// @access  Private (Admin only)
router.post('/create-admin', [
    auth_1.default,
    adminAuth_1.default,
    [
        (0, express_validator_1.check)('name', 'Name is required').not().isEmpty(),
        (0, express_validator_1.check)('email', 'Please include a valid email').isEmail(),
        (0, express_validator_1.check)('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
        (0, express_validator_1.check)('phone', 'Phone number is required').not().isEmpty(),
    ],
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password, phone } = req.body;
    try {
        // Check if the email is already in use
        let user = await User_1.default.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User with this email already exists' });
        }
        // Hash the password
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        // Create the new admin user
        user = new User_1.default({
            name,
            email,
            password: hashedPassword,
            phone,
            userType: 'admin',
            isVerified: true, // Admins should be auto-verified
        });
        await user.save();
        res.status(201).json({ msg: 'Admin user created successfully' });
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
exports.default = router;
