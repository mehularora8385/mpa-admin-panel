/**
 * Security Module for MPA Admin Portal
 * Handles security features and monitoring
 */

class SecurityManager {
    constructor() {
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.warningTimeout = 5 * 60 * 1000; // 5 minutes before logout
        this.sessionTimer = null;
        this.warningTimer = null;
        this.initializeSecurityFeatures();
    }

    /**
     * Initialize security features
     */
    initializeSecurityFeatures() {
        // Check for HTTPS
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
            console.warn('Warning: This application should be accessed over HTTPS');
            this.showSecurityWarning('This application should be accessed over HTTPS for security');
        }

        // Set security headers (server-side, but we can check)
        this.checkSecurityHeaders();

        // Initialize session timeout
        this.resetSessionTimer();

        // Monitor user activity
        this.monitorUserActivity();

        // Check for suspicious activities
        this.initializeThreatDetection();
    }

    /**
     * Check security headers
     */
    checkSecurityHeaders() {
        // These headers should be set by the server
        const securityHeaders = [
            'X-Content-Type-Options',
            'X-Frame-Options',
            'X-XSS-Protection',
            'Strict-Transport-Security',
            'Content-Security-Policy'
        ];

        // Log missing headers
        for (const header of securityHeaders) {
            // Note: We can't directly access response headers from client-side JavaScript
            // This should be verified on the server
        }
    }

    /**
     * Reset session timer
     */
    resetSessionTimer() {
        if (this.sessionTimer) clearTimeout(this.sessionTimer);
        if (this.warningTimer) clearTimeout(this.warningTimer);

        if (!rbac.isLoggedIn()) return;

        // Warning timer (5 minutes before logout)
        this.warningTimer = setTimeout(() => {
            this.showSessionWarning();
        }, this.sessionTimeout - this.warningTimeout);

        // Session timeout
        this.sessionTimer = setTimeout(() => {
            this.handleSessionTimeout();
        }, this.sessionTimeout);
    }

    /**
     * Monitor user activity
     */
    monitorUserActivity() {
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

        for (const event of events) {
            document.addEventListener(event, () => {
                this.resetSessionTimer();
            }, true);
        }
    }

    /**
     * Show session warning
     */
    showSessionWarning() {
        const message = 'Your session will expire in 5 minutes due to inactivity. Click to continue.';
        
        // Create warning dialog
        const dialog = document.createElement('div');
        dialog.id = 'sessionWarningDialog';
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            max-width: 400px;
            text-align: center;
        `;

        dialog.innerHTML = `
            <h2 style="color: #e74c3c; margin-bottom: 15px;">Session Expiring</h2>
            <p style="margin-bottom: 20px;">${message}</p>
            <button id="continueSession" style="
                background: #27ae60;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin-right: 10px;
            ">Continue Session</button>
            <button id="logout" style="
                background: #e74c3c;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
            ">Logout</button>
        `;

        // Add overlay
        const overlay = document.createElement('div');
        overlay.id = 'sessionWarningOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9999;
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(dialog);

        // Event listeners
        document.getElementById('continueSession').addEventListener('click', () => {
            this.removeSessionWarning();
            this.resetSessionTimer();
        });

        document.getElementById('logout').addEventListener('click', () => {
            rbac.logout();
        });

        auditLogger.logSecurityEvent('SESSION_WARNING', {
            message: 'Session expiration warning shown'
        });
    }

    /**
     * Remove session warning
     */
    removeSessionWarning() {
        const dialog = document.getElementById('sessionWarningDialog');
        const overlay = document.getElementById('sessionWarningOverlay');

        if (dialog) dialog.remove();
        if (overlay) overlay.remove();
    }

    /**
     * Handle session timeout
     */
    handleSessionTimeout() {
        auditLogger.logSecurityEvent('SESSION_TIMEOUT', {
            message: 'Session expired due to inactivity'
        });

        this.removeSessionWarning();
        alert('Your session has expired. Please login again.');
        rbac.logout();
    }

    /**
     * Show security warning
     */
    showSecurityWarning(message) {
        const warning = document.createElement('div');
        warning.style.cssText = `
            background: #fff3cd;
            border: 1px solid #ffc107;
            color: #856404;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
            display: flex;
            align-items: center;
            gap: 10px;
        `;

        warning.innerHTML = `
            <span style="font-size: 20px;">⚠️</span>
            <span>${message}</span>
        `;

        const container = document.querySelector('main') || document.body;
        container.insertBefore(warning, container.firstChild);

        // Auto-remove after 10 seconds
        setTimeout(() => warning.remove(), 10000);
    }

    /**
     * Initialize threat detection
     */
    initializeThreatDetection() {
        // Monitor for suspicious patterns
        this.monitorForSuspiciousActivity();
    }

    /**
     * Monitor for suspicious activity
     */
    monitorForSuspiciousActivity() {
        // Check for rapid requests
        let requestCount = 0;
        let requestWindow = Date.now();

        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            requestCount++;

            // Reset counter every 10 seconds
            if (Date.now() - requestWindow > 10000) {
                requestCount = 0;
                requestWindow = Date.now();
            }

            // Alert if too many requests
            if (requestCount > 50) {
                auditLogger.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
                    requestCount: requestCount
                });
            }

            return originalFetch.apply(this, args);
        };
    }

    /**
     * Validate input to prevent XSS
     */
    sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    /**
     * Encrypt sensitive data (client-side)
     */
    encryptData(data, key) {
        // This is a simple example. Use a proper encryption library in production
        return btoa(JSON.stringify(data));
    }

    /**
     * Decrypt sensitive data (client-side)
     */
    decryptData(encrypted, key) {
        try {
            return JSON.parse(atob(encrypted));
        } catch (error) {
            console.error('Decryption error:', error);
            return null;
        }
    }

    /**
     * Get security status
     */
    getSecurityStatus() {
        return {
            https: window.location.protocol === 'https:',
            sessionActive: rbac.isLoggedIn(),
            sessionTimeout: this.sessionTimeout,
            lastActivity: new Date(),
            securityHeaders: this.checkSecurityHeaders()
        };
    }

    /**
     * Log security event
     */
    logSecurityEvent(eventType, details = {}) {
        auditLogger.logSecurityEvent(eventType, details);
    }
}

// Create global security manager instance
const securityManager = new SecurityManager();

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SecurityManager, securityManager };
}
