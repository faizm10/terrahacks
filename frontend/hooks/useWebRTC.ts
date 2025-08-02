'use client';

import { useState, useRef, useCallback } from 'react';

interface UseWebRTCReturn {
  isConnected: boolean;
  isStreaming: boolean;
  localStream: MediaStream | null;
  error: string | null;
  startStream: () => Promise<void>;
  stopStream: () => void;
  connectToOpenAI: () => Promise<void>;
}

export const useWebRTC = (): UseWebRTCReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const sessionIdRef = useRef<string>('default');

  const startStream = useCallback(async () => {
    try {
      setError(null);
      
      // Get user media (camera and microphone)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      streamRef.current = stream;
      setIsStreaming(true);
      
      console.log('✅ Media stream started');
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to access camera/microphone';
      setError(errorMsg);
      console.error('❌ Error accessing media:', err);
    }
  }, []);

  const connectToOpenAI = useCallback(async () => {
    if (!streamRef.current) {
      setError('No stream available. Start camera/microphone first.');
      return;
    }

    try {
      setError(null);
      console.log('🚀 Starting OpenAI WebRTC connection...');
      
      // Step 1: Get ephemeral key from backend
      console.log('🔑 Getting ephemeral session...');
      const sessionResponse = await fetch('http://localhost:8000/api/stream/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionIdRef.current
        }),
      });

      if (!sessionResponse.ok) {
        throw new Error(`Session creation failed: ${sessionResponse.status}`);
      }

      const sessionData = await sessionResponse.json();
      const ephemeralKey = sessionData.client_secret.value;
      console.log('✅ Ephemeral session created:', sessionData.openai_session_id);

      // Step 2: Create RTCPeerConnection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      });
      peerRef.current = pc;

      // Step 3: Set up audio element for receiving AI responses
      if (!audioElementRef.current) {
        audioElementRef.current = document.createElement('audio');
        audioElementRef.current.autoplay = true;
        document.body.appendChild(audioElementRef.current);
      }

      pc.ontrack = (event) => {
        console.log('🔊 Received audio track from OpenAI');
        if (audioElementRef.current) {
          audioElementRef.current.srcObject = event.streams[0];
        }
      };

      // Step 4: Add local audio track (microphone)
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        pc.addTrack(audioTrack, streamRef.current);
        console.log('🎤 Added local audio track to peer connection');
      }

      // Step 5: Set up data channel for events
      const dataChannel = pc.createDataChannel('oai-events');
      dataChannelRef.current = dataChannel;

      dataChannel.onopen = () => {
        console.log('📡 Data channel opened');
      };

      dataChannel.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📝 Received OpenAI event:', data.type);
          
          // Forward transcript events to backend for storage
          if (data.type === 'conversation.item.input_audio_transcription.completed' ||
              data.type === 'response.audio_transcript.done') {
            
            await fetch('http://localhost:8000/api/stream/transcript', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ...data,
                session_id: sessionIdRef.current
              }),
            });
          }
        } catch (error) {
          console.error('❌ Error processing data channel message:', error);
        }
      };

      dataChannel.onerror = (error) => {
        console.error('❌ Data channel error:', error);
      };

      // Step 6: Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log('🔄 Connection state:', pc.connectionState);
        if (pc.connectionState === 'connected') {
          setIsConnected(true);
          console.log('🎉 WebRTC connection established with OpenAI!');
        } else if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          setIsConnected(false);
          if (pc.connectionState === 'failed') {
            setError('WebRTC connection failed');
          }
        }
      };

      pc.onicecandidategatheringstatechange = () => {
        console.log('🧊 ICE gathering state:', pc.iceGatheringState);
      };

      // Step 7: Create offer and set local description
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log('📋 Created WebRTC offer');

      // Step 8: Send offer to OpenAI via backend
      console.log('📡 Sending offer to OpenAI...');
      const webrtcResponse = await fetch('http://localhost:8000/api/stream/webrtc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sdp: offer.sdp,
          session_id: sessionIdRef.current
        }),
      });

      if (!webrtcResponse.ok) {
        throw new Error(`WebRTC setup failed: ${webrtcResponse.status}`);
      }

      // Step 9: Set remote description with OpenAI's answer
      const answerSdp = await webrtcResponse.text();
      await pc.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp
      });
      
      console.log('✅ WebRTC connection setup complete');

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect to OpenAI';
      setError(`OpenAI connection error: ${errorMsg}`);
      console.error('❌ OpenAI connection error:', err);
      setIsConnected(false);
    }
  }, []);

  const stopStream = useCallback(() => {
    console.log('🛑 Stopping WebRTC connection...');
    
    // Close peer connection
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    
    // Close data channel
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }
    
    // Remove audio element
    if (audioElementRef.current) {
      document.body.removeChild(audioElementRef.current);
      audioElementRef.current = null;
    }
    
    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Disconnect session on backend
    fetch(`http://localhost:8000/api/stream/disconnect/${sessionIdRef.current}`, {
      method: 'DELETE'
    }).catch(console.error);
    
    setLocalStream(null);
    setIsStreaming(false);
    setIsConnected(false);
    setError(null);
    
    console.log('✅ WebRTC connection stopped');
  }, []);

  return {
    isConnected,
    isStreaming,
    localStream,
    error,
    startStream,
    stopStream,
    connectToPeer: connectToOpenAI, // Keep this for backward compatibility
  };
};