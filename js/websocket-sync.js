/**
 * WebSocket Real-Time Sync Module
 * Handles live data updates and real-time synchronization
 */

class WebSocketSync {
    constructor() {
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        this.listeners = {};
        this.initializeWebSocket();
    }

    /**
     * Initialize WebSocket connection
     */
    initializeWebSocket() {
        try {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.host}/ws`;

            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => this.handleOpen();
            this.ws.onmessage = (event) => this.handleMessage(event);
            this.ws.onerror = (error) => this.handleError(error);
            this.ws.onclose = () => this.handleClose();
        } catch (error) {
            console.error('WebSocket initialization error:', error);
            this.scheduleReconnect();
        }
    }

    /**
     * Handle WebSocket open
     */
    handleOpen() {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;

        // Send authentication
        this.send({
            type: 'AUTHENTICATE',
            token: adminAuth.getCurrentSession()?.token
        });

        // Subscribe to updates
        this.subscribe('dashboard_updates');
        this.subscribe('exam_updates');
        this.subscribe('operator_updates');
        this.subscribe('student_updates');
        this.subscribe('sync_status');

        auditLogger.logSystemEvent('WEBSOCKET_CONNECTED', {});
    }

    /**
     * Handle WebSocket message
     */
    handleMessage(event) {
        try {
            const data = JSON.parse(event.data);

            // Emit event to listeners
            if (this.listeners[data.type]) {
                for (const callback of this.listeners[data.type]) {
                    callback(data);
                }
            }

            // Handle specific message types
            switch (data.type) {
                case 'DASHBOARD_UPDATE':
                    this.handleDashboardUpdate(data);
                    break;
                case 'EXAM_UPDATE':
                    this.handleExamUpdate(data);
                    break;
                case 'OPERATOR_UPDATE':
                    this.handleOperatorUpdate(data);
                    break;
                case 'STUDENT_UPDATE':
                    this.handleStudentUpdate(data);
                    break;
                case 'SYNC_STATUS':
                    this.handleSyncStatus(data);
                    break;
                default:
                    console.log('Unknown message type:', data.type);
            }
        } catch (error) {
            console.error('Error handling WebSocket message:', error);
        }
    }

    /**
     * Handle dashboard update
     */
    handleDashboardUpdate(data) {
        if (dashboardFeatures) {
            dashboardFeatures.dashboardData = data.payload;
            dashboardFeatures.renderDashboard();
        }
    }

    /**
     * Handle exam update
     */
    handleExamUpdate(data) {
        if (examManagement) {
            examManagement.loadExams();
        }
    }

    /**
     * Handle operator update
     */
    handleOperatorUpdate(data) {
        // Refresh operator list
        if (window.operatorManagement) {
            window.operatorManagement.loadOperators();
        }
    }

    /**
     * Handle student update
     */
    handleStudentUpdate(data) {
        // Refresh student list
        if (window.studentManagement) {
            window.studentManagement.loadStudents();
        }
    }

    /**
     * Handle sync status
     */
    handleSyncStatus(data) {
        const syncStatus = document.getElementById('syncStatus');
        if (syncStatus) {
            syncStatus.innerHTML = `
                <p>Last Sync: ${new Date(data.payload.lastSync).toLocaleString()}</p>
                <p>Pending: ${data.payload.pendingCount}</p>
                <p>Status: ${data.payload.status}</p>
            `;
        }
    }

    /**
     * Handle WebSocket error
     */
    handleError(error) {
        console.error('WebSocket error:', error);
        auditLogger.logSystemEvent('WEBSOCKET_ERROR', { error: error.message });
    }

    /**
     * Handle WebSocket close
     */
    handleClose() {
        console.log('WebSocket disconnected');
        auditLogger.logSystemEvent('WEBSOCKET_DISCONNECTED', {});
        this.scheduleReconnect();
    }

    /**
     * Schedule reconnect
     */
    scheduleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            
            setTimeout(() => {
                this.initializeWebSocket();
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('Max reconnect attempts reached');
            auditLogger.logSecurityEvent('WEBSOCKET_RECONNECT_FAILED', {
                attempts: this.reconnectAttempts
            });
        }
    }

    /**
     * Send message
     */
    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.warn('WebSocket not connected');
        }
    }

    /**
     * Subscribe to updates
     */
    subscribe(channel) {
        this.send({
            type: 'SUBSCRIBE',
            channel: channel
        });
    }

    /**
     * Unsubscribe from updates
     */
    unsubscribe(channel) {
        this.send({
            type: 'UNSUBSCRIBE',
            channel: channel
        });
    }

    /**
     * Add event listener
     */
    on(eventType, callback) {
        if (!this.listeners[eventType]) {
            this.listeners[eventType] = [];
        }
        this.listeners[eventType].push(callback);
    }

    /**
     * Remove event listener
     */
    off(eventType, callback) {
        if (this.listeners[eventType]) {
            this.listeners[eventType] = this.listeners[eventType].filter(cb => cb !== callback);
        }
    }

    /**
     * Get connection status
     */
    isConnected() {
        return this.ws && this.ws.readyState === WebSocket.OPEN;
    }

    /**
     * Get connection info
     */
    getStatus() {
        return {
            connected: this.isConnected(),
            reconnectAttempts: this.reconnectAttempts,
            readyState: this.ws ? this.ws.readyState : null
        };
    }
}

// Create global WebSocket sync instance
const webSocketSync = new WebSocketSync();

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WebSocketSync, webSocketSync };
}
