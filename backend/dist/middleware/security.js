"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const xss_clean_1 = __importDefault(require("xss-clean"));
const hpp_1 = __importDefault(require("hpp"));
/**
 * Security middleware configuration
 */
const securityMiddleware = () => {
    // Helmet for security headers
    const helmetMiddleware = (0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "unpkg.com"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'"],
                frameSrc: ["'self'"],
                objectSrc: ["'none'"],
                upgradeInsecureRequests: []
            }
        },
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
        // @ts-ignore: permissionsPolicy may not exist in older versions of @types/helmet
        // permissionsPolicy: {
        //   features: {
        //     geolocation: ['self'],
        //     microphone: [], // Disable by default, enable when needed for voice features
        //     camera: [], // Disable by default, enable when needed for AR features
        //     payment: ['self']
        //   }
        // }
    });
    // Rate limiting to prevent brute force attacks
    const limiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message: {
            error: 'Too many requests from this IP, please try again after 15 minutes'
        },
        standardHeaders: true,
        legacyHeaders: false
    });
    // Prevent MongoDB operator injection
    const mongoSanitizeMiddleware = (0, express_mongo_sanitize_1.default)();
    // Prevent XSS attacks
    // @ts-ignore: xss-clean may not have type definitions
    const xssMiddleware = (0, xss_clean_1.default)();
    // Prevent HTTP parameter pollution
    // @ts-ignore: hpp may not have type definitions despite @types/hpp being installed
    const hppMiddleware = (0, hpp_1.default)({
        whitelist: [] // Add parameters that should allow duplicates if needed
    });
    return [helmetMiddleware, limiter, mongoSanitizeMiddleware, xssMiddleware, hppMiddleware];
};
exports.default = securityMiddleware;
