/**
 * API Client for MPA Admin Portal
 * Handles all API calls with authentication and error handling
 */

class APIClient {
    constructor(baseURL = '/api') {
        this.baseURL = baseURL;
        this.timeout = 30000; // 30 seconds
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 second
    }

    getAuthHeader() {
        const token = localStorage.getItem('authToken');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            ...this.getAuthHeader(),
            ...options.headers
        };

        const config = {
            method: options.method || 'GET',
            headers: headers,
            timeout: this.timeout,
            ...options
        };

        if (options.body) {
            config.body = JSON.stringify(options.body);
        }

        let lastError;
        for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
            try {
                const response = await fetch(url, config);

                if (response.status === 401) {
                    // Unauthorized - redirect to login
                    localStorage.removeItem('authToken');
                    window.location.href = 'login.html';
                    return;
                }

                if (!response.ok) {
                    const error = await response.json().catch(() => ({}));
                    throw new Error(error.message || `HTTP ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                lastError = error;
                if (attempt < this.retryAttempts - 1) {
                    await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                }
            }
        }

        throw lastError;
    }

    // Dashboard APIs
    async getDashboardStats(examId = null) {
        const params = examId ? `?examId=${examId}` : '';
        return this.request(`/dashboard/stats${params}`);
    }

    async getCentreData(examId = null) {
        const params = examId ? `?examId=${examId}` : '';
        return this.request(`/dashboard/centres${params}`);
    }

    async getRealTimeData(examId = null) {
        const params = examId ? `?examId=${examId}` : '';
        return this.request(`/dashboard/realtime${params}`);
    }

    // Exam APIs
    async getExams() {
        return this.request('/exams');
    }

    async getExam(examId) {
        return this.request(`/exams/${examId}`);
    }

    async createExam(examData) {
        return this.request('/exams', {
            method: 'POST',
            body: examData
        });
    }

    async updateExam(examId, examData) {
        return this.request(`/exams/${examId}`, {
            method: 'PUT',
            body: examData
        });
    }

    async deleteExam(examId) {
        return this.request(`/exams/${examId}`, {
            method: 'DELETE'
        });
    }

    // Candidate APIs
    async getCandidates(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        return this.request(`/candidates${params ? '?' + params : ''}`);
    }

    async getCandidate(candidateId) {
        return this.request(`/candidates/${candidateId}`);
    }

    async uploadCandidates(file) {
        const formData = new FormData();
        formData.append('file', file);

        return fetch(`${this.baseURL}/candidates/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: formData
        }).then(r => r.json());
    }

    async updateCandidate(candidateId, candidateData) {
        return this.request(`/candidates/${candidateId}`, {
            method: 'PUT',
            body: candidateData
        });
    }

    async deleteCandidate(candidateId) {
        return this.request(`/candidates/${candidateId}`, {
            method: 'DELETE'
        });
    }

    // Operator APIs
    async getOperators(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        return this.request(`/operators${params ? '?' + params : ''}`);
    }

    async getOperator(operatorId) {
        return this.request(`/operators/${operatorId}`);
    }

    async createOperator(operatorData) {
        return this.request('/operators', {
            method: 'POST',
            body: operatorData
        });
    }

    async updateOperator(operatorId, operatorData) {
        return this.request(`/operators/${operatorId}`, {
            method: 'PUT',
            body: operatorData
        });
    }

    async deleteOperator(operatorId) {
        return this.request(`/operators/${operatorId}`, {
            method: 'DELETE'
        });
    }

    // Centre APIs
    async getCentres(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        return this.request(`/centres${params ? '?' + params : ''}`);
    }

    async getCentre(centreId) {
        return this.request(`/centres/${centreId}`);
    }

    async createCentre(centreData) {
        return this.request('/centres', {
            method: 'POST',
            body: centreData
        });
    }

    async updateCentre(centreId, centreData) {
        return this.request(`/centres/${centreId}`, {
            method: 'PUT',
            body: centreData
        });
    }

    async deleteCentre(centreId) {
        return this.request(`/centres/${centreId}`, {
            method: 'DELETE'
        });
    }

    // Report APIs
    async generateReport(reportType, filters = {}) {
        return this.request('/reports/generate', {
            method: 'POST',
            body: {
                type: reportType,
                filters: filters
            }
        });
    }

    async exportReport(reportId, format = 'excel') {
        return this.request(`/reports/${reportId}/export?format=${format}`);
    }

    async getReports() {
        return this.request('/reports');
    }

    // Audit Log APIs
    async getAuditLogs(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        return this.request(`/audit-logs${params ? '?' + params : ''}`);
    }

    async logAction(action, details = {}) {
        return this.request('/audit-logs', {
            method: 'POST',
            body: {
                action: action,
                details: details,
                timestamp: new Date().toISOString()
            }
        });
    }

    // User APIs
    async getUsers() {
        return this.request('/users');
    }

    async getUser(userId) {
        return this.request(`/users/${userId}`);
    }

    async createUser(userData) {
        return this.request('/users', {
            method: 'POST',
            body: userData
        });
    }

    async updateUser(userId, userData) {
        return this.request(`/users/${userId}`, {
            method: 'PUT',
            body: userData
        });
    }

    async deleteUser(userId) {
        return this.request(`/users/${userId}`, {
            method: 'DELETE'
        });
    }

    // System APIs
    async getSystemHealth() {
        return this.request('/system/health');
    }

    async getSystemStats() {
        return this.request('/system/stats');
    }
}

// Create global API client instance
const apiClient = new APIClient(window.API_BASE_URL || '/api');

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIClient, apiClient };
}
