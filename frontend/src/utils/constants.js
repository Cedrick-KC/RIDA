// Application constants

// API Constants
export const API_CONSTANTS = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 15000, // 15 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  HEADERS: {
    CONTENT_TYPE: 'application/json',
    ACCEPT: 'application/json'
  }
};

// Authentication Constants
export const AUTH_CONSTANTS = {
  TOKEN_KEY: 'authToken',
  USER_KEY: 'user',
  REFRESH_TOKEN_KEY: 'refreshToken',
  EXPIRES_IN: '1h', // JWT expiration
  REFRESH_EXPIRES_IN: '7d' // Refresh token expiration
};

// Role Constants
export const ROLE_CONSTANTS = {
  ADMIN: 'admin',
  DRIVER: 'driver',
  CUSTOMER: 'customer',
  ALL: ['admin', 'driver', 'customer']
};

// Booking Status Constants
export const BOOKING_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  STARTED: 'started',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  ALL: ['pending', 'accepted', 'started', 'completed', 'cancelled']
};

// Payment Status Constants
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  ALL: ['pending', 'processing', 'completed', 'failed', 'refunded']
};

// Vehicle Type Constants
export const VEHICLE_TYPES = {
  STANDARD: 'standard',
  SUV: 'suv',
  LUXURY: 'luxury',
  VAN: 'van',
  ELECTRIC: 'electric',
  ALL: ['standard', 'suv', 'luxury', 'van', 'electric']
};

// Currency Constants
export const CURRENCY_CONSTANTS = {
  DEFAULT: 'RWF',
  SUPPORTED: ['RWF', 'USD', 'EUR', 'GBP', 'KES', 'UGX', 'TZS'],
  SYMBOLS: {
    RWF: '₨',
    USD: '$',
    EUR: '€',
    GBP: '£',
    KES: 'KSh',
    UGX: 'USh',
    TZS: 'TSh'
  }
};

// Language Constants
export const LANGUAGE_CONSTANTS = {
  DEFAULT: 'en',
  SUPPORTED: ['en', 'fr', 'sw', 'kinyarwanda'],
  CODES: {
    en: 'English',
    fr: 'Français',
    sw: 'Kiswahili',
    kinyarwanda: 'Kinyarwanda'
  }
};

// Map Constants
export const MAP_CONSTANTS = {
  DEFAULT_CENTER: { lat: -1.95, lng: 30.06 }, // Kigali, Rwanda
  DEFAULT_ZOOM: 12,
  MAX_ZOOM: 18,
  MIN_ZOOM: 3,
  TILE_SIZE: 256,
  BOUNDS: {
    RWANDA: {
      north: -1.04,
      south: -2.63,
      east: 30.89,
      west: 28.85
    }
  }
};

// Animation Constants
export const ANIMATION_CONSTANTS = {
  DURATION: {
    FAST: 150,
    NORMAL: 250,
    SLOW: 350,
    VERY_SLOW: 500
  },
  EASING: {
    LINEAR: 'linear',
    EASE: 'ease',
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out',
    BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  }
};

// Storage Constants
export const STORAGE_CONSTANTS = {
  THEME: 'theme',
  LANGUAGE: 'language',
  MAPBOX_TOKEN: 'mapboxToken',
  LAST_LOCATION: 'lastLocation',
  FAVORITE_PLACES: 'favoritePlaces'
};

// Feature Flags
export const FEATURE_FLAGS = {
  VOICE_CONTROL: true,
  AR_PREVIEW: true,
  BIOMETRIC_AUTH: true,
  OFFLINE_MODE: true,
  PUSH_NOTIFICATIONS: true,
  ANALYTICS: true
};

// Pricing Constants
export const PRICING_CONSTANTS = {
  BASE_FARE: 15000, // RWF for first day
  ADDITIONAL_DAY_FARE: 10000, // RWF per additional day
  PER_KM_RATE: 500, // RWF per kilometer
  WAITING_RATE: 200, // RWF per minute
  SURGE_MULTIPLIER_MAX: 3.0,
  DISCOUNT_THRESHOLD: 10, // Discount after 10 rides
  DISCOUNT_PERCENTAGE: 0.1 // 10% discount
};

// Rating Constants
export const RATING_CONSTANTS = {
  MIN: 1,
  MAX: 5,
  STEP: 0.5,
  DEFAULT: 5
};

// File Upload Constants
export const FILE_UPLOAD_CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ACCEPTED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Authentication required. Please log in.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'An internal server error occurred.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  TIMEOUT_ERROR: 'The request timed out. Please try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Logged in successfully.',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  REGISTRATION_SUCCESS: 'Registration successful. Please check your email to verify your account.',
  PROFILE_UPDATE_SUCCESS: 'Profile updated successfully.',
  PASSWORD_CHANGE_SUCCESS: 'Password changed successfully.',
  BOOKING_SUCCESS: 'Booking confirmed successfully.',
  PAYMENT_SUCCESS: 'Payment processed successfully.',
  REVIEW_SUCCESS: 'Thank you for your review!'
};

// Route Constants
export const ROUTE_CONSTANTS = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',

  // Customer routes
  CUSTOMER_DASHBOARD: '/customer',
  BOOKING: '/booking',
  BOOKING_HISTORY: '/customer/history',
  PROFILE: '/profile',

  // Driver routes
  DRIVER_DASHBOARD: '/driver',
  DRIVER_PROFILE: '/driver/profile',
  DRIVER_EARNINGS: '/driver/earnings',

  // Admin routes
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_DRIVERS: '/admin/drivers',
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_REVIEWS: '/admin/reviews',
  ADMIN_ANALYTICS: '/admin/analytics',

  // Other routes
  FARE_CALCULATOR: '/fare-calculator',
  REVIEWS: '/reviews',
  HELP: '/help',
  ABOUT: '/about',
  CONTACT: '/contact'
};

export default {
  API_CONSTANTS,
  AUTH_CONSTANTS,
  ROLE_CONSTANTS,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  VEHICLE_TYPES,
  CURRENCY_CONSTANTS,
  LANGUAGE_CONSTANTS,
  MAP_CONSTANTS,
  ANIMATION_CONSTANTS,
  STORAGE_CONSTANTS,
  FEATURE_FLAGS,
  PRICING_CONSTANTS,
  RATING_CONSTANTS,
  FILE_UPLOAD_CONSTANTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ROUTE_CONSTANTS
};