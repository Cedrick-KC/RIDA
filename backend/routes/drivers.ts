import express from 'express';
import { body, validationResult } from 'express-validator';
import Driver from '../models/Driver';
import User from '../models/User';
import auth from '../middleware/auth';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
    destination: function (req: any, file: any, cb: any) {
        cb(null, path.join(__dirname, '../uploads/profiles'));
    },
    filename: function (req: any, file: any, cb: any) {
        cb(null, `driver-${Date.now()}-${file.fieldname}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB limit
    },
    fileFilter: (req: any, file: any, cb: any) => {
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
const calculateEndTime = (startTime: Date, duration: { value: number; unit: string }): Date => {
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
router.get('/', async (req: any, res: any) => {
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
            scheduledTime,
            duration
        } = req.query;

        let query: any = { 'availability.isAvailable': true };
        let sortOptions: any = {};

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

        // DEBUG: Log query and check what we're looking for
        console.log('🔍 Drivers query:', JSON.stringify(query, null, 2));

        // Get all potentially available drivers
        let drivers = await Driver.find(query)
            .populate('user', 'name email phone profilePicture')
            .sort(sortOptions);

        // DEBUG: Check what we actually got
        console.log('📊 Found drivers:', drivers.length);
        drivers.forEach((driver: any, index: number) => {
            console.log(`Driver ${index + 1}:`, {
                id: driver._id,
                hasUser: !!driver.user,
                user: driver.user ? {
                    id: driver.user._id,
                    name: driver.user.name,
                    email: driver.user.email,
                    phone: driver.user.phone
                } : 'NULL/UNDEFINED',
                userField: driver.user // Raw user field
            });
        });

        // Apply time-based filtering if scheduledTime and duration are provided
        if (scheduledTime && duration) {
            try {
                const startTime = new Date(scheduledTime);
                const parsedDuration = JSON.parse(duration);
                const endTime = calculateEndTime(startTime, parsedDuration);
                console.log(`🔍 Filtering drivers for time slot: ${startTime} to ${endTime}`);

                drivers = drivers.filter((driver: any) => {
                    const isAvailable = driver.isAvailableForTimeSlot(startTime, endTime);
                    if (!isAvailable) {
                        console.log(`❌ Driver ${driver._id} not available for requested time slot`);
                    }
                    return isAvailable;
                });
                console.log(`✅ Found ${drivers.length} available drivers for the requested time slot`);
            } catch (timeFilterError: any) {
                console.error('Error applying time-based filtering:', timeFilterError);
            }
        }

        if (drivers.length === 0) {
            const message = scheduledTime && duration
                ? 'No drivers available for the requested time slot. Please try a different time or duration.'
                : 'No drivers found matching your criteria.';

            return res.status(404).json({ msg: message });
        }

        // Add availability info to response
        const driversWithAvailability = drivers.map((driver: any) => {
            const driverObj = driver.toObject();

            // DEBUG: Check if user is still there after toObject()
            if (!driverObj.user) {
                console.error('❌ Driver user object missing after toObject():', driverObj._id);
            }

            const activeSlots = driver.availability.bookedSlots.filter((slot: any) => slot.status === 'active');
            driverObj.currentBookings = activeSlots.length;

            if (activeSlots.length > 0) {
                const nextAvailable = activeSlots
                    .map((slot: any) => new Date(slot.endTime))
                    .sort((a: any, b: any) => b - a)[0];
                driverObj.nextAvailableTime = nextAvailable;
            }

            return driverObj;
        });

        // FINAL DEBUG: Check what we're sending to frontend
        console.log('🚀 Sending to frontend:', driversWithAvailability.length, 'drivers');
        console.log('First driver structure:', JSON.stringify(driversWithAvailability[0], null, 2));

        res.json(driversWithAvailability);
    } catch (err: any) {
        console.error('Error fetching drivers:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   GET api/drivers/all-drivers
// @desc    Get all drivers without any filters (for admin use)
// @access  Public
router.get('/all-drivers', async (req: any, res: any) => {
    try {
        const drivers = await Driver.find()
            .populate('user', 'name email phone profilePicture');

        if (drivers.length === 0) {
            return res.status(404).json({ msg: 'No drivers found.' });
        }

        // Add booking statistics
        const driversWithStats = drivers.map((driver: any) => {
            const driverObj = driver.toObject();
            const activeSlots = driver.availability.bookedSlots.filter((slot: any) => slot.status === 'active');
            const completedSlots = driver.availability.bookedSlots.filter((slot: any) => slot.status === 'completed');

            driverObj.bookingStats = {
                activeBookings: activeSlots.length,
                completedBookings: completedSlots.length,
                isCurrentlyBooked: activeSlots.some((slot: any) => {
                    const now = new Date();
                    return now >= new Date(slot.startTime) && now <= new Date(slot.endTime);
                })
            };

            return driverObj;
        });

        res.json(driversWithStats);
    } catch (err: any) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/drivers/cleanup-slots
// @desc    Cleanup old completed/cancelled booking slots for all drivers
// @access  Private (Admin only - add admin auth middleware if needed)
router.post('/cleanup-slots', auth, async (req: any, res: any) => {
    try {
        const drivers = await Driver.find();
        let cleanedCount = 0;

        for (const driver of drivers) {
            const oldSlotCount = driver.availability!.bookedSlots.length;
            await (driver as any).cleanupOldSlots();
            const newSlotCount = driver.availability!.bookedSlots.length;

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
    } catch (err: any) {
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
], async (req: any, res: any) => {
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
        openToServices,
        languagesSpoken,
        isAvailable,
        currentLocation,
        timeAvailability
    } = req.body;

    const driverFields: any = {
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
            const updatedDriver = await Driver.findOneAndUpdate(
                { user: req.user.id },
                { $set: driverFields },
                { new: true }
            ).populate('user', 'name email phone profilePicture');

            if (!updatedDriver) {
                throw new Error('Failed to update driver');
            }

            console.log(`✅ Driver profile updated: ${updatedDriver._id}`);
            return res.json(updatedDriver);
        }

        // Create new driver
        const newDriver = new Driver(driverFields);
        await newDriver.save();

        const populatedDriver = await Driver.findById(newDriver._id)
            .populate('user', 'name email phone profilePicture');

        if (!populatedDriver) {
            throw new Error('Failed to retrieve created driver');
        }

        console.log(`✅ New driver profile created: ${populatedDriver._id}`);
        res.json(populatedDriver);

    } catch (err: any) {
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
router.put('/availability', auth, async (req: any, res: any) => {
    try {
        const { isAvailable, currentLocation } = req.body;

        const driver = await Driver.findOne({ user: req.user.id });
        if (!driver) {
            return res.status(404).json({ msg: 'Driver profile not found' });
        }

        // Check if driver has active bookings before allowing unavailable status
        if (!isAvailable) {
            const activeSlots = driver.availability!.bookedSlots.filter((slot: any) => {
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

        driver.availability!.isAvailable = isAvailable;

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
            isAvailable: driver.availability!.isAvailable,
            currentLocation: driver.currentLocation,
            message: isAvailable ? 'You are now available for bookings' : 'You are now unavailable for new bookings'
        });

    } catch (err: any) {
        console.error('Error updating availability:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   PUT api/drivers/location
// @desc    Update driver's current location
// @access  Private
router.put('/location', auth, async (req: any, res: any) => {
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

    } catch (err: any) {
        console.error('Error updating location:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   POST api/drivers/profile-picture
// @desc    Upload driver profile picture
// @access  Private
router.post('/profile-picture', auth, upload.single('profilePicture'), async (req: any, res: any) => {
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

    } catch (err: any) {
        console.error('Error uploading profile picture:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   POST api/drivers/match
// @desc    AI-powered driver matching based on booking requirements
// @access  Public
router.post('/match', [
    body('pickupLocation').not().isEmpty().withMessage('Pickup location is required'),
    body('dropoffLocation').not().isEmpty().withMessage('Dropoff location is required'),
    body('scheduledTime').not().isEmpty().withMessage('Scheduled time is required'),
    body('duration').not().isEmpty().withMessage('Duration is required'),
    body('passengerCount').optional().isInt({ min: 1, max: 8 }).withMessage('Passenger count must be between 1 and 8'),
    body('luggage').optional().isString().withMessage('Luggage description must be a string'),
    body('specialRequirements').optional().isString().withMessage('Special requirements must be a string')
], async (req: any, res: any) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            pickupLocation,
            dropoffLocation,
            scheduledTime,
            duration,
            passengerCount = 1,
            luggage = '',
            specialRequirements = ''
        } = req.body;

        // Parse duration
        let parsedDuration: { value: number; unit: string };
        try {
            parsedDuration = typeof duration === 'string' ? JSON.parse(duration) : duration;
        } catch (e) {
            return res.status(400).json({ msg: 'Invalid duration format' });
        }

        // Calculate end time
        const startTime = new Date(scheduledTime);
        const { value, unit } = parsedDuration;
        let endTime: Date;

        switch (unit) {
            case 'hours':
                endTime = new Date(startTime.getTime() + value * 60 * 60 * 1000);
                break;
            case 'days':
                endTime = new Date(startTime.getTime() + value * 24 * 60 * 60 * 1000);
                break;
            case 'weeks':
                endTime = new Date(startTime.getTime() + value * 7 * 24 * 60 * 60 * 1000);
                break;
            case 'months':
                endTime = new Date(startTime.getTime() + value * 30 * 24 * 60 * 60 * 1000);
                break;
            default:
                return res.status(400).json({ msg: 'Invalid duration unit' });
        }

        // Find available drivers for the time slot
        const availableDrivers = await Driver.find({
            'availability.isAvailable': true
        }).populate('user', 'name email phone profilePicture');

        if (availableDrivers.length === 0) {
            return res.status(404).json({
                msg: 'No drivers available for the requested time slot',
                matches: []
            });
        }

        // AI-powered matching algorithm
        const matches = await Promise.all(
            availableDrivers.map(async (driver: any) => {
                // Skip if driver is not available for the specific time slot
                const isAvailable = driver.isAvailableForTimeSlot(startTime, endTime);
                if (!isAvailable) {
                    return null;
                }

                // Calculate match score (0-100)
                let score = 0;
                const maxScore = 100;
                const scoreBreakdown: any = {};

                // 1. Vehicle capacity match (20 points)
                const vehicleCapacityScore = await calculateVehicleCapacityScore(driver, passengerCount, luggage);
                score += vehicleCapacityScore;
                scoreBreakdown.vehicleCapacity = vehicleCapacityScore;

                // 2. Experience and rating match (20 points)
                const experienceRatingScore = calculateExperienceRatingScore(driver);
                score += experienceRatingScore;
                scoreBreakdown.experienceRating = experienceRatingScore;

                // 3. Location proximity match (20 points)
                const locationScore = await calculateLocationProximityScore(driver, pickupLocation, dropoffLocation);
                score += locationScore;
                scoreBreakdown.locationProximity = locationScore;

                // 4. Service type and special requirements match (20 points)
                const serviceMatchScore = calculateServiceMatchScore(driver, specialRequirements);
                score += serviceMatchScore;
                scoreBreakdown.serviceMatch = serviceMatchScore;

                // 5. Language and communication match (10 points)
                const languageScore = calculateLanguageScore(driver, specialRequirements);
                score += languageScore;
                scoreBreakdown.language = languageScore;

                // 6. Price value match (10 points)
                const priceValueScore = calculatePriceValueScore(driver, parsedDuration);
                score += priceValueScore;
                scoreBreakdown.priceValue = priceValueScore;

                // Normalize score to 0-100 range
                const finalScore = Math.min(Math.max(score, 0), maxScore);

                // Only include drivers with a minimum match score
                if (finalScore >= 30) {
                    const driverObj = driver.toObject();
                    return {
                        driver: driverObj,
                        matchScore: finalScore,
                        scoreBreakdown,
                        matchReason: generateMatchReason(scoreBreakdown, finalScore)
                    };
                }

                return null;
            })
        );

        // Filter out null matches and sort by score descending
        const validMatches = matches
            .filter((match: any) => match !== null)
            .sort((a: any, b: any) => b.matchScore - a.matchScore);

        // Limit to top 10 matches
        const topMatches = validMatches.slice(0, 10);

        res.json({
            msg: `Found ${topMatches.length} matching drivers`,
            matches: topMatches,
            searchCriteria: {
                pickupLocation,
                dropoffLocation,
                scheduledTime,
                duration,
                passengerCount,
                luggage,
                specialRequirements
            }
        });

    } catch (err: any) {
        console.error('Error in driver matching:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// Helper function to calculate vehicle capacity score
async function calculateVehicleCapacityScore(driver: any, passengerCount: number, luggage: string): Promise<number> {
    let score = 0;
    const maxScore = 20;

    // Check vehicle type compatibility
    const vehicleType = driver.vehicle?.type || '';
    const vehicleMake = driver.vehicle?.make || '';
    const vehicleModel = driver.vehicle?.model || '';

    // Base score for having a vehicle
    if (vehicleType && vehicleMake && vehicleModel) {
        score += 5;
    }

    // Adjust based on passenger count
    if (passengerCount <= 4) {
        // Most vehicles can handle 1-4 passengers
        score += 10;
    } else if (passengerCount <= 6) {
        // Need SUV, van, or larger vehicle
        const suitableTypes = ['suv', 'van', 'luxury'];
        if (suitableTypes.includes(vehicleType.toLowerCase())) {
            score += 10;
        } else {
            score += 5; // Partial match
        }
    } else {
        // Need van or special vehicle
        if (vehicleType.toLowerCase() === 'van') {
            score += 10;
        } else {
            score += 0; // Poor match
        }
    }

    // Adjust for luggage (simplified)
    if (luggage.trim() !== '') {
        // If there's luggage, prefer vehicles with trunk space
        const luggageFriendlyTypes = ['suv', 'van', 'luxury'];
        if (luggageFriendlyTypes.includes(vehicleType.toLowerCase())) {
            score += 5;
        } else {
            score += 2; // Some penalty for luggage in small cars
        }
    } else {
        score += 5; // No luggage, full points
    }

    return Math.min(score, maxScore);
}

// Helper function to calculate experience and rating score
function calculateExperienceRatingScore(driver: any): number {
    let score = 0;
    const maxScore = 20;

    // Experience score (0-10 points)
    const yearsExperience = driver.yearsOfExperience || 0;
    if (yearsExperience >= 5) {
        score += 10; // Expert
    } else if (yearsExperience >= 3) {
        score += 8; // Experienced
    } else if (yearsExperience >= 1) {
        score += 5; // Some experience
    } else {
        score += 2; // New driver
    }

    // Rating score (0-10 points)
    const rating = driver.rating || 0;
    if (rating >= 4.8) {
        score += 10; // Excellent
    } else if (rating >= 4.5) {
        score += 8; // Very good
    } else if (rating >= 4.0) {
        score += 6; // Good
    } else if (rating >= 3.5) {
        score += 4; // Fair
    } else if (rating >= 3.0) {
        score += 2; // Needs improvement
    } else {
        score += 0; // Poor
    }

    return Math.min(score, maxScore);
}

// Helper function to calculate location proximity score
async function calculateLocationProximityScore(driver: any, pickupLocation: any, dropoffLocation: any): Promise<number> {
    let score = 0;
    const maxScore = 20;

    // This is a simplified version - in a real app, you'd use geocoding and distance calculation
    // For now, we'll give a base score and adjust based on some factors

    // Base score for having location information
    if (driver.currentLocation && driver.currentLocation.coordinates) {
        score += 10;
    }

    // Prefer drivers who are already in service areas or near common pickup/drop-off points
    // In a real implementation, you'd calculate actual distances

    // Simulate proximity scoring based on service areas
    const serviceAreas = driver.preferredServiceAreas || [];
    if (serviceAreas.length > 0) {
        score += 5; // Has preferred service areas
    }

    // Bonus for being flexible with time/location
    if (driver.timeAvailability === 'flexible') {
        score += 3;
    }

    // Bonus for being open to various service types
    const openToServices = driver.openToServices || [];
    if (openToServices.length >= 3) {
        score += 2;
    }

    return Math.min(score, maxScore);
}

// Helper function to calculate service type and special requirements match
function calculateServiceMatchScore(driver: any, specialRequirements: string): number {
    let score = 0;
    const maxScore = 20;

    // Base score for being open to services
    const openToServices = driver.openToServices || [];
    if (openToServices.length > 0) {
        score += 5;
    }

    // Check for special requirements matching
    if (specialRequirements.trim() !== '') {
        const reqLower = specialRequirements.toLowerCase();

        // Check if driver mentions special skills or equipment in bio
        const bio = driver.bio || '';
        if (bio.toLowerCase().includes(reqLower)) {
            score += 10; // Good match for special requirements
        }

        // Check for specific service types
        const serviceMatches = [
            { keyword: 'wheelchair', service: 'wheelchairAccessible' },
            { keyword: 'pet', service: 'petFriendly' },
            { keyword: 'baby', service: 'babySeat' },
            { keyword: 'luggage', service: 'luggageAssistance' },
            { keyword: 'elderly', service: 'elderlyAssistance' },
            { keyword: 'tourist', service: 'tourGuide' },
            { keyword: 'business', service: 'corporate' },
            { keyword: 'event', service: 'eventTransport' }
        ];

        for (const match of serviceMatches) {
            if (reqLower.includes(match.keyword)) {
                // In a real implementation, you'd check if driver has this service/service
                // For now, give partial credit for being open to various services
                if (openToServices.length > 0) {
                    score += 5;
                }
                break;
            }
        }
    } else {
        // No special requirements, give points for being service-oriented
        if (openToServices.includes('customerService') || openToServices.length >= 2) {
            score += 10;
        }
    }

    return Math.min(score, maxScore);
}

// Helper function to calculate language and communication score
function calculateLanguageScore(driver: any, specialRequirements: string): number {
    let score = 0;
    const maxScore = 10;

    // Language skills (5 points)
    const languages = driver.languagesSpoken || [];
    if (languages.length > 0) {
        score += 3; // Speaks at least one language
        if (languages.length >= 2) {
            score += 2; // Speaks multiple languages
        }
    }

    // Communication skills inferred from bio and ratings (5 points)
    const bio = driver.bio || '';
    if (bio.length > 50) { // Has detailed bio
        score += 2;
    }

    const rating = driver.rating || 0;
    if (rating >= 4.0) {
        score += 3; // Good rating suggests good communication
    }

    return Math.min(score, maxScore);
}

// Helper function to calculate price value score
function calculatePriceValueScore(driver: any, duration: { value: number; unit: string }): number {
    let score = 0;
    const maxScore = 10;

    // This is a simplified version - in a real app, you'd calculate actual cost
    // and compare to market rates or user's budget preferences

    // Base score for having pricing information
    if (driver.pricing && driver.pricing.hourlyRate) {
        score += 5;
    }

    // Prefer drivers with transparent pricing
    if (driver.pricing.dailyRate && driver.pricing.weeklyRate && driver.pricing.monthlyRate) {
        score += 3;
    }

    // Bonus for value-based pricing (simulated)
    // In a real implementation, you'd analyze the pricing vs. market rates
    // For now, we'll give a baseline score
    score += 2;

    return Math.min(score, maxScore);
}

// Helper function to generate match reason explanation
function generateMatchReason(scoreBreakdown: any, finalScore: number): string {
    const reasons: string[] = [];

    if (scoreBreakdown.vehicleCapacity >= 15) {
        reasons.push('Excellent vehicle capacity for your needs');
    } else if (scoreBreakdown.vehicleCapacity >= 10) {
        reasons.push('Good vehicle capacity match');
    }

    if (scoreBreakdown.experienceRating >= 15) {
        reasons.push('Highly experienced and well-rated driver');
    } else if (scoreBreakdown.experienceRating >= 10) {
        reasons.push('Experienced driver with good ratings');
    }

    if (scoreBreakdown.locationProximity >= 15) {
        reasons.push('Driver is conveniently located near your route');
    } else if (scoreBreakdown.locationProximity >= 10) {
        reasons.push('Driver is reasonably close to your pickup location');
    }

    if (scoreBreakdown.serviceMatch >= 15) {
        reasons.push('Driver well-suited for your special requirements');
    } else if (scoreBreakdown.serviceMatch >= 10) {
        reasons.push('Driver can accommodate your service needs');
    }

    if (scoreBreakdown.language >= 7) {
        reasons.push('Driver has good language and communication skills');
    }

    if (scoreBreakdown.priceValue >= 7) {
        reasons.push('Driver offers good value for the service');
    }

    if (reasons.length === 0) {
        reasons.push('Basic match available');
    }

    return reasons.join('. ') + '.';
}

export default router;