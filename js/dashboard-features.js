/**
 * Dashboard Features Module
 * Handles all dashboard functionality
 */

class DashboardFeatures {
    constructor() {
        this.dashboardData = {
            activeCentres: 0,
            activeOperators: 0,
            totalStudents: 0,
            verifiedStudents: 0,
            presentStudents: 0,
            pendingVerification: 0
        };
        this.refreshInterval = 30000; // 30 seconds
        this.initializeDashboard();
    }

    /**
     * Initialize dashboard
     */
    async initializeDashboard() {
        await this.loadDashboardData();
        this.renderDashboard();
        this.startAutoRefresh();
    }

    /**
     * Load dashboard data from API
     */
    async loadDashboardData(examFilter = null) {
        try {
            const params = {};
            if (examFilter) {
                params.examId = examFilter;
            }

            const response = await apiClient.get('/api/dashboard/stats', params);
            
            if (response.success) {
                this.dashboardData = response.data;
                await auditLogger.logDataAccess('DASHBOARD', 1);
                return true;
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            return false;
        }
    }

    /**
     * Render dashboard
     */
    renderDashboard() {
        const dashboardContainer = document.getElementById('dashboardContainer');
        if (!dashboardContainer) return;

        const html = `
            <div class="dashboard-stats">
                <div class="stat-card">
                    <div class="stat-icon">🏢</div>
                    <div class="stat-content">
                        <div class="stat-label">Active Centres</div>
                        <div class="stat-value">${this.dashboardData.activeCentres}</div>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">👤</div>
                    <div class="stat-content">
                        <div class="stat-label">Active Operators</div>
                        <div class="stat-value">${this.dashboardData.activeOperators}</div>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">👥</div>
                    <div class="stat-content">
                        <div class="stat-label">Total Students</div>
                        <div class="stat-value">${this.dashboardData.totalStudents}</div>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">✓</div>
                    <div class="stat-content">
                        <div class="stat-label">Verified</div>
                        <div class="stat-value">${this.dashboardData.verifiedStudents}</div>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">📍</div>
                    <div class="stat-content">
                        <div class="stat-label">Present</div>
                        <div class="stat-value">${this.dashboardData.presentStudents}</div>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">⏳</div>
                    <div class="stat-content">
                        <div class="stat-label">Pending</div>
                        <div class="stat-value">${this.dashboardData.pendingVerification}</div>
                    </div>
                </div>
            </div>

            <div class="dashboard-actions">
                <button id="syncAllBtn" class="btn btn-primary">
                    <span>🔄</span> Sync All Data
                </button>
                <button id="logoutAllBtn" class="btn btn-danger">
                    <span>🚪</span> Logout All Operators
                </button>
                <button id="refreshBtn" class="btn btn-secondary">
                    <span>🔃</span> Refresh
                </button>
            </div>

            <div class="dashboard-filters">
                <label for="examFilter">Filter by Exam:</label>
                <select id="examFilter" class="form-control">
                    <option value="">All Exams</option>
                </select>
            </div>

            <div id="dashboardGraphs" class="dashboard-graphs">
                <!-- Graphs will be rendered here -->
            </div>
        `;

        dashboardContainer.innerHTML = html;
        this.attachEventListeners();
        this.renderGraphs();
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        const syncAllBtn = document.getElementById('syncAllBtn');
        const logoutAllBtn = document.getElementById('logoutAllBtn');
        const refreshBtn = document.getElementById('refreshBtn');
        const examFilter = document.getElementById('examFilter');

        if (syncAllBtn) {
            syncAllBtn.addEventListener('click', () => this.syncAllData());
        }

        if (logoutAllBtn) {
            logoutAllBtn.addEventListener('click', () => this.logoutAllOperators());
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshDashboard());
        }

        if (examFilter) {
            examFilter.addEventListener('change', (e) => this.filterByExam(e.target.value));
            this.loadExamOptions();
        }
    }

    /**
     * Load exam options for filter
     */
    async loadExamOptions() {
        try {
            const response = await apiClient.get('/api/exams');
            const examFilter = document.getElementById('examFilter');
            
            if (response.success && response.data) {
                response.data.forEach(exam => {
                    const option = document.createElement('option');
                    option.value = exam.id;
                    option.textContent = exam.name;
                    examFilter.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading exam options:', error);
        }
    }

    /**
     * Filter dashboard by exam
     */
    async filterByExam(examId) {
        await this.loadDashboardData(examId);
        this.renderDashboard();
    }

    /**
     * Sync all data
     */
    async syncAllData() {
        if (!confirm('Are you sure you want to sync all data? This may take a few minutes.')) {
            return;
        }

        const syncBtn = document.getElementById('syncAllBtn');
        syncBtn.disabled = true;
        syncBtn.innerHTML = '<span>⏳</span> Syncing...';

        try {
            const response = await apiClient.post('/api/sync/all', {});
            
            if (response.success) {
                alert('Data sync completed successfully!');
                await auditLogger.logAction('BULK_SYNC', { status: 'success' });
                await this.refreshDashboard();
            } else {
                alert('Sync failed. Please try again.');
                await auditLogger.logAction('BULK_SYNC', { status: 'failed', error: response.message });
            }
        } catch (error) {
            console.error('Sync error:', error);
            alert('Error during sync. Please try again.');
            await auditLogger.logSecurityEvent('SYNC_ERROR', { error: error.message });
        } finally {
            syncBtn.disabled = false;
            syncBtn.innerHTML = '<span>🔄</span> Sync All Data';
        }
    }

    /**
     * Logout all operators
     */
    async logoutAllOperators() {
        if (!confirm('Are you sure you want to logout all operators? They will need to login again.')) {
            return;
        }

        const logoutBtn = document.getElementById('logoutAllBtn');
        logoutBtn.disabled = true;
        logoutBtn.innerHTML = '<span>⏳</span> Logging out...';

        try {
            const response = await apiClient.post('/api/operators/logout-all', {});
            
            if (response.success) {
                alert('All operators have been logged out successfully!');
                await auditLogger.logSecurityEvent('FORCE_LOGOUT_ALL', { 
                    operatorsAffected: response.data?.count || 0 
                });
            } else {
                alert('Logout failed. Please try again.');
            }
        } catch (error) {
            console.error('Logout error:', error);
            alert('Error during logout. Please try again.');
        } finally {
            logoutBtn.disabled = false;
            logoutBtn.innerHTML = '<span>🚪</span> Logout All Operators';
        }
    }

    /**
     * Refresh dashboard
     */
    async refreshDashboard() {
        const examFilter = document.getElementById('examFilter');
        const selectedExam = examFilter ? examFilter.value : null;
        await this.loadDashboardData(selectedExam);
        this.renderDashboard();
    }

    /**
     * Render graphs
     */
    renderGraphs() {
        const graphsContainer = document.getElementById('dashboardGraphs');
        if (!graphsContainer) return;

        // Create canvas for chart
        const canvas = document.createElement('canvas');
        canvas.id = 'dashboardChart';
        graphsContainer.appendChild(canvas);

        // Create chart
        const ctx = canvas.getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Verified', 'Present', 'Pending'],
                datasets: [{
                    data: [
                        this.dashboardData.verifiedStudents,
                        this.dashboardData.presentStudents,
                        this.dashboardData.pendingVerification
                    ],
                    backgroundColor: ['#27ae60', '#3498db', '#f39c12'],
                    borderColor: ['#229954', '#2980b9', '#d68910'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Student Status Distribution'
                    }
                }
            }
        });
    }

    /**
     * Start auto-refresh
     */
    startAutoRefresh() {
        setInterval(() => {
            this.refreshDashboard();
        }, this.refreshInterval);
    }

    /**
     * Get dashboard data
     */
    getDashboardData() {
        return this.dashboardData;
    }
}

// Create global dashboard features instance
const dashboardFeatures = new DashboardFeatures();

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DashboardFeatures, dashboardFeatures };
}
