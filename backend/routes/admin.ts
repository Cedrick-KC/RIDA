// routes/admin.ts

import express from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import auth from '../middleware/auth'; // Middleware for token verification
import adminAuth from '../middleware/adminAuth'; // Middleware to check if the user is an admin
import { check, validationResult } from 'express-validator';

const router = express.Router();

// @route   POST api/admin/create-admin
// @desc    Create a new admin user (requires existing admin privileges)
// @access  Private (Admin only)
router.post(
  '/create-admin',
  [
    auth,
    adminAuth,
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    check('phone', 'Phone number is required').not().isEmpty(),
  ],
  async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone } = req.body;

    try {
      // Check if the email is already in use
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: 'User with this email already exists' });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create the new admin user
      user = new User({
        name,
        email,
        password: hashedPassword,
        phone,
        userType: 'admin',
        isVerified: true, // Admins should be auto-verified
      });

      await user.save();
      res.status(201).json({ msg: 'Admin user created successfully' });
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

export default router;