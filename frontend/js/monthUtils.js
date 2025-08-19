/**
 * Month Utility Functions for Monthly Admission Reports
 * Provides functions to convert numeric months to word format and handle month operations
 */

class MonthUtils {
    static MONTH_NAMES = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    static SHORT_MONTH_NAMES = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    /**
     * Convert numeric month to word format
     * @param {number} monthNumber - Month number (1-12)
     * @returns {string} Month name (e.g., "January")
     */
    static getMonthName(monthNumber) {
        if (monthNumber < 1 || monthNumber > 12) {
            throw new Error('Month number must be between 1 and 12');
        }
        return this.MONTH_NAMES[monthNumber - 1];
    }

    /**
     * Convert numeric month to short word format
     * @param {number} monthNumber - Month number (1-12)
     * @returns {string} Short month name (e.g., "Jan")
     */
    static getShortMonthName(monthNumber) {
        if (monthNumber < 1 || monthNumber > 12) {
            throw new Error('Month number must be between 1 and 12');
        }
        return this.SHORT_MONTH_NAMES[monthNumber - 1];
    }

    /**
     * Format YYYY-MM string to readable month year format
     * @param {string} monthString - Month string in YYYY-MM format
     * @returns {string} Formatted month year (e.g., "January 2024")
     */
    static formatMonthYear(monthString) {
        if (!monthString || typeof monthString !== 'string') {
            throw new Error('Month string is required and must be a string');
        }

        const parts = monthString.split('-');
        if (parts.length !== 2) {
            throw new Error('Month string must be in YYYY-MM format');
        }

        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]);

        if (isNaN(year) || isNaN(month)) {
            throw new Error('Invalid year or month in month string');
        }

        return `${this.getMonthName(month)} ${year}`;
    }

    /**
     * Format YYYY-MM string to short readable format
     * @param {string} monthString - Month string in YYYY-MM format
     * @returns {string} Formatted short month year (e.g., "Jan 2024")
     */
    static formatShortMonthYear(monthString) {
        if (!monthString || typeof monthString !== 'string') {
            throw new Error('Month string is required and must be a string');
        }

        const parts = monthString.split('-');
        if (parts.length !== 2) {
            throw new Error('Month string must be in YYYY-MM format');
        }

        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]);

        if (isNaN(year) || isNaN(month)) {
            throw new Error('Invalid year or month in month string');
        }

        return `${this.getShortMonthName(month)} ${year}`;
    }

    /**
     * Get current month in YYYY-MM format
     * @returns {string} Current month string
     */
    static getCurrentMonthString() {
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        return `${year}-${month}`;
    }

    /**
     * Get previous month in YYYY-MM format
     * @param {string} monthString - Current month string in YYYY-MM format
     * @returns {string} Previous month string
     */
    static getPreviousMonth(monthString) {
        const parts = monthString.split('-');
        let year = parseInt(parts[0]);
        let month = parseInt(parts[1]);

        month--;
        if (month < 1) {
            month = 12;
            year--;
        }

        return `${year}-${month.toString().padStart(2, '0')}`;
    }

    /**
     * Get next month in YYYY-MM format
     * @param {string} monthString - Current month string in YYYY-MM format
     * @returns {string} Next month string
     */
    static getNextMonth(monthString) {
        const parts = monthString.split('-');
        let year = parseInt(parts[0]);
        let month = parseInt(parts[1]);

        month++;
        if (month > 12) {
            month = 1;
            year++;
        }

        return `${year}-${month.toString().padStart(2, '0')}`;
    }

    /**
     * Validate month string format
     * @param {string} monthString - Month string to validate
     * @returns {boolean} True if valid YYYY-MM format
     */
    static isValidMonthString(monthString) {
        if (!monthString || typeof monthString !== 'string') {
            return false;
        }

        const parts = monthString.split('-');
        if (parts.length !== 2) {
            return false;
        }

        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]);

        return !isNaN(year) && !isNaN(month) && 
               year > 1900 && year < 3000 && 
               month >= 1 && month <= 12;
    }

    /**
     * Parse date object to YYYY-MM format
     * @param {Date} date - Date object
     * @returns {string} Month string in YYYY-MM format
     */
    static dateToMonthString(date) {
        if (!(date instanceof Date) || isNaN(date)) {
            throw new Error('Invalid date object');
        }

        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${year}-${month}`;
    }

    /**
     * Compare two month strings
     * @param {string} month1 - First month string
     * @param {string} month2 - Second month string
     * @returns {number} -1 if month1 < month2, 0 if equal, 1 if month1 > month2
     */
    static compareMonths(month1, month2) {
        if (!this.isValidMonthString(month1) || !this.isValidMonthString(month2)) {
            throw new Error('Invalid month string format');
        }

        if (month1 === month2) return 0;
        return month1 < month2 ? -1 : 1;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MonthUtils;
}

// Make available globally for browser usage
if (typeof window !== 'undefined') {
    window.MonthUtils = MonthUtils;
}