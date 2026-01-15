/**
 * API Client
 * Secure HTTP client with authentication, error handling, and retry logic
 */

class APIClient {
    constructor() {
        this.config = CONFIG;
        this.retryCount = 0;
        this.maxRetries = this.config.API.RETRY_ATTEMPTS;
    }

    /**
     * Make HTTP request
     */
    async request(method, endpoint, data = null, options = {}) {
        try {
            // Enforce HTTPS in production
            if (this.config.SECURITY.ENFORCE_HTTPS && window.location.protocol !== 'https:') {
                console.warn('Warning: Using HTTP instead of HTTPS');
            }

            // Build full URL
            const url = `${this.config.API.BASE_URL}${endpoint}`;

            // Get authentication token
            const token = tokenManager.getToken();
            if (!token && !this.isPublicEndpoint(endpoint)) {
                throw new Error('No authentication token found');
            }

            // Build headers
            const headers = {
                'Content-Type': 'application/json',
                ...options.headers
            };

            // Add authorization header
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            // Add CSRF token for state-changing requests
            if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
                const csrfToken = tokenManager.getCSRFToken();
                if (csrfToken) {
                    headers['X-CSRF-Token'] = csrfToken;
                }
            }

            // Build request options
            const requestOptions = {
                method,
                headers,
                ...options
            };

            // Add body for POST, PUT, PATCH
            if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
                requestOptions.body = JSON.stringify(data);
            }

            // Make request with timeout
            const response = await this.fetchWithTimeout(url, requestOptions);

            // Handle response
            return await this.handleResponse(response);

        } catch (error) {
            // Retry logic
            if (this.retryCount < this.maxRetries && this.isRetryableError(error)) {
                this.retryCount++;
                await this.delay(this.config.API.RETRY_DELAY * this.retryCount);
                return this.request(method, endpoint, data, options);
            }

            this.retryCount = 0;
            throw error;
        }
    }

    /**
     * Fetch with timeout
     */
    async fetchWithTimeout(url, options = {}) {
        const timeout = this.config.API.TIMEOUT;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    /**
     * Handle API response
     */
    async handleResponse(response) {
        // Handle 401 Unauthorized - token expired
        if (response.status === 401) {
            tokenManager.clearToken();
            window.location.href = '/login.html';
            throw new Error('Authentication failed');
        }

        // Handle 403 Forbidden
        if (response.status === 403) {
            throw new Error('Access denied');
        }

        // Parse response
        let data;
        try {
            data = await response.json();
        } catch (error) {
            throw new Error('Invalid response format');
        }

        // Check if response is successful
        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    }

    /**
     * Check if error is retryable
     */
    isRetryableError(error) {
        const retryableErrors = [
            'NetworkError',
            'TimeoutError',
            'AbortError'
        ];

        return retryableErrors.some(e => error.name.includes(e)) || 
               error.message.includes('timeout') ||
               error.message.includes('network');
    }

    /**
     * Check if endpoint is public (no auth required)
     */
    isPublicEndpoint(endpoint) {
        const publicEndpoints = [
            '/auth/login',
            '/auth/verify',
            '/health'
        ];

        return publicEndpoints.some(e => endpoint.includes(e));
    }

    /**
     * Delay helper
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * GET request
     */
    get(endpoint, options = {}) {
        return this.request('GET', endpoint, null, options);
    }

    /**
     * POST request
     */
    post(endpoint, data, options = {}) {
        return this.request('POST', endpoint, data, options);
    }

    /**
     * PUT request
     */
    put(endpoint, data, options = {}) {
        return this.request('PUT', endpoint, data, options);
    }

    /**
     * DELETE request
     */
    delete(endpoint, options = {}) {
        return this.request('DELETE', endpoint, null, options);
    }

    /**
     * PATCH request
     */
    patch(endpoint, data, options = {}) {
        return this.request('PATCH', endpoint, data, options);
    }
}

// Initialize API client
const apiClient = new APIClient();
