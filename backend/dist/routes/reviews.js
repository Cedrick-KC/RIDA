"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const Review_js_1 = __importDefault(require("../models/Review.js"));
const Booking_js_1 = __importDefault(require("../models/Booking.js"));
const Driver_js_1 = __importDefault(require("../models/Driver.js"));
const auth_js_1 = __importDefault(require("../middleware/auth.js"));
const router = express_1.default.Router();
// @route   POST api/reviews
// @desc    Create a new review
// @access  Private
router.post('/', [
    auth_js_1.default,
    (0, express_validator_1.body)('bookingId', 'Booking ID is required').not().isEmpty(),
    (0, express_validator_1.body)('rating', 'Rating is required and must be between 1 and 5').isInt({ min: 1, max: 5 }),
    (0, express_validator_1.body)('comment', 'Comment is required').not().isEmpty().isLength({ max: 500 })
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { bookingId, rating, comment, categories } = req.body;
        // Find the booking
        const booking = await Booking_js_1.default.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ msg: 'Booking not found' });
        }
        // Check if booking is completed
        if (booking.status !== 'completed') {
            return res.status(400).json({ msg: 'Can only review completed bookings' });
        }
        // Check if user is part of the booking
        const isCustomer = booking.customer.toString() === req.user.id;
        const isDriver = booking.driver.toString() === req.user.id;
        if (!isCustomer && !isDriver) {
            return res.status(403).json({ msg: 'Not authorized to review this booking' });
        }
        // Determine who is reviewing and who is being reviewed
        let reviewer = req.user.id;
        let reviewee;
        if (isCustomer) {
            // Customer is reviewing the driver
            const driver = await Driver_js_1.default.findById(booking.driver);
            if (!driver) {
                return res.status(404).json({ msg: 'Driver not found' });
            }
            reviewee = driver.user;
            // Update driver's rating
            const totalRating = driver.ratings.average * driver.ratings.count + rating;
            driver.ratings.count += 1;
            driver.ratings.average = totalRating / driver.ratings.count;
            await driver.save();
            // Update booking with customer rating
            booking.rating.customerRating = rating;
            booking.rating.customerReview = comment;
        }
        else {
            // Driver is reviewing the customer
            reviewee = booking.customer;
            // Update booking with driver rating
            booking.rating.driverRating = rating;
            booking.rating.driverReview = comment;
        }
        await booking.save();
        // Create the review
        const newReview = new Review_js_1.default({
            booking: bookingId,
            reviewer,
            reviewee,
            rating,
            comment,
            categories: categories || {}
        });
        const review = await newReview.save();
        // Populate the review for response
        const populatedReview = await Review_js_1.default.findById(review._id)
            .populate('reviewer', 'name')
            .populate('reviewee', 'name');
        res.json(populatedReview);
    }
    catch (err) {
        console.error('Error creating review:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});
// @route   GET api/reviews/myreviews
// @desc    Get reviews for the logged-in user
// @access  Private
router.get('/myreviews', auth_js_1.default, async (req, res) => {
    try {
        // Find all reviews where the user is either the reviewer or reviewee
        const reviews = await Review_js_1.default.find({
            $or: [
                { reviewer: req.user.id },
                { reviewee: req.user.id }
            ]
        })
            .populate('reviewer', 'name')
            .populate('reviewee', 'name')
            .populate('booking')
            .sort({ createdAt: -1 });
        res.json(reviews);
    }
    catch (err) {
        console.error('Error fetching reviews:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});
// @route   GET api/reviews/user/:id
// @desc    Get reviews for a specific user
// @access  Public
router.get('/user/:id', async (req, res) => {
    try {
        const reviews = await Review_js_1.default.find({
            reviewee: req.params.id
        })
            .populate('reviewer', 'name')
            .populate('booking')
            .sort({ createdAt: -1 });
        res.json(reviews);
    }
    catch (err) {
        console.error('Error fetching user reviews:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});
exports.default = router;
