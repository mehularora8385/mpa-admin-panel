/**
 * Token Manager
 * Secure token storage, retrieval, and refresh
 */

class TokenManager {
    constructor() {
        this.config = CONFIG;
        this.tokenRefreshTimer = null;
        this.sessionTimeoutTimer = null;
        this.init();
    }

    /**
     * Initialize token manager
     */
    init() {
        // Validate configuration
        if (!this.config) {
            console.error('CONFIG not found. Make sure config.js is loaded before tokenManager.js');
            return;
        }

        // Setup event listeners
        this.setupEventListeners();
        
        // Start session timeout monitoring
        this.startSessionTimeout();
    }

    /**
     * Setup event listeners for user activity
     */
    setupEventListeners() {
        // Reset session timeout on user activity
        ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, () => this.resetSessionTimeout(), true);
        });
    }

    /**
     * Store token securely
     */
    setToken(token) {
        if (!token) {
            console.error('Token is empty');
            return false;
        }

        try {
            const storage = this.getStorage();
            storage.setItem(this.config.SECURITY.TOKEN_KEY, token);
            
            // Start token refresh timer
            this.startTokenRefresh();
            
            console.log('Token stored successfully');
            return true;
        } catch (error) {
            console.error('Failed to store token:', error);
            return false;
        }
    }

    /**
     * Get token from storage
     */
    getToken() {
        try {
            const storage = this.getStorage();
            const token = storage.getItem(this.config.SECURITY.TOKEN_KEY);
            
            if (!token) {
                return null;
            }

            // Check if token is expired
            if (this.isTokenExpired(token)) {
                this.clearToken();
                return null;
            }

            return token;
        } catch (error) {
            console.error('Failed to retrieve token:', error);
            return null;
        }
    }

    /**
     * Store user info
     */
    setUser(user) {
        try {
            const storage = this.getStorage();
            storage.setItem(this.config.SECURITY.USER_KEY, JSON.stringify(user));
            return true;
        } catch (error) {
            console.error('Failed to store user:', error);
            return false;
        }
    }

    /**
     * Get user info
     */
    getUser() {
        try {
            const storage = this.getStorage();
            const userJson = storage.getItem(this.config.SECURITY.USER_KEY);
            
            if (!userJson) {
                return null;
            }

            return JSON.parse(userJson);
        } catch (error) {
            console.error('Failed to retrieve user:', error);
            return null;
        }
    }

    /**
     * Store CSRF token
     */
    setCSRFToken(token) {
        try {
            const storage = this.getStorage();
            storage.setItem(this.config.SECURITY.CSRF_TOKEN_KEY, token);
            return true;
        } catch (error) {
            console.error('Failed to store CSRF token:', error);
            return false;
        }
    }

    /**
     * Get CSRF token
     */
    getCSRFToken() {
        try {
            const storage = this.getStorage();
            return storage.getItem(this.config.SECURITY.CSRF_TOKEN_KEY);
        } catch (error) {
            console.error('Failed to retrieve CSRF token:', error);
            return null;
        }
    }

    /**
     * Clear all tokens and user data
     */
    clearToken() {
        try {
            const storage = this.getStorage();
            storage.removeItem(this.config.SECURITY.TOKEN_KEY);
            storage.removeItem(this.config.SECURITY.USER_KEY);
            storage.removeItem(this.config.SECURITY.CSRF_TOKEN_KEY);
            
            // Clear timers
            this.stopTokenRefresh();
            this.stopSessionTimeout();
            
            console.log('Token cleared');
            return true;
        } catch (error) {
            console.error('Failed to clear token:', error);
            return false;
        }
    }

    /**
     * Check if token is expired
     */
    isTokenExpired(token) {
        try {
            // Decode JWT (without verification - client-side only)
            const parts = token.split('.');
            if (parts.length !== 3) {
                return true;
            }

            const payload = JSON.parse(atob(parts[1]));
            const expiryTime = payload.exp * 1000; // Convert to milliseconds
            
            return Date.now() > expiryTime;
        } catch (error) {
            console.error('Failed to check token expiry:', error);
            return true;
        }
    }

    /**
     * Start token refresh timer
     */
    startTokenRefresh() {
        // Clear existing timer
        this.stopTokenRefresh();

        // Set new timer to refresh token before expiry
        this.tokenRefreshTimer = setInterval(() => {
            this.refreshToken();
        }, this.config.SECURITY.TOKEN_REFRESH_INTERVAL);
    }

    /**
     * Stop token refresh timer
     */
    stopTokenRefresh() {
        if (this.tokenRefreshTimer) {
            clearInterval(this.tokenRefreshTimer);
            this.tokenRefreshTimer = null;
        }
    }

    /**
     * Refresh token from server
     */
    async refreshToken() {
        try {
            const token = this.getToken();
            if (!token) {
                return false;
            }

            const response = await fetch(`${this.config.API.BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Token refresh failed');
            }

            const data = await response.json();
            if (data.success && data.token) {
                this.setToken(data.token);
                console.log('Token refreshed successfully');
                return true;
            }

            return false;
        } catch (error) {
            console.error('Failed to refresh token:', error);
            return false;
        }
    }

    /**
     * Start session timeout monitoring
     */
    startSessionTimeout() {
        this.resetSessionTimeout();
    }

    /**
     * Reset session timeout
     */
    resetSessionTimeout() {
        // Clear existing timer
        this.stopSessionTimeout();

        // Set new timer
        this.sessionTimeoutTimer = setTimeout(() => {
            this.handleSessionTimeout();
        }, this.config.SECURITY.SESSION_TIMEOUT);
    }

    /**
     * Stop session timeout monitoring
     */
    stopSessionTimeout() {
        if (this.sessionTimeoutTimer) {
            clearTimeout(this.sessionTimeoutTimer);
            this.sessionTimeoutTimer = null;
        }
    }

    /**
     * Handle session timeout
     */
    handleSessionTimeout() {
        console.warn('Session timeout - logging out user');
        this.clearToken();
        
        // Redirect to login
        window.location.href = '/login.html';
    }

    /**
     * Get appropriate storage (sessionStorage for security)
     */
    getStorage() {
        // Always use sessionStorage for security (clears on browser close)
        return window.sessionStorage;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        const token = this.getToken();
        return token !== null && !this.isTokenExpired(token);
    }
}

// Initialize token manager when DOM is ready
let tokenManager;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        tokenManager = new TokenManager();
    });
} else {
    tokenManager = new TokenManager();
}
