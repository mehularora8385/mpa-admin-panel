/**
 * Admin Panel Integration for Real-Time Mobile App Control
 * Handles: Auto logout, sync, data download commands
 */

class AdminPanelIntegration {
  constructor(wsServer, apiBaseUrl) {
    this.wsServer = wsServer;
    this.apiBaseUrl = apiBaseUrl;
    this.setupAdminControls();
  }

  /**
   * Setup admin control buttons
   */
  setupAdminControls() {
    // These functions will be called from the admin panel HTML
    console.log('✅ Admin controls initialized');
  }

  /**
   * Logout all operators for an exam
   * Called when admin clicks "Logout All" button
   */
  async logoutAllOperators(examId) {
    try {
      console.log(`🚪 Logging out all operators for exam ${examId}...`);

      // Get all operators for this exam
      const response = await fetch(
        `${this.apiBaseUrl}/api/exams/${examId}/operators`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.getAdminToken()}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get operators');
      }

      const { data: operators } = await response.json();
      const operatorIds = operators.map(op => op.id);

      // Send logout command via WebSocket
      this.wsServer.sendLogoutCommand(examId, operatorIds);

      // Also send via API for backup
      await fetch(`${this.apiBaseUrl}/api/admin/logout-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAdminToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ examId }),
      });

      console.log(`✅ Logout command sent to ${operatorIds.length} operators`);

      return {
        success: true,
        operatorCount: operatorIds.length,
        message: `Logged out ${operatorIds.length} operators`,
      };
    } catch (error) {
      console.error('❌ Logout all error:', error);
      throw error;
    }
  }

  /**
   * Sync data from all operators for an exam
   * Called when admin clicks "Sync Data" button
   */
  async syncAllOperators(examId) {
    try {
      console.log(`🔄 Syncing data from all operators for exam ${examId}...`);

      // Get all operators for this exam
      const response = await fetch(
        `${this.apiBaseUrl}/api/exams/${examId}/operators`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.getAdminToken()}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get operators');
      }

      const { data: operators } = await response.json();
      const operatorIds = operators.map(op => op.id);

      // Send sync command via WebSocket
      this.wsServer.sendSyncCommand(examId, operatorIds);

      // Also send via API for backup
      await fetch(`${this.apiBaseUrl}/api/admin/sync-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getAdminToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ examId }),
      });

      console.log(`✅ Sync command sent to ${operatorIds.length} operators`);

      return {
        success: true,
        operatorCount: operatorIds.length,
        message: `Sync initiated for ${operatorIds.length} operators`,
      };
    } catch (error) {
      console.error('❌ Sync all error:', error);
      throw error;
    }
  }

  /**
   * Get real-time operator status
   */
  getOperatorStatus(operatorId) {
    return this.wsServer.getOperatorStatus(operatorId);
  }

  /**
   * Get all connected operators
   */
  getConnectedOperators() {
    return this.wsServer.getConnectedOperators();
  }

  /**
   * Get all connected admins
   */
  getConnectedAdmins() {
    return this.wsServer.getConnectedAdmins();
  }

  /**
   * Get admin token from localStorage
   */
  getAdminToken() {
    // This will be called from the browser context
    return localStorage.getItem('adminToken');
  }

  /**
   * Setup real-time listeners for admin panel
   */
  setupRealtimeListeners(socket) {
    // Listen for data updates from mobile app
    socket.on('DATA_UPDATE', (data) => {
      console.log('📥 Data update received:', data);
      // Update admin dashboard in real-time
      this.updateAdminDashboard(data);
    });

    // Listen for attendance updates
    socket.on('ATTENDANCE_UPDATE', (data) => {
      console.log('📊 Attendance update:', data);
      this.updateAttendanceTable(data);
    });

    // Listen for biometric updates
    socket.on('BIOMETRIC_UPDATE', (data) => {
      console.log('🔐 Biometric update:', data);
      this.updateBiometricTable(data);
    });

    // Listen for download notifications
    socket.on('DOWNLOAD_NOTIFICATION', (data) => {
      console.log('📥 Download notification:', data);
      this.showDownloadNotification(data);
    });

    // Listen for operator disconnection
    socket.on('OPERATOR_DISCONNECTED', (data) => {
      console.log('❌ Operator disconnected:', data);
      this.updateOperatorStatus(data.operatorId, 'OFFLINE');
    });

    // Listen for operator offline mode
    socket.on('OPERATOR_OFFLINE', (data) => {
      console.log('📴 Operator offline:', data);
      this.updateOperatorStatus(data.operatorId, 'OFFLINE');
    });

    // Listen for logout confirmation
    socket.on('LOGOUT_CONFIRMED', (data) => {
      console.log('🚪 Logout confirmed:', data);
      this.updateOperatorStatus(data.operatorId, 'LOGGED_OUT');
    });

    // Listen for sync response
    socket.on('SYNC_RESPONSE', (data) => {
      console.log('🔄 Sync response:', data);
      this.updateSyncStatus(data);
    });
  }

  /**
   * Update admin dashboard with real-time data
   */
  updateAdminDashboard(data) {
    try {
      const { operatorId, dataType, data: updateData } = data;

      // Update dashboard UI
      const dashboardElement = document.getElementById('dashboard-updates');
      if (dashboardElement) {
        const update = document.createElement('div');
        update.className = 'update-item';
        update.innerHTML = `
          <span class="operator-id">${operatorId}</span>
          <span class="data-type">${dataType}</span>
          <span class="timestamp">${new Date().toLocaleTimeString()}</span>
        `;
        dashboardElement.insertBefore(update, dashboardElement.firstChild);

        // Keep only last 10 updates
        while (dashboardElement.children.length > 10) {
          dashboardElement.removeChild(dashboardElement.lastChild);
        }
      }

      console.log('✅ Dashboard updated');
    } catch (error) {
      console.error('❌ Dashboard update error:', error);
    }
  }

  /**
   * Update attendance table in real-time
   */
  updateAttendanceTable(data) {
    try {
      const { operatorId, candidateId, status } = data;

      // Update attendance table
      const table = document.getElementById('attendance-table');
      if (table) {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${operatorId}</td>
          <td>${candidateId}</td>
          <td>${status}</td>
          <td>${new Date().toLocaleTimeString()}</td>
        `;
        table.insertBefore(row, table.firstChild);

        // Keep only last 100 rows
        while (table.rows.length > 100) {
          table.removeChild(table.lastChild);
        }
      }

      console.log('✅ Attendance table updated');
    } catch (error) {
      console.error('❌ Attendance table update error:', error);
    }
  }

  /**
   * Update biometric table in real-time
   */
  updateBiometricTable(data) {
    try {
      const { operatorId, candidateId, fingerprint, faceMatch } = data;

      // Update biometric table
      const table = document.getElementById('biometric-table');
      if (table) {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${operatorId}</td>
          <td>${candidateId}</td>
          <td>${fingerprint ? '✓' : '✗'}</td>
          <td>${faceMatch ? '✓' : '✗'}</td>
          <td>${new Date().toLocaleTimeString()}</td>
        `;
        table.insertBefore(row, table.firstChild);

        // Keep only last 100 rows
        while (table.rows.length > 100) {
          table.removeChild(table.lastChild);
        }
      }

      console.log('✅ Biometric table updated');
    } catch (error) {
      console.error('❌ Biometric table update error:', error);
    }
  }

  /**
   * Show download notification
   */
  showDownloadNotification(data) {
    try {
      const { operatorId, dataType, count } = data;

      // Show notification
      const notification = document.createElement('div');
      notification.className = 'notification success';
      notification.innerHTML = `
        <strong>Download Complete</strong><br>
        Operator: ${operatorId}<br>
        Type: ${dataType}<br>
        Records: ${count}
      `;

      const container = document.getElementById('notifications');
      if (container) {
        container.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
          notification.remove();
        }, 5000);
      }

      console.log('✅ Notification shown');
    } catch (error) {
      console.error('❌ Notification error:', error);
    }
  }

  /**
   * Update operator status in real-time
   */
  updateOperatorStatus(operatorId, status) {
    try {
      // Update operator status in UI
      const statusElement = document.querySelector(`[data-operator-id="${operatorId}"]`);
      if (statusElement) {
        statusElement.textContent = status;
        statusElement.className = `status ${status.toLowerCase()}`;
      }

      console.log(`✅ Operator ${operatorId} status updated to ${status}`);
    } catch (error) {
      console.error('❌ Status update error:', error);
    }
  }

  /**
   * Update sync status
   */
  updateSyncStatus(data) {
    try {
      const { operatorId, data: syncData } = data;

      console.log(`✅ Sync status updated for operator ${operatorId}:`, syncData);

      // Update UI with sync status
      const syncElement = document.querySelector(`[data-sync-operator-id="${operatorId}"]`);
      if (syncElement) {
        syncElement.innerHTML = `
          <div class="sync-status">
            <p>Attendance: ${syncData.attendance?.length || 0}</p>
            <p>Biometric: ${syncData.biometric?.length || 0}</p>
            <p>Registrations: ${syncData.registrations?.length || 0}</p>
          </div>
        `;
      }
    } catch (error) {
      console.error('❌ Sync status update error:', error);
    }
  }
}

// Export for use in admin panel
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdminPanelIntegration;
}
