const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true, 
        trim: true,
        lowercase: true
    },
    vehicle: {
        make: { type: String, default: 'Not specified' },
        model: { type: String, default: 'Not specified' },
        year: { type: Number, default: () => new Date().getFullYear() },
        color: { type: String, default: 'Not specified' }
    },
    licensePlate: {  
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    ratings: {
        average: { type: Number, default: 5.0 },
        count: { type: Number, default: 0 }
    },
    pricing: {
        hourlyRate: { type: Number, default: 25 },
        dailyRate: { type: Number, default: 200 },
        weeklyRate: { type: Number, default: 1200 },
        monthlyRate: { type: Number, default: 4000 }
    },
    availability: {
        isAvailable: { type: Boolean, default: true },
        workingHours: {
            start: { type: String, default: '08:00' },
            end: { type: String, default: '18:00' }
        },
        // Add this to the DriverSchema
currentLocation: {
    type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
    },
    coordinates: {
        type: [Number],
        default: [0, 0]
    },
    address: String
},
        // New fields for time-based availability
        bookedSlots: [{
            bookingId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Booking',
                required: true
            },
            startTime: {
                type: Date,
                required: true
            },
            endTime: {
                type: Date,
                required: true
            },
            status: {
                type: String,
                enum: ['active', 'completed', 'cancelled'],
                default: 'active'
            }
        }]
    }
}, {
    timestamps: true
});

// Method to check if driver is available for a specific time period
DriverSchema.methods.isAvailableForTimeSlot = function(startTime, endTime) {
    if (!this.availability.isAvailable) {
        return false;
    }
    
    // Check for overlapping booked slots
    const hasConflict = this.availability.bookedSlots.some(slot => {
        if (slot.status !== 'active') return false;
        
        const slotStart = new Date(slot.startTime);
        const slotEnd = new Date(slot.endTime);
        const requestStart = new Date(startTime);
        const requestEnd = new Date(endTime);
        
        // Check for overlap: new booking starts before existing ends AND new booking ends after existing starts
        return requestStart < slotEnd && requestEnd > slotStart;
    });
    
    return !hasConflict;
};

// Method to add a booked slot
DriverSchema.methods.addBookedSlot = function(bookingId, startTime, endTime) {
    this.availability.bookedSlots.push({
        bookingId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: 'active'
    });
    return this.save();
};

// Method to update booked slot status
DriverSchema.methods.updateBookedSlotStatus = function(bookingId, status) {
    const slot = this.availability.bookedSlots.find(
        slot => slot.bookingId.toString() === bookingId.toString()
    );
    
    if (slot) {
        slot.status = status;
        return this.save();
    }
    return Promise.resolve(this);
};

// Method to remove completed/cancelled slots older than 30 days (cleanup)
DriverSchema.methods.cleanupOldSlots = function() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    this.availability.bookedSlots = this.availability.bookedSlots.filter(slot => {
        if (slot.status === 'active') return true; // Keep active slots
        return new Date(slot.endTime) > thirtyDaysAgo; // Keep recent completed/cancelled slots
    });
    
    return this.save();
};

module.exports = mongoose.model('Driver', DriverSchema);