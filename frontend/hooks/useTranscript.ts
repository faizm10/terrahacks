'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface TranscriptEntry {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  session_id: string;
}

interface UseTranscriptReturn {
  transcripts: TranscriptEntry[];
  isConnected: boolean;
  connect: (sessionId: string) => void;
  disconnect: () => void;
}

export const useTranscript = (): UseTranscriptReturn => {
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const connect = useCallback((sessionId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    sessionIdRef.current = sessionId;
    const ws = new WebSocket(`ws://localhost:8000/api/realtime/ws/${sessionId}`);

    ws.onopen = () => {
      console.log('WebSocket connected for transcript streaming');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === 'transcript' && message.data) {
          setTranscripts(prev => [...prev, message.data]);
        } else if (message.type === 'ping') {
          // Keep alive ping, no action needed
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    wsRef.current = ws;
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    transcripts,
    isConnected,
    connect,
    disconnect,
  };
};