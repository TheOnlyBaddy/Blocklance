import { useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

export const useBlockchainUpdates = (onEscrowUpdate) => {
  const { user } = useAuth();

  const handleEscrowUpdate = useCallback((data) => {
    console.log('🔔 Escrow event:', data);
    if (onEscrowUpdate && typeof onEscrowUpdate === 'function') {
      onEscrowUpdate(data);
    }
  }, [onEscrowUpdate]);

  const socketRef = useRef(null);
  const connectionAttempted = useRef(false);
  const reconnectAttempts = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 3;

  const connectWebSocket = useCallback(() => {
    if (!user || connectionAttempted.current) return;
    
    connectionAttempted.current = true;
    reconnectAttempts.current = 0;

    // Get the base URL from environment variable or use default
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    
    console.log('🔌 Attempting to connect to WebSocket server...');
    
    // Only create new socket if one doesn't exist or is disconnected
    if (!socketRef.current || !socketRef.current.connected) {
      socketRef.current = io(apiUrl, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000, // Reduced timeout for faster feedback
        query: { 
          userId: user.id || user._id,
          userType: user.role || 'user',
          EIO: '4',
          t: Date.now() // Cache buster
        }
      });

      const socket = socketRef.current;

      // Connection established
      socket.on('connect', () => {
        console.log('✅ WebSocket connected:', socket.id);
        reconnectAttempts.current = 0; // Reset on successful connection
      });

      // Connection error
      socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts.current += 1;
          console.log(`⏳ Reconnection attempt ${reconnectAttempts.current} of ${MAX_RECONNECT_ATTEMPTS}...`);
        } else {
          toast.error('Connection error. Please check your network and refresh the page.');
        }
      });

      // Reconnection attempts
      socket.on('reconnect_attempt', (attempt) => {
        console.log(`🔄 Reconnection attempt ${attempt}...`);
      });

      // Reconnection failed
      socket.on('reconnect_failed', () => {
        console.error('❌ Failed to reconnect to WebSocket server');
        toast.error('Connection lost. Please refresh the page to reconnect.');
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        console.log(`🔌 WebSocket disconnected: ${reason}`);
        if (reason === 'io server disconnect') {
          // The disconnection was initiated by the server, you need to reconnect manually
          socket.connect();
        }
      });
    }

    socket.on('escrowUpdate', (data) => {
      if (data.event === 'Funded') {
        toast.success(`Escrow funded with ${data.amount} ETH`);
      } else if (data.event === 'Released') {
        toast.success(`Payment released: ${data.amount} ETH`);
      } else if (data.event === 'Refunded') {
        toast.success(`Refund processed: ${data.amount} ETH`);
      }
      handleEscrowUpdate(data);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from WebSocket server');
    });

    // Cleanup function
    return () => {
      if (socketRef.current) {
        socket.off('escrowUpdate', handleEscrowUpdate);
        socket.off('connect');
        socket.off('connect_error');
        socket.off('reconnect_attempt');
        socket.off('reconnect_failed');
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [user, handleEscrowUpdate]);

  return null;
};

export default useBlockchainUpdates;
