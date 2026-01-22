import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.token = null;
  }

  initialize(token) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.token = token;
    this.socket = io('http://localhost:5000', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    // Error handling
    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      if (error.message.includes('authentication') || error.message.includes('secret or public key')) {
        console.error('Authentication error - check your token');
      }
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export default new SocketService();