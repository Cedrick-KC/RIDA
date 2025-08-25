const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking.js');
const Driver = require('../models/Driver.js');
const User = require('../models/User.js');
const auth = require('../middleware/auth.js');

// Helper function to calculate end time based on duration
const calculateEndTime = (startTime, duration) => {
    const start = new Date(startTime);
    const { value, unit } = duration;
    
    switch (unit) {
        case 'hours':
            return new Date(start.getTime() + value * 60 * 60 * 1000);
        case 'days':
            return new Date(start.getTime() + value * 24 * 60 * 60 * 1000);
        case 'weeks':
            return new Date(start.getTime() + value * 7 * 24 * 60 * 60 * 1000);
        case 'months':
            return new Date(start.getTime() + value * 30 * 24 * 60 * 60 * 1000);
        default:
            throw new Error('Invalid duration unit');
    }
};

// @route   POST api/bookings
// @desc    Create a new booking
// @access  Private
router.post('/', [
    auth,
    body('driverId', 'Driver ID is required').not().isEmpty(),
    body('pickupLocation', 'Pickup location is required').not().isEmpty(),
    body('bookingType', 'Booking type is required').isIn(['once', 'daily', 'weekly', 'monthly']),
    body('duration', 'Duration is required').not().isEmpty(),
    body('paymentMethod', 'Payment method is required').isIn(['MomoPay Code 123456'])
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.userType !== 'customer') {
        return res.status(403).json({ msg: 'Only customers can create bookings' });
    }

    try {
        const {
            driverId,
            pickupLocation,
            dropoffLocation,
            bookingType,
            duration,
            scheduledTime,
            paymentMethod,
            notes
        } = req.body;

        // Find and validate driver
        const driver = await Driver.findById(driverId);
        if (!driver) {
            return res.status(404).json({ msg: 'Driver not found' });
        }

        // Calculate booking start and end times
        const startTime = scheduledTime ? new Date(scheduledTime) : new Date();
        const endTime = calculateEndTime(startTime, duration);

        // Check if driver is available for this time slot
        if (!driver.isAvailableForTimeSlot(startTime, endTime)) {
            return res.status(400).json({ 
                msg: 'Driver is not available for the requested time slot',
                suggestedMessage: 'Please choose a different time or select another driver'
            });
        }

        // Create the booking
        const newBooking = new Booking({
            customer: req.user.id,
            driver: driverId,
            pickupLocation,
            dropoffLocation,
            bookingType,
            duration,
            scheduledTime: startTime,
            paymentMethod,
            specialRequests: notes,
            estimatedEndTime: endTime,
            paymentStatus: 'pending' // default
        });

        const booking = await newBooking.save();

        console.log(`✅ Booking created: ${booking._id} for driver ${driverId} from ${startTime} to ${endTime}`);

        // Populate booking for response
        const populatedBooking = await Booking.findById(booking._id)
            .populate('customer', 'name email phone')
            .populate({
                path: 'driver',
                populate: {
                    path: 'user',
                    model: 'User',
                    select: 'name email'
                }
            });

        res.json(populatedBooking);
    } catch (err) {
        console.error('Error creating booking:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   PUT api/bookings/status/:id
// @desc    Update booking status
// @access  Private
router.put('/status/:id', auth, async (req, res) => {
    try {
        const { status } = req.body;

        console.log(`Updating booking ${req.params.id} status to: ${status}`);

        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ msg: 'Booking not found' });
        }

        // Only the driver can update status
        const driver = await Driver.findOne({ user: req.user.id });
        if (!driver) {
            return res.status(404).json({ msg: 'Driver profile not found' });
        }

        if (booking.driver.toString() !== driver._id.toString()) {
            return res.status(403).json({ msg: 'Not authorized to change status for this booking' });
        }

        // Validate status
        const validStatus = ['pending', 'accepted', 'started', 'completed', 'cancelled'];
        if (!validStatus.includes(status)) {
            return res.status(400).json({ msg: 'Invalid status provided. Valid statuses: ' + validStatus.join(', ') });
        }

        const oldStatus = booking.status;
        
        // Update booking status
        booking.status = status;
        booking.updatedAt = new Date();

        // Handle transitions
        const startTime = booking.scheduledTime;
        const endTime = calculateEndTime(startTime, booking.duration);

        if (status === 'accepted' && oldStatus === 'pending') {
            await driver.addBookedSlot(booking._id, startTime, endTime);
            console.log(`🔒 Driver ${driver._id} time slot blocked from ${startTime} to ${endTime}`);
            
        } else if (status === 'started' && oldStatus === 'accepted') {
            booking.actualStartTime = new Date();
            
        } else if (status === 'completed') {
            booking.actualEndTime = new Date();
            booking.paymentStatus = 'paid';   // ✅ Mark payment as paid
            await driver.updateBookedSlotStatus(booking._id, 'completed');
            console.log(`✅ Driver ${driver._id} time slot freed after completion`);
            console.log(`💰 Payment status updated to PAID for booking ${booking._id}`);
            
        } else if (status === 'cancelled') {
            await driver.updateBookedSlotStatus(booking._id, 'cancelled');
            console.log(`❌ Driver ${driver._id} time slot freed after cancellation`);
        }

        await booking.save();

        const updatedBooking = await Booking.findById(booking._id)
            .populate('customer', 'name email phone')
            .populate({
                path: 'driver',
                populate: {
                    path: 'user',
                    model: 'User',
                    select: 'name email phone'
                }
            });

        console.log(`✅ Booking ${req.params.id} status updated to: ${status}`);
        res.json(updatedBooking);

    } catch (err) {
        console.error('Error updating booking status:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   GET api/bookings
// @desc    Get all bookings (admin/general overview)
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('customer', 'name email phone')
            .populate({
                path: 'driver',
                populate: {
                    path: 'user',
                    model: 'User',
                    select: 'name email'
                }
            })
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (err) {
        console.error('Error fetching all bookings:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   GET api/bookings/mybookings
// @desc    Get bookings for logged-in user
// @access  Private
router.get('/mybookings', auth, async (req, res) => {
    try {
        let bookings;

        if (req.user.userType === 'customer') {
            bookings = await Booking.find({ customer: req.user.id })
                .populate({
                    path: 'driver',
                    populate: {
                        path: 'user',
                        model: 'User',
                        select: 'name email'
                    },
                    select: 'ratings vehicle pricing'
                })
                .sort({ createdAt: -1 });

        } else if (req.user.userType === 'driver') {
            const driver = await Driver.findOne({ user: req.user.id });
            if (!driver) {
                return res.status(200).json({
                    bookings: [],
                    message: 'Driver profile not found. Contact admin.'
                });
            }

            bookings = await Booking.find({ driver: driver._id })
                .populate('customer', 'name email phone')
                .sort({ createdAt: -1 });

        } else {
            return res.status(403).json({ msg: 'Invalid user type' });
        }

        res.json(bookings);
    } catch (err) {
        console.error('Error in /mybookings:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   POST api/bookings/rate/:id
// @desc    Rate a booking
// @access  Private
router.post('/rate/:id', auth, async (req, res) => {
    const { rating, review } = req.body;

    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ msg: 'Booking not found' });
        }

        if (booking.status !== 'completed') {
            return res.status(400).json({ msg: 'Can only rate completed bookings' });
        }

        if (req.user.userType === 'customer' && booking.customer.toString() === req.user.id) {
            booking.rating.customerRating = rating;
            booking.rating.customerReview = review;

            const driver = await Driver.findById(booking.driver);
            if (driver) {
                const totalRating = driver.ratings.average * driver.ratings.count + rating;
                driver.ratings.count += 1;
                driver.ratings.average = totalRating / driver.ratings.count;
                await driver.save();
            }

        } else if (req.user.userType === 'driver') {
            const driver = await Driver.findOne({ user: req.user.id });
            if (!driver) {
                return res.status(404).json({ msg: 'Driver profile not found' });
            }

            if (booking.driver.toString() === driver._id.toString()) {
                booking.rating.driverRating = rating;
                booking.rating.driverReview = review;
            } else {
                return res.status(403).json({ msg: 'Not authorized' });
            }

        } else {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        await booking.save();

        const ratedBooking = await Booking.findById(booking._id)
            .populate('customer', 'name email phone')
            .populate({
                path: 'driver',
                populate: {
                    path: 'user',
                    model: 'User',
                    select: 'name email'
                }
            });

        res.json(ratedBooking);

    } catch (err) {
        console.error('Error rating booking:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   GET api/bookings/:id
// @desc    Get specific booking
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('customer', 'name email phone')
            .populate({
                path: 'driver',
                populate: {
                    path: 'user',
                    model: 'User',
                    select: 'name email'
                }
            });

        if (!booking) {
            return res.status(404).json({ msg: 'Booking not found' });
        }

        const isCustomer = req.user.userType === 'customer' && booking.customer._id.toString() === req.user.id;

        let isDriver = false;
        if (req.user.userType === 'driver') {
            const driver = await Driver.findOne({ user: req.user.id });
            isDriver = driver && booking.driver._id.toString() === driver._id.toString();
        }

        if (!isCustomer && !isDriver) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        res.json(booking);

    } catch (err) {
        console.error('Error fetching booking:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   DELETE api/bookings/:id
// @desc    Cancel a booking (customer only, if pending)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ msg: 'Booking not found' });
        }

        if (req.user.userType !== 'customer' || booking.customer.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        if (booking.status !== 'pending') {
            return res.status(400).json({ msg: 'Can only cancel pending bookings' });
        }

        booking.status = 'cancelled';
        booking.updatedAt = new Date();
        await booking.save();

        console.log(`✅ Booking ${req.params.id} cancelled`);
        res.json({ msg: 'Booking cancelled successfully', booking });

    } catch (err) {
        console.error('Error cancelling booking:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   PUT api/bookings/payment/:id
// @desc    Admin update payment status
// @access  Private
router.put('/payment/:id', auth, async (req, res) => {
    try {
        if (req.user.userType !== 'admin') {
            return res.status(403).json({ msg: 'Only admins can update payments' });
        }

        const { paymentStatus } = req.body;
        const validStatuses = ['pending', 'paid', 'failed'];

        if (!validStatuses.includes(paymentStatus)) {
            return res.status(400).json({ msg: 'Invalid payment status' });
        }

        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ msg: 'Booking not found' });

        booking.paymentStatus = paymentStatus;
        await booking.save();

        res.json({ msg: `Payment status updated to ${paymentStatus}`, booking });
    } catch (err) {
        console.error('Error updating payment status:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

module.exports = router;
