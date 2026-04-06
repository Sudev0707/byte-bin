// hooks/useWebSocket.js - Add function to check user status
import { useEffect, useRef, useState, useCallback } from 'react';
import { getSession } from '@/utils/localStorage';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const messageHandlers = useRef(new Map());
  
  const connect = useCallback(() => {
    const session = getSession();
    
    if (!session?.token) {
      console.log('No token found, skipping WebSocket connection');
      return;
    }
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.replace('/api', '').replace('http', 'ws');
    const wsUrl = `${baseUrl}/ws?token=${session.token}`;
    
    console.log('Connecting to WebSocket:', wsUrl);
    
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onopen = () => {
      console.log('✅ WebSocket connected successfully');
      setIsConnected(true);
    };
    
    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 Received message type:', data.type, data);
        const handler = messageHandlers.current.get(data.type);
        if (handler) handler(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    // Global error handler
    messageHandlers.current.set('error', (data) => {
      console.error('🚨 WebSocket error received:', data.message);
      // Call all registered error callbacks
      for (const [, handlers] of errorCallbacks.current) {
        handlers.forEach(cb => cb(data.message));
      }
    });
    
    wsRef.current.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      setIsConnected(false);
      setTimeout(connect, 3000);
    };
    
    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }, []);
  
  const sendMessage = useCallback((type, data, onError) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      
      wsRef.current.send(JSON.stringify({ type, ...data }));
      return true;
    }
    console.log('Cannot send message - WebSocket not open');
    onError?.('WebSocket not connected');
    return false;
  }, []);
  
  const errorCallbacks = useRef(new Map()); // tempId -> [callbacks]

  const addMessageHandler = useCallback((type, handler) => {
    messageHandlers.current.set(type, handler);
    return () => messageHandlers.current.delete(type);
  }, []);

  const onSendError = useCallback((tempId, callback) => {
    if (!errorCallbacks.current.has(tempId)) {
      errorCallbacks.current.set(tempId, []);
    }
    errorCallbacks.current.get(tempId).push(callback);
    return () => {
      const callbacks = errorCallbacks.current.get(tempId);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) callbacks.splice(index, 1);
        if (callbacks.length === 0) {
          errorCallbacks.current.delete(tempId);
        }
      }
    };
  }, []); 
  
  const getUserStatus = useCallback((userId) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      sendMessage('get-online-status', { userId });
      return true;
    }
    return false;
  }, [sendMessage]);
  
  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);
  
  return { isConnected, sendMessage, addMessageHandler, getUserStatus };
}