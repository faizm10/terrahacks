'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseWebSocketReturn {
  isConnected: boolean;
  isStreaming: boolean;
  transcript: string;
  error: string | null;
  connectionStatus: string;
  activeSessions: string[];
  totalConnections: number;
  connect: (sessionId?: string) => Promise<void>;
  disconnect: () => void;
  sendAudioData: (audioBlob: Blob) => Promise<void>;
  sendVideoData: (videoBlob: Blob) => Promise<void>;
  requestTranscription: (audioBlob: Blob) => Promise<void>;
  sendChatMessage: (message: string) => Promise<void>;
  sendPing: () => Promise<void>;
  getConnectionStatus: () => Promise<void>;
}

export const useWebSocket = (): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [activeSessions, setActiveSessions] = useState<string[]>([]);
  const [totalConnections, setTotalConnections] = useState(0);
  
  const wsRef = useRef<WebSocket | null>(null);
  const sessionIdRef = useRef<string>('default');
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(async (sessionId: string = 'default') => {
    try {
      setError(null);
      sessionIdRef.current = sessionId;
      
      console.log('Connecting to WebSocket...');
      
      // Close existing connection if any
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      
      // Clear existing intervals
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
      
      // Create WebSocket connection
      const ws = new WebSocket(`ws://localhost:8000/api/stream/ws/${sessionId}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        setConnectionStatus('connected');
        setError(null);
        
        // Start ping interval to keep connection alive
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            sendPing();
          }
        }, 30000); // Send ping every 30 seconds
        
        // Send a test message to verify connection
        ws.send(JSON.stringify({
          type: 'test',
          data: 'Connection test',
          session_id: sessionId,
          timestamp: Date.now()
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('WebSocket message received:', message);
          
          switch (message.type) {
            case 'connection_established':
              console.log('Connection established:', message.message);
              break;
            case 'audio_received':
              console.log('Audio data received by server');
              break;
            case 'video_received':
              console.log('Video data received by server');
              break;
            case 'transcription_result':
              console.log('Transcription received:', message.transcript);
              setTranscript(prev => prev + '\n' + message.transcript);
              break;
            case 'transcription_error':
              console.error('Transcription error:', message.error);
              setError(`Transcription error: ${message.error}`);
              break;
            case 'pong':
              console.log('Pong received - connection is healthy');
              break;
            case 'chat_message':
              console.log('Chat message received:', message.message);
              // You can add a chat message handler here
              break;
            case 'webrtc_connected':
              console.log('WebRTC connection established');
              break;
            case 'webrtc_disconnected':
              console.log('WebRTC connection closed');
              break;
            case 'test_response':
              console.log('Test response received:', message.message);
              break;
            case 'unknown_message':
              console.warn('Unknown message type:', message.message);
              break;
            case 'error':
              console.error('Server error:', message.message);
              setError(`Server error: ${message.message}`);
              break;
            default:
              console.log('Received message:', message);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('WebSocket connection error');
        setIsConnected(false);
        setConnectionStatus('error');
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setIsStreaming(false);
        setConnectionStatus('disconnected');
        
        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }
        
        // Attempt to reconnect if it wasn't a manual disconnect
        if (event.code !== 1000) {
          console.log('Attempting to reconnect in 3 seconds...');
          reconnectTimeoutRef.current = setTimeout(() => {
            if (!isConnected) {
              connect(sessionId);
            }
          }, 3000);
        }
      };

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect WebSocket';
      setError(errorMsg);
      console.error('WebSocket connection error:', err);
    }
  }, [isConnected]);

  const disconnect = useCallback(() => {
    console.log('Disconnecting WebSocket...');
    
    // Clear reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Clear ping interval
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsStreaming(false);
    setConnectionStatus('disconnected');
    setError(null);
  }, []);

  const sendAudioData = useCallback(async (audioBlob: Blob) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError('WebSocket not connected');
      return;
    }

    try {
      console.log('Sending audio data...');
      
      // Convert blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      const message = {
        type: 'audio',
        data: base64Data,
        session_id: sessionIdRef.current,
        timestamp: Date.now()
      };

      wsRef.current.send(JSON.stringify(message));
      setIsStreaming(true);
      console.log('Audio data sent successfully');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to send audio data';
      setError(errorMsg);
      console.error('Error sending audio data:', err);
    }
  }, []);

  const sendVideoData = useCallback(async (videoBlob: Blob) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError('WebSocket not connected');
      return;
    }

    try {
      console.log('Sending video data...');
      
      // Convert blob to base64
      const arrayBuffer = await videoBlob.arrayBuffer();
      const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      const message = {
        type: 'video',
        data: base64Data,
        session_id: sessionIdRef.current,
        timestamp: Date.now()
      };

      wsRef.current.send(JSON.stringify(message));
      setIsStreaming(true);
      console.log('Video data sent successfully');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to send video data';
      setError(errorMsg);
      console.error('Error sending video data:', err);
    }
  }, []);

  const requestTranscription = useCallback(async (audioBlob: Blob) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError('WebSocket not connected');
      return;
    }

    try {
      console.log('Requesting transcription...');
      
      // Convert blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      const message = {
        type: 'transcription_request',
        data: base64Data,
        session_id: sessionIdRef.current,
        timestamp: Date.now()
      };

      wsRef.current.send(JSON.stringify(message));
      console.log('Transcription request sent');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to request transcription';
      setError(errorMsg);
      console.error('Error requesting transcription:', err);
    }
  }, []);

  const sendChatMessage = useCallback(async (message: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError('WebSocket not connected');
      return;
    }

    try {
      console.log('Sending chat message...');
      
      const chatMessage = {
        type: 'chat',
        message: message,
        session_id: sessionIdRef.current,
        timestamp: Date.now()
      };

      wsRef.current.send(JSON.stringify(chatMessage));
      console.log('Chat message sent successfully');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to send chat message';
      setError(errorMsg);
      console.error('Error sending chat message:', err);
    }
  }, []);

  const sendPing = useCallback(async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      const message = {
        type: 'ping',
        session_id: sessionIdRef.current,
        timestamp: Date.now()
      };

      wsRef.current.send(JSON.stringify(message));
      console.log('Ping sent');
    } catch (err) {
      console.error('Error sending ping:', err);
    }
  }, []);

  const getConnectionStatus = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/stream/status/${sessionIdRef.current}`);
      if (response.ok) {
        const status = await response.json();
        setConnectionStatus(status.status);
        setActiveSessions(status.active_sessions || []);
        setTotalConnections(status.total_connections || 0);
        console.log('Connection status:', status);
      }
    } catch (err) {
      console.error('Error getting connection status:', err);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    isConnected,
    isStreaming,
    transcript,
    error,
    connectionStatus,
    activeSessions,
    totalConnections,
    connect,
    disconnect,
    sendAudioData,
    sendVideoData,
    requestTranscription,
    sendChatMessage,
    sendPing,
    getConnectionStatus,
  };
}; 