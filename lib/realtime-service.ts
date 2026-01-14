// Realtime Service for Admin Panel - Communicates with Mobile App
// Enables live exam data sync, password sharing, and device control

class RealtimeService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // 3 seconds
  private listeners: Map<string, Function[]> = new Map();
  private examId: string | null = null;

  constructor(private adminPanelUrl: string = 'http://localhost:3000') {}

  /**
   * Connect to WebSocket for real-time communication
   */
  connect(examId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.examId = examId;
        
        // Use WebSocket for real-time communication
        const wsUrl = this.adminPanelUrl.replace('http', 'ws') + `/ws/admin/${examId}`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('✅ Connected to realtime service');
          this.reconnectAttempts = 0;
          this.emit('connected', { examId });
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.emit('error', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket closed');
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Attempt to reconnect to WebSocket
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (this.examId) {
          this.connect(this.examId).catch(error => {
            console.error('Reconnection failed:', error);
          });
        }
      }, this.reconnectDelay);
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: any): void {
    const { type, payload } = data;
    
    switch (type) {
      case 'DEVICE_UPDATE':
        this.emit('deviceUpdate', payload);
        break;
      case 'SYNC_STATUS':
        this.emit('syncStatus', payload);
        break;
      case 'VERIFICATION_COMPLETE':
        this.emit('verificationComplete', payload);
        break;
      case 'OPERATOR_LOGIN':
        this.emit('operatorLogin', payload);
        break;
      case 'OPERATOR_LOGOUT':
        this.emit('operatorLogout', payload);
        break;
      case 'DATA_SYNC':
        this.emit('dataSync', payload);
        break;
      default:
        console.log('Unknown message type:', type);
    }
  }

  /**
   * Send command to all devices for a specific exam
   */
  sendCommandToDevices(command: string, data: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return;
    }

    const message = {
      type: 'COMMAND',
      command,
      data,
      timestamp: new Date().toISOString()
    };

    this.ws.send(JSON.stringify(message));
  }

  /**
   * Trigger sync on all devices
   */
  triggerSync(examId: string): void {
    this.sendCommandToDevices('SYNC_TRIGGER', { examId });
  }

  /**
   * Logout all devices
   */
  logoutAllDevices(examId: string): void {
    this.sendCommandToDevices('LOGOUT_ALL', { examId });
  }

  /**
   * Share download password with devices
   */
  shareDownloadPassword(examId: string, password: string, examType: 'mock' | 'main'): void {
    this.sendCommandToDevices('SHARE_PASSWORD', { 
      examId, 
      password, 
      examType,
      sharedAt: new Date().toISOString()
    });
  }

  /**
   * Share exam data with devices
   */
  shareExamData(examId: string, examData: any): void {
    this.sendCommandToDevices('SHARE_EXAM_DATA', { 
      examId, 
      data: examData,
      sharedAt: new Date().toISOString()
    });
  }

  /**
   * Get live device status
   */
  getLiveDeviceStatus(examId: string): void {
    this.sendCommandToDevices('GET_STATUS', { examId });
  }

  /**
   * Subscribe to events
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * Unsubscribe from events
   */
  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit event
   */
  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

export default RealtimeService;
