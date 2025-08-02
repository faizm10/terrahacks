'use client';

import { useState, useRef, useCallback } from 'react';
import SimplePeer from 'simple-peer';

interface UseWebRTCReturn {
  isConnected: boolean;
  isStreaming: boolean;
  localStream: MediaStream | null;
  error: string | null;
  startStream: () => Promise<void>;
  stopStream: () => void;
  connectToPeer: () => Promise<void>;
}

export const useWebRTC = (): UseWebRTCReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const peerRef = useRef<SimplePeer.Instance | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startStream = useCallback(async () => {
    try {
      setError(null);
      
      // Get user media (camera)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false // Only video for now
      });
      
      setLocalStream(stream);
      streamRef.current = stream;
      setIsStreaming(true);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to access camera';
      setError(errorMsg);
      console.error('Error accessing camera:', err);
    }
  }, []);

  const connectToPeer = useCallback(async () => {
    if (!streamRef.current) {
      setError('No stream available. Start stream first.');
      return;
    }

    try {
      setError(null);
      
      // Create peer connection as initiator
      const peer = new SimplePeer({
        initiator: true,
        trickle: false, // Wait for all ICE candidates
        stream: streamRef.current,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }
          ]
        }
      });

      peerRef.current = peer;

      peer.on('error', (err: Error) => {
        console.error('Peer error:', err);
        setError(`Peer connection error: ${err.message}`);
        setIsConnected(false);
      });

      peer.on('signal', async (data: SimplePeer.SignalData) => {
        if (data.type === 'offer') {
          try {
            console.log('Sending offer to backend...');
            
            // Send offer to backend
            const response = await fetch('http://localhost:8000/api/stream/connect', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                sdp: data.sdp,
                type: data.type,
                session_id: 'default'
              }),
            });

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const answer = await response.json();
            console.log('Received answer from backend:', answer);
            
            // Apply the answer
            peer.signal({
              type: 'answer',
              sdp: answer.sdp
            });
            
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to connect to backend';
            setError(`Backend connection error: ${errorMsg}`);
            console.error('Backend connection error:', err);
          }
        }
      });

      peer.on('connect', () => {
        console.log('Peer connected!');
        setIsConnected(true);
        setError(null);
      });

      peer.on('close', () => {
        console.log('Peer connection closed');
        setIsConnected(false);
      });

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create peer connection';
      setError(errorMsg);
      console.error('Peer creation error:', err);
    }
  }, []);

  const stopStream = useCallback(() => {
    // Stop peer connection
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    
    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setLocalStream(null);
    setIsStreaming(false);
    setIsConnected(false);
    setError(null);
  }, []);

  return {
    isConnected,
    isStreaming,
    localStream,
    error,
    startStream,
    stopStream,
    connectToPeer,
  };
};