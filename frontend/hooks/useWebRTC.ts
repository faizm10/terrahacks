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
      console.log('Starting stream...');
      
      // Get user media (camera + microphone)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      console.log('Media stream obtained:', stream.getTracks().map(track => track.kind));
      setLocalStream(stream);
      streamRef.current = stream;
      setIsStreaming(true);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to access camera/microphone';
      setError(errorMsg);
      console.error('Error accessing camera/microphone:', err);
    }
  }, []);

  const connectToPeer = useCallback(async () => {
    if (!streamRef.current) {
      setError('No stream available. Start stream first.');
      return;
    }

    try {
      setError(null);
      console.log('Connecting to peer...');
      
      // Clean up any existing peer
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
      
      // Create peer connection as initiator
      const peer = new SimplePeer({
        initiator: true,
        trickle: false, // Wait for all ICE candidates
        stream: streamRef.current,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' }
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
              const errorText = await response.text();
              throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const answer = await response.json();
            console.log('Received answer from backend:', answer);
            
            if (answer.status !== 'success') {
              throw new Error(`Backend returned error: ${answer.status}`);
            }
            
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

      peer.on('iceStateChange', (state: string) => {
        console.log('ICE state changed:', state);
      });

      peer.on('iceConnectionStateChange', (state: string) => {
        console.log('ICE connection state changed:', state);
      });

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create peer connection';
      setError(errorMsg);
      console.error('Peer creation error:', err);
    }
  }, []);

  const stopStream = useCallback(() => {
    console.log('Stopping stream...');
    
    // Stop peer connection
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    
    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track.kind);
      });
      streamRef.current = null;
    }
    
    setLocalStream(null);
    setIsStreaming(false);
    setIsConnected(false);
    setError(null);
    console.log('Stream stopped');
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