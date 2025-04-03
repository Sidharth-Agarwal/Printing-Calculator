// src/utils/formatUtils.js

/**
 * Format currency value
 * @param {number} value - Value to format
 * @param {string} [currency='₹'] - Currency symbol
 * @param {number} [decimals=2] - Number of decimal places
 * @returns {string} - Formatted currency value
 */
export const formatCurrency = (value, currency = '₹', decimals = 2) => {
    if (value === undefined || value === null) return `${currency} 0.00`;
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue)) return `${currency} 0.00`;
    
    return `${currency} ${numValue.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };
  
  /**
   * Format percentage value
   * @param {number} value - Value to format
   * @param {number} [decimals=2] - Number of decimal places
   * @returns {string} - Formatted percentage value
   */
  export const formatPercentage = (value, decimals = 2) => {
    if (value === undefined || value === null) return '0.00%';
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue)) return '0.00%';
    
    return `${numValue.toFixed(decimals)}%`;
  };
  
  /**
   * Format date
   * @param {Date|number|string} date - Date to format
   * @param {string} [format='short'] - Format type ('short', 'medium', 'long')
   * @returns {string} - Formatted date
   */
  export const formatDate = (date, format = 'short') => {
    if (!date) return '';
    
    let dateObj;
    
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'object' && date.seconds) {
      // Handle Firestore Timestamp
      dateObj = new Date(date.seconds * 1000);
    } else if (typeof date === 'number') {
      dateObj = new Date(date);
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      return '';
    }
    
    if (isNaN(dateObj.getTime())) return 'Invalid date';
    
    const options = {
      short: { day: '2-digit', month: '2-digit', year: 'numeric' },
      medium: { day: '2-digit', month: 'short', year: 'numeric' },
      long: { day: '2-digit', month: 'long', year: 'numeric', weekday: 'long' }
    };
    
    return dateObj.toLocaleDateString('en-IN', options[format] || options.short);
  };
  
  /**
   * Format a phone number
   * @param {string} phone - Phone number to format
   * @returns {string} - Formatted phone number
   */
  export const formatPhone = (phone) => {
    if (!phone) return '';
    
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length === 10) {
      // Indian mobile number (10 digits)
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    } else if (cleaned.length > 10) {
      // Longer number with country code
      return `+${cleaned.slice(0, cleaned.length - 10)}-${cleaned.slice(-10, -5)}-${cleaned.slice(-5)}`;
    } else {
      // Other lengths, just group in 3-4 digits
      const groups = [];
      for (let i = 0; i < cleaned.length; i += 4) {
        groups.push(cleaned.slice(i, i + 4));
      }
      return groups.join('-');
    }
  };
  
  /**
   * Format address
   * @param {Object} address - Address object
   * @returns {string} - Formatted address
   */
  export const formatAddress = (address) => {
    if (!address) return '';
    
    const { line1, line2, city, state, postalCode, country } = address;
    
    const parts = [
      line1,
      line2,
      city ? (state ? `${city}, ${state}` : city) : state,
      postalCode ? (country ? `${postalCode}, ${country}` : postalCode) : country
    ].filter(Boolean);
    
    return parts.join(', ');
  };
  
  /**
   * Format estimate number (adds hyphens if not present)
   * @param {string} estimateNumber - Estimate number
   * @returns {string} - Formatted estimate number
   */
  export const formatEstimateNumber = (estimateNumber) => {
    if (!estimateNumber) return '';
    
    // If already contains hyphens, return as is
    if (estimateNumber.includes('-')) return estimateNumber;
    
    // EST format: "ESTACME001CARD250001" -> "EST-ACME001-CARD-25-0001"
    // Extract client code (variable length)
    const prefix = estimateNumber.slice(0, 3); // "EST"
    
    // Find where the client code ends and job type begins (job type is always 4 chars)
    // Look for 4 uppercase letters that could be job type
    const match = estimateNumber.slice(3).match(/([A-Z0-9]+)([A-Z]{4})(\d{2})(\d{4})$/);
    
    if (!match) return estimateNumber; // Can't parse, return original
    
    const [, clientCode, jobType, year, sequence] = match;
    
    return `${prefix}-${clientCode}-${jobType}-${year}-${sequence}`;
  };
  
  /**
   * Truncate text to specified length
   * @param {string} text - Text to truncate
   * @param {number} [maxLength=50] - Maximum length
   * @returns {string} - Truncated text
   */
  export const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength) + '...';
  };
  
  /**
   * Format version number
   * @param {number} version - Version number
   * @param {string} [format='numeric'] - Format type ('numeric', 'revision')
   * @returns {string} - Formatted version number
   */
  export const formatVersion = (version, format = 'numeric') => {
    if (version === undefined || version === null) return '';
    
    switch (format) {
      case 'revision':
        return `Rev ${version}`;
      case 'numeric':
      default:
        return version.toString();
    }
  };
  
  /**
   * Format Firestore timestamp to relative time (e.g., '2 hours ago')
   * @param {Object} timestamp - Firestore timestamp
   * @returns {string} - Relative time string
   */
  export const formatRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    
    let date;
    if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      return '';
    }
    
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) {
      return 'just now';
    } else if (diffMin < 60) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else if (diffHour < 24) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffDay < 7) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else {
      return formatDate(date, 'medium');
    }
};