// Utility functions for formatting data

/**
 * Format currency amount
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: 'RWF')
 * @param {Object} options - Formatting options
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'RWF', options = {}) => {
  if (amount === null || amount === undefined) return '₨0';

  const defaults = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  };

  const opts = { ...defaults, ...options };

  // Currency symbols map
  const currencySymbols = {
    RWF: '₨',
    USD: '$',
    EUR: '€',
    GBP: '£',
    KES: 'KSh',
    UGX: 'USh',
    TZS: 'TSh'
  };

  const symbol = currencySymbols[currency] || currency;

  // Format using Intl.NumberFormat
  try {
    const formatted = new Intl.NumberFormat(undefined, opts).format(amount);
    return `${symbol}${formatted}`;
  } catch (e) {
    // Fallback formatting
    return `${symbol}${amount.toLocaleString(undefined, opts)}`;
  }
};

/**
 * Format date to local string
 * @param {Date|string|number} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '';

  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;

  if (isNaN(dateObj.getTime())) return '';

  const defaults = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };

  const opts = { ...defaults, ...options };

  try {
    return new Intl.DateTimeFormat(undefined, opts).format(dateObj);
  } catch (e) {
    return dateObj.toLocaleDateString(undefined, opts);
  }
};

/**
 * Format date and time to local string
 * @param {Date|string|number} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date-time string
 */
export const formatDateTime = (date, options = {}) => {
  if (!date) return '';

  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;

  if (isNaN(dateObj.getTime())) return '';

  const defaults = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };

  const opts = { ...defaults, ...options };

  try {
    return new Intl.DateTimeFormat(undefined, opts).format(dateObj);
  } catch (e) {
    return dateObj.toLocaleString(undefined, opts);
  }
};

/**
 * Format time duration
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration string
 */
export const formatDuration = (minutes) => {
  if (minutes === null || minutes === undefined) return '0 min';

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} min`;
  } else if (remainingMinutes === 0) {
    return `${hours} hr`;
  } else {
    return `${hours} hr ${remainingMinutes} min`;
  }
};

/**
 * Format distance
 * @param {number} distance - Distance in kilometers
 * @param {number} precision - Decimal places (default: 1)
 * @returns {string} Formatted distance string
 */
export const formatDistance = (distance, precision = 1) => {
  if (distance === null || distance === undefined) return '0 km';

  if (distance >= 1) {
    return `${distance.toFixed(precision)} km`;
  } else {
    const meters = distance * 1000;
    return `${meters.toFixed(0)} m`;
  }
};

/**
 * Format phone number
 * @param {string} phone - Phone number to format
 * @param {string} countryCode - Country code (default: '+250' for Rwanda)
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone, countryCode = '+250') => {
  if (!phone) return '';

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // If it already starts with country code, use as is
  if (cleaned.startsWith(countryCode.replace(/\D/g, ''))) {
    return `${countryCode} ${cleaned.slice(countryCode.length)}`;
  }

  // Otherwise, prepend country code
  return `${countryCode} ${cleaned}`;
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @param {number} precision - Decimal places (default: 2)
 * @returns {string} Formatted file size string
 */
export const formatFileSize = (bytes, precision = 2) => {
  if (bytes === null || bytes === undefined) return '0 B';

  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(precision))} ${sizes[i]}`;
};

/**
 * Format rating as stars
 * @param {number} rating - Rating value (0-5)
 * @param {number} maxRating - Maximum rating (default: 5)
 * @returns {string} HTML string of star icons
 */
export const formatRatingStars = (rating, maxRating = 5) => {
  if (rating === null || rating === undefined) rating = 0;

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  let stars = '';

  // Full stars
  for (let i = 0; i < fullStars; i++) {
    stars += '<i class="bi bi-star-fill text-warning"></i>';
  }

  // Half star
  if (hasHalfStar) {
    stars += '<i class="bi bi-star-half text-warning"></i>';
  }

  // Empty stars
  for (let i = 0; i < emptyStars; i++) {
    stars += '<i class="bi bi-star-outline text-muted"></i>';
  }

  return stars;
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix to add when truncated (default: '...')
 * @returns {string} Truncated string
 */
export const truncateText = (text, length, suffix = '...') => {
  if (!text || text.length <= length) return text;
  return text.slice(0, length) + suffix;
};

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalizeFirstLetter = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Format percentage
 * @param {number} value - Value to format as percentage
 * @param {number} precision - Decimal places (default: 1)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, precision = 1) => {
  if (value === null || value === undefined) return '0%';
  return `${value.toFixed(precision)}%`;
};

/**
 * Format number with commas
 * @param {number} number - Number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (number) => {
  if (number === null || number === undefined) return '0';
  return number.toLocaleString();
};

export default {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatDuration,
  formatDistance,
  formatPhoneNumber,
  formatFileSize,
  formatRatingStars,
  truncateText,
  capitalizeFirstLetter,
  formatPercentage,
  formatNumber
};