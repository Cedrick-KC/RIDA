// Utility functions for validating data

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export const validateEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and errors
 */
export const validatePassword = (password) => {
  if (!password) {
    return {
      isValid: false,
      errors: ['Password is required']
    };
  }

  const errors = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one digit');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : null
  };
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @param {string} countryCode - Expected country code (default: '+250' for Rwanda)
 * @returns {boolean} True if valid phone number
 */
export const validatePhoneNumber = (phone, countryCode = '+250') => {
  if (!phone) return false;

  // Remove all non-digit characters except leading +
  const cleaned = phone.replace(/[^\d+]/g, '');

  // Check if it starts with country code
  const expectedDigits = countryCode.replace(/\D/g, '');
  if (!cleaned.startsWith(expectedDigits)) {
    return false;
  }

  // Check length (country code + 10 digits for Rwanda)
  const expectedLength = expectedDigits.length + 10;
  if (cleaned.length !== expectedLength) {
    return false;
  }

  // All remaining characters should be digits
  const numberPart = cleaned.slice(expectedDigits.length);
  return /^\d+$/.test(numberPart);
};

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
export const validateURL = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
};

/**
 * Validate that a value is not empty
 * @param {*} value - Value to validate
 * @returns {boolean} True if not empty
 */
export const validateRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
};

/**
 * Validate that a value matches a pattern
 * @param {string} value - Value to validate
 * @param {RegExp} pattern - Pattern to match against
 * @returns {boolean} True if matches pattern
 */
export const validatePattern = (value, pattern) => {
  if (!value) return false;
  return pattern.test(value);
};

/**
 * Validate that a value is within a range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {boolean} True if within range
 */
export const validateRange = (value, min, max) => {
  if (typeof value !== 'number') return false;
  return value >= min && value <= max;
};

/**
 * Validate that a value is one of allowed values
 * @param {*} value - Value to validate
 * @param {Array} allowedValues - Array of allowed values
 * @returns {boolean} True if value is allowed
 */
export const validateInArray = (value, allowedValues) => {
  return allowedValues.includes(value);
};

/**
 * Validate date is valid and not in the future
 * @param {Date|string|number} date - Date to validate
 * @returns {boolean} True if valid past or present date
 */
export const validatePastDate = (date) => {
  if (!date) return false;

  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;

  if (isNaN(dateObj.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inputDate = new Date(dateObj);
  inputDate.setHours(0, 0, 0, 0);

  return inputDate <= today;
};

/**
 * Validate date is valid and not in the past
 * @param {Date|string|number} date - Date to validate
 * @returns {boolean} True if valid future or present date
 */
export const validateFutureDate = (date) => {
  if (!date) return false;

  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;

  if (isNaN(dateObj.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inputDate = new Date(dateObj);
  inputDate.setHours(0, 0, 0, 0);

  return inputDate >= today;
};

/**
 * Validate that two values match (e.g., password confirmation)
 * @param {*} value - First value
 * @param {*} confirmValue - Second value to compare
 * @returns {boolean} True if values match
 */
export const validateMatch = (value, confirmValue) => {
  return value === confirmValue;
};

/**
 * Validate that a value is a number
 * @param {*} value - Value to validate
 * @returns {boolean} True if value is a number
 */
export const validateIsNumber = (value) => {
  return typeof value === 'number' && !isNaN(value);
};

/**
 * Validate that a value is an integer
 * @param {*} value - Value to validate
 * @returns {boolean} True if value is an integer
 */
export const validateIsInteger = (value) => {
  return Number.isInteger(value);
};

/**
 * Validate that a value is a positive number
 * @param {*} value - Value to validate
 * @returns {boolean} True if value is positive
 */
export const validateIsPositive = (value) => {
  return typeof value === 'number' && value > 0;
};

/**
 * Validate that a value is a non-negative number
 * @param {*} value - Value to validate
 * @returns {boolean} True if value is non-negative
 */
export const validateIsNonNegative = (value) => {
  return typeof value === 'number' && value >= 0;
};

/**
 * Validate that a value is a valid hex color
 * @param {string} value - Color value to validate
 * @returns {boolean} True if valid hex color
 */
export const validateHexColor = (value) => {
  if (!value) return false;
  const hexColorRegex = /^#([0-9A-F]{3}){1,2}$/i;
  return hexColorRegex.test(value);
};

/**
 * Validate that a value is a valid RGB color
 * @param {string} value - Color value to validate
 * @returns {boolean} True if valid RGB color
 */
export const validateRGBColor = (value) => {
  if (!value) return false;
  const rgbRegex = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/;
  const match = value.match(rgbRegex);
  if (!match) return false;

  const [, r, g, b] = match;
  return (
    parseInt(r, 10) >= 0 && parseInt(r, 10) <= 255 &&
    parseInt(g, 10) >= 0 && parseInt(g, 10) <= 255 &&
    parseInt(b, 10) >= 0 && parseInt(b, 10) <= 255
  );
};

export default {
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  validateURL,
  validateRequired,
  validatePattern,
  validateRange,
  validateInArray,
  validatePastDate,
  validateFutureDate,
  validateMatch,
  validateIsNumber,
  validateIsInteger,
  validateIsPositive,
  validateIsNonNegative,
  validateHexColor,
  validateRGBColor
};