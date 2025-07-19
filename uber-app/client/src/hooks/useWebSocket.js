import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

export const useWebSocket = (url) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    console.log('Attempting to connect to WebSocket:', url);
    
    const newSocket = io(url, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      forceNew: true
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setConnectionStatus('Connected');
      reconnectAttemptsRef.current = 0;
    });

    newSocket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      setIsConnected(false);
      setConnectionStatus('Disconnected');
      
      // Attempt to reconnect
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
        setConnectionStatus(`Reconnecting in ${delay / 1000}s...`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, delay);
      } else {
        setConnectionStatus('Connection failed');
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
      setConnectionStatus('Connection error');
    });

    newSocket.on('connected', (data) => {
      console.log('Server acknowledgment:', data);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
  }, [url]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setSocket(null);
    setIsConnected(false);
    setConnectionStatus('Disconnected');
  }, []);

  const sendMessage = useCallback((message) => {
    if (socketRef.current?.connected) {
      console.log('Sending message:', message);
      socketRef.current.emit(message.type, message);
    } else {
      console.warn('Cannot send message: socket not connected');
    }
  }, []);

  useEffect(() => {
    if (url) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [url, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    socket,
    isConnected,
    connectionStatus,
    sendMessage,
    connect,
    disconnect
  };
};