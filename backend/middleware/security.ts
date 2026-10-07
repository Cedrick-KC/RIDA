import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';

/**
 * Security middleware configuration
 */
const securityMiddleware = () => {
  // Helmet for security headers
  const helmetMiddleware = helmet({
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
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
  });

  // Prevent MongoDB operator injection
  const mongoSanitizeMiddleware = mongoSanitize();

  // Prevent XSS attacks
  // @ts-ignore: xss-clean may not have type definitions
  const xssMiddleware = xss();

  // Prevent HTTP parameter pollution
  // @ts-ignore: hpp may not have type definitions despite @types/hpp being installed
  const hppMiddleware = hpp({
    whitelist: [] // Add parameters that should allow duplicates if needed
  });

  return [helmetMiddleware, limiter, mongoSanitizeMiddleware, xssMiddleware, hppMiddleware];
};

export default securityMiddleware;