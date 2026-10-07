"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const BookingSchema = new mongoose_1.default.Schema({
    customer: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    driver: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true
    },
    pickupLocation: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        },
        address: {
            type: String,
            required: true
        }
    },
    dropoffLocation: {
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: [Number],
        address: String
    },
    bookingType: {
        type: String,
        enum: ['once', 'daily', 'weekly', 'monthly'],
        default: 'once'
    },
    duration: {
        value: { type: Number, required: true },
        unit: { type: String, enum: ['hours', 'days', 'weeks', 'months'], required: true }
    },
    scheduledTime: {
        type: Date,
        default: Date.now
    },
    // New fields for enhanced booking experience
    vehicleType: {
        type: String,
        enum: ['sedan', 'suv', 'van', 'pickup', 'luxury']
    },
    transmissionType: {
        type: String,
        enum: ['manual', 'automatic', 'both']
    },
    distance: {
        type: Number,
        default: 0
    },
    language: {
        type: String,
        enum: ['english', 'kinyarwanda', 'french'],
        default: 'english'
    },
    // Timeline and status tracking
    actualStartTime: {
        type: Date
    },
    actualEndTime: {
        type: Date
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'started', 'completed', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['MomoPay Code 123456', 'mtn_money', 'airtel_money', 'card', 'paypal', 'cash'],
        required: true
    },
    pricing: {
        baseAmount: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        totalAmount: { type: Number, default: 0 }
    },
    rating: {
        customerRating: { type: Number, min: 1, max: 5 },
        driverRating: { type: Number, min: 1, max: 5 },
        customerReview: String,
        driverReview: String
    },
    timeline: [{
            status: String,
            timestamp: { type: Date, default: Date.now },
            note: String
        }],
    specialRequests: String,
    estimatedArrival: Date,
    estimatedEndTime: Date
}, {
    timestamps: true
});
// Index for geospatial queries
BookingSchema.index({ 'pickupLocation': '2dsphere' });
BookingSchema.index({ 'dropoffLocation': '2dsphere' });
const Booking = mongoose_1.default.model('Booking', BookingSchema);
exports.default = Booking;
