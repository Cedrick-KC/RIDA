const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Driver = require('../models/Driver.js');
const User = require('../models/User.js');
const auth = require('../middleware/auth.js');
const multer = require('multer');
const path = require('path');

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/profiles'));
    },
    filename: function (req, file, cb) {
        cb(null, `driver-${Date.now()}-${file.fieldname}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedFileTypes = /jpeg|jpg|png|gif/;
        const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedFileTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

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

// @route   GET api/drivers
// @desc    Get all available drivers with filters (including time-based availability)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const {
            ageRange,
            minExperience,
            transmission,
            vehicleType,
            serviceArea,
            timeAvailability,
            serviceType,
            language,
            minRating,
            maxDistance = 10,
            sortBy = 'rating',
            // New time-based filtering parameters
            scheduledTime,
            duration
        } = req.query;
        
        let query = { 'availability.isAvailable': true };
        let sortOptions = {};
        
        // Filter by age range
        if (ageRange && ageRange !== '') {
            query.ageRange = ageRange;
        }
        
        // Filter by minimum experience
        if (minExperience && minExperience !== '') {
            query.yearsOfExperience = { $gte: parseInt(minExperience) };
        }
        
        // Filter by transmission
        if (transmission && transmission !== '') {
            query.transmissionProficiency = { $in: [transmission, 'both'] };
        }
        
        // Filter by vehicle type
        if (vehicleType && vehicleType !== '') {
            query.vehicleTypesComfortable = { $in: [vehicleType] };
        }
        
        // Filter by service area
        if (serviceArea && serviceArea !== '') {
            query.preferredServiceAreas = { $in: [serviceArea] };
        }
        
        // Filter by time availability
        if (timeAvailability && timeAvailability !== '') {
            query.timeAvailability = { $in: [timeAvailability, 'flexible'] };
        }
        
        // Filter by service type
        if (serviceType && serviceType !== '') {
            query.openToServices = { $in: [serviceType] };
        }
        
        // Filter by language
        if (language && language !== '') {
            query.languagesSpoken = { $in: [language] };
        }
        
        // Filter by minimum rating
        if (minRating) {
            query['ratings.average'] = { $gte: parseFloat(minRating) };
        }
        
        // Sorting
        switch (sortBy) {
            case 'rating':
                sortOptions = { 'ratings.average': -1 };
                break;
            case 'price':
                sortOptions = { 'pricing.hourlyRate': 1 };
                break;
            case 'experience':
                sortOptions = { 'yearsOfExperience': -1 };
                break;
            default:
                sortOptions = { 'ratings.average': -1 };
        }
        
        // Get all potentially available drivers
        let drivers = await Driver.find(query)
            .populate('user', 'name email phone profilePicture')
            .sort(sortOptions);
        
        // Apply time-based filtering if scheduledTime and duration are provided
        if (scheduledTime && duration) {
            try {
                const startTime = new Date(scheduledTime);
                const parsedDuration = JSON.parse(duration); // Expecting {value: 2, unit: 'hours'}
                const endTime = calculateEndTime(startTime, parsedDuration);
                console.log(`🔍 Filtering drivers for time slot: ${startTime} to ${endTime}`);
                
                // Filter drivers based on their availability for the requested time slot
                drivers = drivers.filter(driver => {
                    const isAvailable = driver.isAvailableForTimeSlot(startTime, endTime);
                    if (!isAvailable) {
                        console.log(`❌ Driver ${driver._id} (${driver.user.name}) not available for requested time slot`);
                    }
                    return isAvailable;
                });
                console.log(`✅ Found ${drivers.length} available drivers for the requested time slot`);
            } catch (timeFilterError) {
                console.error('Error applying time-based filtering:', timeFilterError);
                // Continue without time filtering if there's an error
            }
        }
        
        if (drivers.length === 0) {
            const message = scheduledTime && duration 
                ? 'No drivers available for the requested time slot. Please try a different time or duration.'
                : 'No drivers found matching your criteria.';
            
            return res.status(404).json({ msg: message });
        }
        
        // Add availability info to response
        const driversWithAvailability = drivers.map(driver => {
            const driverObj = driver.toObject();
            
            // Add current booking status info
            const activeSlots = driver.availability.bookedSlots.filter(slot => slot.status === 'active');
            driverObj.currentBookings = activeSlots.length;
            
            // Add next available time if driver has active bookings
            if (activeSlots.length > 0) {
                const nextAvailable = activeSlots
                    .map(slot => new Date(slot.endTime))
                    .sort((a, b) => b - a)[0]; // Get latest end time
                driverObj.nextAvailableTime = nextAvailable;
            }
            
            return driverObj;
        });
        
        res.json(driversWithAvailability);
    } catch (err) {
        console.error('Error fetching drivers:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   GET api/drivers/availability/:id
// @desc    Check specific driver's availability for a time slot
// @access  Public
router.get('/availability/:id', async (req, res) => {
    try {
        const { scheduledTime, duration } = req.query;
        
        if (!scheduledTime || !duration) {
            return res.status(400).json({ 
                msg: 'scheduledTime and duration are required',
                example: '?scheduledTime=2024-01-15T10:00:00Z&duration={"value":2,"unit":"hours"}'
            });
        }
        
        const driver = await Driver.findById(req.params.id)
            .populate('user', 'name email');
        if (!driver) {
            return res.status(404).json({ msg: 'Driver not found' });
        }
        
        const startTime = new Date(scheduledTime);
        const parsedDuration = JSON.parse(duration);
        const endTime = calculateEndTime(startTime, parsedDuration);
        const isAvailable = driver.isAvailableForTimeSlot(startTime, endTime);
        
        // Get conflicting bookings if not available
        let conflictingSlots = [];
        if (!isAvailable) {
            conflictingSlots = driver.availability.bookedSlots.filter(slot => {
                if (slot.status !== 'active') return false;
                
                const slotStart = new Date(slot.startTime);
                const slotEnd = new Date(slot.endTime);
                
                return startTime < slotEnd && endTime > slotStart;
            });
        }
        
        res.json({
            driverId: driver._id,
            driverName: driver.user.name,
            requestedTimeSlot: {
                startTime,
                endTime
            },
            isAvailable,
            conflictingBookings: conflictingSlots.length,
            conflictingSlots: conflictingSlots.map(slot => ({
                startTime: slot.startTime,
                endTime: slot.endTime,
                bookingId: slot.bookingId
            })),
            // Suggest next available time if not available
            ...(isAvailable ? {} : {
                suggestedNextAvailable: driver.availability.bookedSlots
                    .filter(slot => slot.status === 'active' && new Date(slot.endTime) > startTime)
                    .sort((a, b) => new Date(a.endTime) - new Date(b.endTime))[0]?.endTime
            })
        });
    } catch (err) {
        console.error('Error checking driver availability:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   GET api/drivers/all-drivers
// @desc    Get all drivers without any filters (for admin use)
// @access  Public
router.get('/all-drivers', async (req, res) => {
    try {
        const drivers = await Driver.find()
            .populate('user', 'name email phone profilePicture');
        
        if (drivers.length === 0) {
            return res.status(404).json({ msg: 'No drivers found.' });
        }
        
        // Add booking statistics
        const driversWithStats = drivers.map(driver => {
            const driverObj = driver.toObject();
            const activeSlots = driver.availability.bookedSlots.filter(slot => slot.status === 'active');
            const completedSlots = driver.availability.bookedSlots.filter(slot => slot.status === 'completed');
            
            driverObj.bookingStats = {
                activeBookings: activeSlots.length,
                completedBookings: completedSlots.length,
                isCurrentlyBooked: activeSlots.some(slot => {
                    const now = new Date();
                    return now >= new Date(slot.startTime) && now <= new Date(slot.endTime);
                })
            };
            
            return driverObj;
        });
        
        res.json(driversWithStats);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/drivers/cleanup-slots
// @desc    Cleanup old completed/cancelled booking slots for all drivers
// @access  Private (Admin only - add admin auth middleware if needed)
router.post('/cleanup-slots', auth, async (req, res) => {
    try {
        const drivers = await Driver.find();
        let cleanedCount = 0;
        
        for (const driver of drivers) {
            const oldSlotCount = driver.availability.bookedSlots.length;
            await driver.cleanupOldSlots();
            const newSlotCount = driver.availability.bookedSlots.length;
            
            if (oldSlotCount > newSlotCount) {
                cleanedCount++;
                console.log(`🧹 Cleaned ${oldSlotCount - newSlotCount} old slots for driver ${driver._id}`);
            }
        }
        
        res.json({
            msg: `Cleanup completed for ${cleanedCount} drivers`,
            driversProcessed: drivers.length,
            driversWithCleanedSlots: cleanedCount
        });
    } catch (err) {
        console.error('Error cleaning up slots:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   POST api/drivers
// @desc    Create or update driver profile
// @access  Private
router.post('/', [
    auth,
    body('vehicle.make', 'Vehicle make is required').not().isEmpty(),
    body('vehicle.model', 'Vehicle model is required').not().isEmpty(),
    body('vehicle.licensePlate', 'License plate is required').not().isEmpty(),
    body('vehicle.color', 'Vehicle color is required').not().isEmpty(),
    body('pricing.hourlyRate', 'Hourly rate is required').isNumeric(),
    body('ageRange', 'Age range is required').isIn(['20-30', '30-40', '40+']),
    body('yearsOfExperience', 'Years of experience is required').isNumeric(),
    body('transmissionProficiency', 'Transmission proficiency is required').isIn(['manual', 'automatic', 'both'])
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    const {
        vehicle,
        pricing,
        bio,
        ageRange,
        yearsOfExperience,
        transmissionProficiency,
        vehicleTypesComfortable,
        preferredServiceAreas,
        timeAvailability,
        openToServices,
        languagesSpoken,
        isAvailable,
        currentLocation
    } = req.body;
    
    const driverFields = {
        user: req.user.id,
        email: req.user.email, // Get email from authenticated user
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
        },
        'availability.isAvailable': isAvailable !== undefined ? isAvailable : true
    };
    
    // Add current location if provided
    if (currentLocation) {
        // If currentLocation is provided as coordinates [longitude, latitude]
        if (Array.isArray(currentLocation) && currentLocation.length === 2) {
            driverFields.currentLocation = {
                type: 'Point',
                coordinates: currentLocation
            };
        } 
        // If currentLocation is provided as an object with address
        else if (typeof currentLocation === 'object' && currentLocation.address) {
            driverFields.currentLocation = {
                type: 'Point',
                coordinates: currentLocation.coordinates || [30.0619, -1.9441],
                address: currentLocation.address
            };
        }
    }
    
    try {
        let driver = await Driver.findOne({ user: req.user.id });
        
        if (driver) {
            // Update existing driver
            driver = await Driver.findOneAndUpdate(
                { user: req.user.id },
                { $set: driverFields },
                { new: true }
            ).populate('user', 'name email phone profilePicture');
            
            console.log(`✅ Driver profile updated: ${driver._id}`);
            return res.json(driver);
        }
        
        // Create new driver
        const newDriver = new Driver(driverFields);
        await newDriver.save();
        
        const populatedDriver = await Driver.findById(newDriver._id)
            .populate('user', 'name email phone profilePicture');
            
        console.log(`✅ New driver profile created: ${populatedDriver._id}`);
        res.json(populatedDriver);
        
    } catch (err) {
        console.error('Error creating/updating driver:', err.message);
        
        if (err.code === 11000) {
            const duplicateField = Object.keys(err.keyPattern)[0];
            return res.status(400).json({ 
                msg: `${duplicateField} already exists. Please use a different ${duplicateField}.` 
            });
        }
        
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   PUT api/drivers/availability
// @desc    Toggle driver availability
// @access  Private
router.put('/availability', auth, async (req, res) => {
    try {
        const { isAvailable, currentLocation } = req.body;
        
        const driver = await Driver.findOne({ user: req.user.id });
        if (!driver) {
            return res.status(404).json({ msg: 'Driver profile not found' });
        }
        
        // Check if driver has active bookings before allowing unavailable status
        if (!isAvailable) {
            const activeSlots = driver.availability.bookedSlots.filter(slot => {
                if (slot.status !== 'active') return false;
                
                const now = new Date();
                const slotStart = new Date(slot.startTime);
                const slotEnd = new Date(slot.endTime);
                
                // Check if there's an active booking happening now
                return now >= slotStart && now <= slotEnd;
            });
            
            if (activeSlots.length > 0) {
                return res.status(400).json({ 
                    msg: 'Cannot set unavailable while you have active bookings in progress',
                    activeBookings: activeSlots.length
                });
            }
        }
        
        driver.availability.isAvailable = isAvailable;
        
        // Update current location if provided
        if (currentLocation) {
            // If currentLocation is provided as coordinates [longitude, latitude]
            if (Array.isArray(currentLocation) && currentLocation.length === 2) {
                driver.currentLocation = {
                    type: 'Point',
                    coordinates: currentLocation
                };
            } 
            // If currentLocation is provided as an object with address
            else if (typeof currentLocation === 'object' && currentLocation.address) {
                driver.currentLocation = {
                    type: 'Point',
                    coordinates: currentLocation.coordinates || [30.0619, -1.9441],
                    address: currentLocation.address
                };
            }
        }
        
        await driver.save();
        
        console.log(`✅ Driver ${driver._id} availability updated to: ${isAvailable}`);
        res.json({
            driverId: driver._id,
            isAvailable: driver.availability.isAvailable,
            currentLocation: driver.currentLocation,
            message: isAvailable ? 'You are now available for bookings' : 'You are now unavailable for new bookings'
        });
        
    } catch (err) {
        console.error('Error updating availability:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   GET api/drivers/profile
// @desc    Get driver profile with booking statistics
// @access  Private
router.get('/profile', auth, async (req, res) => {
    try {
        const driver = await Driver.findOne({ user: req.user.id })
            .populate('user', 'name email phone profilePicture');
        
        if (!driver) {
            return res.status(404).json({ msg: 'Driver profile not found' });
        }
        
        // Add booking statistics
        const driverObj = driver.toObject();
        const now = new Date();
        
        const activeSlots = driver.availability.bookedSlots.filter(slot => slot.status === 'active');
        const completedSlots = driver.availability.bookedSlots.filter(slot => slot.status === 'completed');
        
        // Find current active booking
        const currentBooking = activeSlots.find(slot => {
            const slotStart = new Date(slot.startTime);
            const slotEnd = new Date(slot.endTime);
            return now >= slotStart && now <= slotEnd;
        });
        
        // Find next upcoming booking
        const upcomingBookings = activeSlots.filter(slot => {
            const slotStart = new Date(slot.startTime);
            return slotStart > now;
        }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        
        driverObj.bookingStats = {
            totalActiveBookings: activeSlots.length,
            totalCompletedBookings: completedSlots.length,
            currentlyInBooking: !!currentBooking,
            currentBooking: currentBooking ? {
                bookingId: currentBooking.bookingId,
                startTime: currentBooking.startTime,
                endTime: currentBooking.endTime
            } : null,
            nextBooking: upcomingBookings[0] ? {
                bookingId: upcomingBookings[0].bookingId,
                startTime: upcomingBookings[0].startTime,
                endTime: upcomingBookings[0].endTime
            } : null,
            upcomingBookingsCount: upcomingBookings.length
        };
        
        res.json(driverObj);
    } catch (err) {
        console.error('Error fetching driver profile:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   PUT api/drivers/location
// @desc    Update driver's current location
// @access  Private
router.put('/location', auth, async (req, res) => {
    try {
        const { coordinates, address } = req.body;
        
        if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
            return res.status(400).json({ 
                msg: 'Valid coordinates [longitude, latitude] are required' 
            });
        }
        
        const driver = await Driver.findOne({ user: req.user.id });
        if (!driver) {
            return res.status(404).json({ msg: 'Driver profile not found' });
        }
        
        driver.currentLocation = {
            type: 'Point',
            coordinates,
            address: address || ''
        };
        
        await driver.save();
        
        console.log(`✅ Driver ${driver._id} location updated`);
        res.json({
            driverId: driver._id,
            currentLocation: driver.currentLocation,
            message: 'Location updated successfully'
        });
        
    } catch (err) {
        console.error('Error updating location:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   POST api/drivers/profile-picture
// @desc    Upload driver profile picture
// @access  Private
router.post('/profile-picture', auth, upload.single('profilePicture'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded' });
        }
        
        const driver = await Driver.findOne({ user: req.user.id });
        if (!driver) {
            return res.status(404).json({ msg: 'Driver profile not found' });
        }
        
        const profilePicturePath = `/uploads/profiles/${req.file.filename}`;
        
        driver.profilePicture = profilePicturePath;
        await driver.save();
        
        console.log(`✅ Driver ${driver._id} profile picture updated`);
        res.json({
            driverId: driver._id,
            profilePicture: profilePicturePath,
            message: 'Profile picture updated successfully'
        });
        
    } catch (err) {
        console.error('Error uploading profile picture:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

module.exports = router;
