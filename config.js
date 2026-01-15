/**
 * Admin Panel Configuration
 * Environment-based, production-ready configuration
 */

// Get API base URL from environment or use default
const getApiBaseUrl = () => {
    // Production
    if (window.location.hostname === 'sepl-exam.com' || window.location.hostname === 'admin.sepl-exam.com') {
        return 'https://api.sepl-exam.com/api/v1';
    }
    
    // AWS Production
    if (window.location.hostname === '13.204.65.158') {
        return 'http://13.204.65.158/api/v1';
    }
    
    // Development/Testing
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3000/api/v1';
    }
    
    // Default to current domain
    const protocol = window.location.protocol;
    const host = window.location.host;
    return `${protocol}//${host}/api/v1`;
};

const CONFIG = {
    // API Configuration
    API: {
        BASE_URL: getApiBaseUrl(),
        TIMEOUT: 30000, // 30 seconds
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000 // 1 second
    },

    // Security Configuration
    SECURITY: {
        // Use HTTPS in production
        ENFORCE_HTTPS: window.location.protocol === 'https:' || window.location.hostname !== 'localhost',
        
        // Token storage - use secure methods
        TOKEN_STORAGE: 'sessionStorage', // Use sessionStorage instead of localStorage for security
        TOKEN_KEY: 'auth_token',
        USER_KEY: 'auth_user',
        CSRF_TOKEN_KEY: 'csrf_token',
        
        // Token expiration
        TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
        TOKEN_REFRESH_INTERVAL: 20 * 60 * 1000, // Refresh every 20 minutes
        
        // Session timeout
        SESSION_TIMEOUT: 30 * 60 * 1000 // 30 minutes of inactivity
    },

    // Feature Flags
    FEATURES: {
        ENABLE_BIOMETRIC: true,
        ENABLE_BULK_UPLOAD: true,
        ENABLE_REAL_TIME_SYNC: true,
        ENABLE_BACKUP: true,
        ENABLE_LOGS: true
    },

    // Logging Configuration
    LOGGING: {
        ENABLED: true,
        LEVEL: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
        SEND_TO_SERVER: true
    },

    // UI Configuration
    UI: {
        ITEMS_PER_PAGE: 10,
        TOAST_DURATION: 3000, // 3 seconds
        MODAL_ANIMATION_DURATION: 300 // 300ms
    }
};

// Validate configuration
const validateConfig = () => {
    if (!CONFIG.API.BASE_URL) {
        console.error('API Base URL is not configured');
        return false;
    }
    
    if (CONFIG.SECURITY.ENFORCE_HTTPS && window.location.protocol !== 'https:') {
        console.warn('HTTPS is enforced but current connection is HTTP');
    }
    
    return true;
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
