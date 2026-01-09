/**
 * Audit Logger for MPA Admin Portal
 * Tracks all admin activities for compliance and security
 */

class AuditLogger {
    constructor() {
        this.logs = [];
        this.maxLocalLogs = 100;
    }

    /**
     * Log an action
     */
    async logAction(action, details = {}, severity = 'INFO') {
        const logEntry = {
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            action: action,
            details: details,
            severity: severity,
            user: rbac.getCurrentUser()?.name || 'Unknown',
            userRole: rbac.getCurrentRole(),
            ipAddress: await this.getClientIP(),
            userAgent: navigator.userAgent
        };

        // Add to local storage
        this.logs.unshift(logEntry);
        if (this.logs.length > this.maxLocalLogs) {
            this.logs.pop();
        }
        this.saveToLocalStorage();

        // Send to server
        try {
            await apiClient.logAction(action, {
                ...details,
                severity: severity
            });
        } catch (error) {
            console.error('Failed to log action to server:', error);
        }

        return logEntry;
    }

    /**
     * Log a login action
     */
    async logLogin(username, success = true) {
        return this.logAction('LOGIN', {
            username: username,
            success: success
        }, success ? 'INFO' : 'WARNING');
    }

    /**
     * Log a logout action
     */
    async logLogout() {
        return this.logAction('LOGOUT', {}, 'INFO');
    }

    /**
     * Log data access
     */
    async logDataAccess(dataType, recordCount) {
        return this.logAction('DATA_ACCESS', {
            dataType: dataType,
            recordCount: recordCount
        }, 'INFO');
    }

    /**
     * Log data modification
     */
    async logDataModification(action, dataType, recordId, changes) {
        return this.logAction(`DATA_${action}`, {
            dataType: dataType,
            recordId: recordId,
            changes: changes
        }, 'INFO');
    }

    /**
     * Log data export
     */
    async logDataExport(dataType, format, recordCount) {
        return this.logAction('DATA_EXPORT', {
            dataType: dataType,
            format: format,
            recordCount: recordCount
        }, 'WARNING');
    }

    /**
     * Log security event
     */
    async logSecurityEvent(eventType, details = {}) {
        return this.logAction(`SECURITY_${eventType}`, details, 'CRITICAL');
    }

    /**
     * Log system event
     */
    async logSystemEvent(eventType, details = {}) {
        return this.logAction(`SYSTEM_${eventType}`, details, 'INFO');
    }

    /**
     * Get logs with filters
     */
    getLogs(filters = {}) {
        let filteredLogs = [...this.logs];

        if (filters.action) {
            filteredLogs = filteredLogs.filter(log => log.action === filters.action);
        }

        if (filters.severity) {
            filteredLogs = filteredLogs.filter(log => log.severity === filters.severity);
        }

        if (filters.user) {
            filteredLogs = filteredLogs.filter(log => log.user === filters.user);
        }

        if (filters.startDate) {
            const startDate = new Date(filters.startDate);
            filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= startDate);
        }

        if (filters.endDate) {
            const endDate = new Date(filters.endDate);
            filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= endDate);
        }

        if (filters.limit) {
            filteredLogs = filteredLogs.slice(0, filters.limit);
        }

        return filteredLogs;
    }

    /**
     * Get logs for a specific user
     */
    getUserLogs(username) {
        return this.logs.filter(log => log.user === username);
    }

    /**
     * Get logs for a specific action
     */
    getActionLogs(action) {
        return this.logs.filter(log => log.action === action);
    }

    /**
     * Get critical logs
     */
    getCriticalLogs() {
        return this.logs.filter(log => log.severity === 'CRITICAL');
    }

    /**
     * Clear old logs
     */
    clearOldLogs(daysOld = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        this.logs = this.logs.filter(log => new Date(log.timestamp) > cutoffDate);
        this.saveToLocalStorage();
    }

    /**
     * Export logs
     */
    async exportLogs(format = 'csv') {
        const logs = this.logs.map(log => ({
            Timestamp: log.timestamp,
            Action: log.action,
            User: log.user,
            Role: log.userRole,
            Severity: log.severity,
            Details: JSON.stringify(log.details),
            'IP Address': log.ipAddress
        }));

        if (format === 'csv') {
            return exportEngine.exportToCSV(logs, `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
        } else if (format === 'excel') {
            return exportEngine.exportToExcel(logs, `audit_logs_${new Date().toISOString().split('T')[0]}.xlsx`, 'Audit Logs');
        } else if (format === 'pdf') {
            return exportEngine.exportToPDF(logs, `audit_logs_${new Date().toISOString().split('T')[0]}.pdf`, 'Audit Logs');
        }
    }

    /**
     * Save logs to local storage
     */
    saveToLocalStorage() {
        try {
            localStorage.setItem('auditLogs', JSON.stringify(this.logs));
        } catch (error) {
            console.error('Failed to save audit logs to local storage:', error);
        }
    }

    /**
     * Load logs from local storage
     */
    loadFromLocalStorage() {
        try {
            const stored = localStorage.getItem('auditLogs');
            if (stored) {
                this.logs = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load audit logs from local storage:', error);
        }
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get client IP address
     */
    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'Unknown';
        }
    }

    /**
     * Get statistics
     */
    getStatistics() {
        return {
            totalLogs: this.logs.length,
            byAction: this.getGroupedStats('action'),
            bySeverity: this.getGroupedStats('severity'),
            byUser: this.getGroupedStats('user'),
            criticalCount: this.logs.filter(log => log.severity === 'CRITICAL').length,
            warningCount: this.logs.filter(log => log.severity === 'WARNING').length
        };
    }

    /**
     * Get grouped statistics
     */
    getGroupedStats(field) {
        const stats = {};
        for (const log of this.logs) {
            const key = log[field];
            stats[key] = (stats[key] || 0) + 1;
        }
        return stats;
    }
}

// Create global audit logger instance
const auditLogger = new AuditLogger();
auditLogger.loadFromLocalStorage();

// Log page load
window.addEventListener('load', () => {
    if (rbac.isLoggedIn()) {
        auditLogger.logSystemEvent('PAGE_LOAD', {
            page: window.location.pathname
        });
    }
});

// Log page unload
window.addEventListener('beforeunload', () => {
    if (rbac.isLoggedIn()) {
        auditLogger.logSystemEvent('PAGE_UNLOAD', {
            page: window.location.pathname
        });
    }
});

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuditLogger, auditLogger };
}
