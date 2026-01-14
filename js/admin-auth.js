/**
 * Admin Authentication Module
 * Single admin user: Mehul2026 / Mehul@7300
 * Strict validation and security
 */

class AdminAuth {
    constructor() {
        // FIXED CREDENTIALS - Only one admin allowed
        this.ADMIN_USERNAME = 'Mehul2026';
        this.ADMIN_PASSWORD = 'Mehul@7300';
        this.SESSION_KEY = 'admin_session_token';
        this.MAX_LOGIN_ATTEMPTS = 3;
        this.LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
        this.SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
        
        this.loginAttempts = 0;
        this.isLockedOut = false;
        this.lockoutTime = null;
        
        this.initializeAuth();
    }

    /**
     * Initialize authentication
     */
    initializeAuth() {
        // Check if already logged in
        if (this.isSessionValid()) {
            this.showDashboard();
        } else {
            this.showLoginPage();
        }
    }

    /**
     * Validate login credentials
     */
    validateLogin(username, password) {
        // Check if locked out
        if (this.isLockedOut) {
            if (Date.now() - this.lockoutTime < this.LOCKOUT_DURATION) {
                const remainingTime = Math.ceil((this.LOCKOUT_DURATION - (Date.now() - this.lockoutTime)) / 1000 / 60);
                return {
                    success: false,
                    message: `Account locked. Try again in ${remainingTime} minutes.`,
                    locked: true
                };
            } else {
                // Unlock after duration
                this.isLockedOut = false;
                this.loginAttempts = 0;
            }
        }

        // Validate username
        if (username !== this.ADMIN_USERNAME) {
            this.loginAttempts++;
            auditLogger.logSecurityEvent('FAILED_LOGIN', {
                username: username,
                reason: 'Invalid username',
                attempt: this.loginAttempts
            });

            if (this.loginAttempts >= this.MAX_LOGIN_ATTEMPTS) {
                this.isLockedOut = true;
                this.lockoutTime = Date.now();
                return {
                    success: false,
                    message: 'Account locked due to multiple failed attempts. Try again in 15 minutes.',
                    locked: true
                };
            }

            return {
                success: false,
                message: `Invalid username. Attempt ${this.loginAttempts}/${this.MAX_LOGIN_ATTEMPTS}`,
                locked: false
            };
        }

        // Validate password
        if (password !== this.ADMIN_PASSWORD) {
            this.loginAttempts++;
            auditLogger.logSecurityEvent('FAILED_LOGIN', {
                username: username,
                reason: 'Invalid password',
                attempt: this.loginAttempts
            });

            if (this.loginAttempts >= this.MAX_LOGIN_ATTEMPTS) {
                this.isLockedOut = true;
                this.lockoutTime = Date.now();
                return {
                    success: false,
                    message: 'Account locked due to multiple failed attempts. Try again in 15 minutes.',
                    locked: true
                };
            }

            return {
                success: false,
                message: `Invalid password. Attempt ${this.loginAttempts}/${this.MAX_LOGIN_ATTEMPTS}`,
                locked: false
            };
        }

        // Successful login
        this.loginAttempts = 0;
        this.isLockedOut = false;
        return {
            success: true,
            message: 'Login successful'
        };
    }

    /**
     * Perform login
     */
    async login(username, password) {
        // Validate credentials
        const validation = this.validateLogin(username, password);
        
        if (!validation.success) {
            return validation;
        }

        // Create session token
        const token = this.generateSessionToken();
        
        // Store session
        const sessionData = {
            token: token,
            username: username,
            loginTime: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            role: 'SUPER_ADMIN'
        };

        localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));

        // Log successful login
        await auditLogger.logLogin(username, true);

        // Initialize session timeout
        this.initializeSessionTimeout();

        return {
            success: true,
            message: 'Login successful',
            token: token
        };
    }

    /**
     * Generate session token
     */
    generateSessionToken() {
        return `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Check if session is valid
     */
    isSessionValid() {
        try {
            const sessionData = localStorage.getItem(this.SESSION_KEY);
            if (!sessionData) return false;

            const session = JSON.parse(sessionData);
            
            // Check if session has expired
            const loginTime = new Date(session.loginTime);
            const now = new Date();
            
            if (now - loginTime > this.SESSION_TIMEOUT) {
                this.logout();
                return false;
            }

            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get current session
     */
    getCurrentSession() {
        try {
            const sessionData = localStorage.getItem(this.SESSION_KEY);
            if (!sessionData) return null;
            return JSON.parse(sessionData);
        } catch (error) {
            return null;
        }
    }

    /**
     * Update last activity
     */
    updateLastActivity() {
        try {
            const sessionData = localStorage.getItem(this.SESSION_KEY);
            if (sessionData) {
                const session = JSON.parse(sessionData);
                session.lastActivity = new Date().toISOString();
                localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
            }
        } catch (error) {
            console.error('Error updating last activity:', error);
        }
    }

    /**
     * Initialize session timeout
     */
    initializeSessionTimeout() {
        // Monitor user activity
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
        
        for (const event of events) {
            document.addEventListener(event, () => {
                this.updateLastActivity();
            }, true);
        }

        // Check for timeout every minute
        setInterval(() => {
            if (!this.isSessionValid()) {
                this.logout();
            }
        }, 60000);
    }

    /**
     * Logout
     */
    async logout() {
        const session = this.getCurrentSession();
        
        if (session) {
            await auditLogger.logLogout();
        }

        localStorage.removeItem(this.SESSION_KEY);
        this.showLoginPage();
    }

    /**
     * Force logout all sessions (admin function)
     */
    async forceLogoutAll() {
        // Clear all sessions
        localStorage.removeItem(this.SESSION_KEY);
        
        // Log the action
        await auditLogger.logSecurityEvent('FORCE_LOGOUT_ALL', {
            message: 'Admin forced logout of all sessions'
        });

        // Redirect to login
        this.showLoginPage();
    }

    /**
     * Show login page
     */
    showLoginPage() {
        window.location.href = '/login.html';
    }

    /**
     * Show dashboard
     */
    showDashboard() {
        window.location.href = '/index.html';
    }

    /**
     * Get authentication status
     */
    getStatus() {
        const session = this.getCurrentSession();
        return {
            isLoggedIn: this.isSessionValid(),
            username: session ? session.username : null,
            role: session ? session.role : null,
            loginTime: session ? session.loginTime : null,
            lastActivity: session ? session.lastActivity : null,
            isLockedOut: this.isLockedOut,
            loginAttempts: this.loginAttempts
        };
    }
}

// Create global admin auth instance
const adminAuth = new AdminAuth();

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AdminAuth, adminAuth };
}
