import { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';

const CONNECTION_STATES = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting'
};

export function useWebSocket(url) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(CONNECTION_STATES.DISCONNECTED);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const socketRef = useRef(null);
  const messageQueueRef = useRef([]);
  const reconnectTimeoutRef = useRef(null);

  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000; // 1 second

  // Calculate reconnect delay with exponential backoff
  const getReconnectDelay = useCallback((attempt) => {
    return Math.min(baseReconnectDelay * Math.pow(2, attempt), 30000); // Max 30 seconds
  }, []);

  // Send message with automatic queuing
  const sendMessage = useCallback((message) => {
    if (!message || typeof message !== 'object') {
      console.error('Invalid message format:', message);
      return false;
    }

    if (socketRef.current && isConnected) {
      try {
        socketRef.current.emit('message', message);
        return true;
      } catch (error) {
        console.error('Error sending message:', error);
        // Queue message for retry
        messageQueueRef.current.push(message);
        return false;
      }
    } else {
      // Queue message for when connection is restored
      messageQueueRef.current.push(message);
      console.log('Message queued (not connected):', message.type);
      return false;
    }
  }, [isConnected]);

  // Send queued messages
  const sendQueuedMessages = useCallback(() => {
    if (messageQueueRef.current.length === 0) return;

    const queuedMessages = [...messageQueueRef.current];
    messageQueueRef.current = [];

    queuedMessages.forEach(message => {
      if (socketRef.current && isConnected) {
        try {
          socketRef.current.emit('message', message);
          console.log('Sent queued message:', message.type);
        } catch (error) {
          console.error('Error sending queued message:', error);
          // Re-queue failed message
          messageQueueRef.current.push(message);
        }
      }
    });
  }, [isConnected]);

  // Initialize WebSocket connection
  const connect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    setConnectionStatus(CONNECTION_STATES.CONNECTING);

    const socket = io(url, {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
      forceNew: false,
      autoConnect: true
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setConnectionStatus(CONNECTION_STATES.CONNECTED);
      setReconnectAttempts(0);
      
      // Clear any pending reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      // Send queued messages
      setTimeout(sendQueuedMessages, 100);
    });

    // Handle server connection confirmation
    socket.on('connected', (data) => {
      console.log('Server connection confirmed:', data);
    });

    // Handle pong response
    socket.on('pong', (data) => {
      console.log('Pong received:', data);
    });

    socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      setIsConnected(false);
      setConnectionStatus(CONNECTION_STATES.DISCONNECTED);

      // Only attempt reconnect for certain disconnect reasons
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't reconnect automatically
        return;
      }

      // Attempt automatic reconnection
      if (reconnectAttempts < maxReconnectAttempts) {
        attemptReconnect();
      }
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
      setConnectionStatus(CONNECTION_STATES.DISCONNECTED);

      if (reconnectAttempts < maxReconnectAttempts) {
        attemptReconnect();
      }
    });

    socket.on('reconnect', () => {
      console.log('WebSocket reconnected');
      setReconnectAttempts(0);
    });

    socket.on('reconnect_error', (error) => {
      console.error('WebSocket reconnection error:', error);
    });

    return socket;
  }, [url]); // Remove dependencies that change frequently

  // Attempt reconnection with exponential backoff
  const attemptReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) return; // Already attempting reconnect

    setConnectionStatus(CONNECTION_STATES.RECONNECTING);
    
    setReconnectAttempts(prev => {
      const newAttempts = prev + 1;
      const delay = getReconnectDelay(newAttempts);
      
      console.log(`Attempting reconnect in ${delay}ms (attempt ${newAttempts}/${maxReconnectAttempts})`);

      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
        reconnectTimeoutRef.current = null;
      }, delay);
      
      return newAttempts;
    });
  }, [getReconnectDelay, connect]);

  // Manual reconnect function
  const reconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setReconnectAttempts(0);
    connect();
  }, [connect]);

  // Initialize connection on mount
  useEffect(() => {
    let mounted = true;
    
    const initializeConnection = () => {
      if (!mounted) return;
      
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      setConnectionStatus(CONNECTION_STATES.CONNECTING);

      const socket = io(url, {
        transports: ['websocket', 'polling'],
        upgrade: true,
        rememberUpgrade: true,
        timeout: 20000,
        forceNew: false,
        autoConnect: true
      });

      socketRef.current = socket;

      // Connection event handlers
      socket.on('connect', () => {
        if (!mounted) return;
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionStatus(CONNECTION_STATES.CONNECTED);
        setReconnectAttempts(0);
        
        // Clear any pending reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }

        // Send queued messages
        setTimeout(sendQueuedMessages, 100);
      });

      // Handle server connection confirmation
      socket.on('connected', (data) => {
        console.log('Server connection confirmed:', data);
      });

      // Handle pong response
      socket.on('pong', (data) => {
        console.log('Pong received:', data);
      });

      socket.on('disconnect', (reason) => {
        if (!mounted) return;
        console.log('WebSocket disconnected:', reason);
        setIsConnected(false);
        setConnectionStatus(CONNECTION_STATES.DISCONNECTED);

        // Only attempt reconnect for certain disconnect reasons
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, don't reconnect automatically
          return;
        }

        // Attempt automatic reconnection
        if (reconnectAttempts < maxReconnectAttempts) {
          attemptReconnect();
        }
      });

      socket.on('connect_error', (error) => {
        if (!mounted) return;
        console.error('WebSocket connection error:', error);
        setIsConnected(false);
        setConnectionStatus(CONNECTION_STATES.DISCONNECTED);

        if (reconnectAttempts < maxReconnectAttempts) {
          attemptReconnect();
        }
      });

      socket.on('reconnect', () => {
        if (!mounted) return;
        console.log('WebSocket reconnected');
        setReconnectAttempts(0);
      });

      socket.on('reconnect_error', (error) => {
        if (!mounted) return;
        console.error('WebSocket reconnection error:', error);
      });
    };

    initializeConnection();

    return () => {
      mounted = false;
      
      // Cleanup on unmount
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      
      setIsConnected(false);
      setConnectionStatus(CONNECTION_STATES.DISCONNECTED);
    };
  }, [url]);

  // Heartbeat to detect connection issues
  useEffect(() => {
    if (!isConnected) return;

    const heartbeatInterval = setInterval(() => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit('ping');
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(heartbeatInterval);
  }, [isConnected]);

  return {
    socket: socketRef.current,
    isConnected,
    connectionStatus,
    reconnectAttempts,
    maxReconnectAttempts,
    sendMessage,
    reconnect
  };
}