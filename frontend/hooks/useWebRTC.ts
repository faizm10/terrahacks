'use client';

import { useState, useRef, useCallback } from 'react';

interface UseWebRTCReturn {
  isConnected: boolean;
  localStream: MediaStream | null;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  setMicrophoneEnabled: (enabled: boolean) => void;
}

export const useWebRTC = (): UseWebRTCReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up WebRTC resources...');
    
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
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    setLocalStream(null);
    setIsConnected(false);
    setError(null);
  }, [localStream]);

  const connect = useCallback(async () => {
    try {
      setError(null);
      console.log('🚀 Starting WebRTC connection with OpenAI...');
      
      // Step 1: Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setLocalStream(stream);
      console.log('✅ Media stream started');
      
      // Step 2: Get ephemeral session from backend
      console.log('🔑 Getting ephemeral session...');
      const sessionResponse = await fetch('http://localhost:8000/api/stream/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: 'default' }),
      });

      if (!sessionResponse.ok) {
        throw new Error(`Session creation failed: ${sessionResponse.status}`);
      }

      const sessionData = await sessionResponse.json();
      console.log('✅ Ephemeral session created:', sessionData.openai_session_id);

      // Step 3: Create RTCPeerConnection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      peerRef.current = pc;

      // Step 4: Set up audio element for AI responses
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

      // Step 5: Add local audio track
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        pc.addTrack(audioTrack, stream);
        console.log('🎤 Added local audio track to peer connection');
      }

      // Step 6: Set up data channel for transcript events
      const dataChannel = pc.createDataChannel('oai-events');
      dataChannelRef.current = dataChannel;

      dataChannel.onopen = () => console.log('📡 Data channel opened');

      dataChannel.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📝 Received OpenAI event:', data.type);
          
          // Forward transcript events to backend
          if (data.type === 'conversation.item.input_audio_transcription.completed' ||
              data.type === 'response.audio_transcript.done') {
            
            await fetch('http://localhost:8000/api/stream/transcript', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...data, session_id: 'default' }),
            });
          }
        } catch (error) {
          console.error('❌ Error processing data channel message:', error);
        }
      };

      dataChannel.onerror = (error) => {
        console.error('❌ Data channel error:', error);
      };

      // Step 7: Handle connection state changes
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

      // Step 8: Create offer and exchange SDP
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log('📋 Created WebRTC offer');

      console.log('📡 Sending offer to OpenAI...');
      const webrtcResponse = await fetch('http://localhost:8000/api/stream/webrtc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sdp: offer.sdp, session_id: 'default' }),
      });

      if (!webrtcResponse.ok) {
        throw new Error(`WebRTC setup failed: ${webrtcResponse.status}`);
      }

      const answerSdp = await webrtcResponse.text();
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });
      
      console.log('✅ WebRTC connection setup complete');

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect to OpenAI';
      setError(`Connection error: ${errorMsg}`);
      console.error('❌ Connection error:', err);
      cleanup();
    }
  }, [cleanup]);

  const disconnect = useCallback(() => {
    console.log('🛑 Disconnecting WebRTC...');
    cleanup();
    console.log('✅ WebRTC disconnected');
  }, [cleanup]);

  const setMicrophoneEnabled = useCallback((enabled: boolean) => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = enabled;
      });
      console.log(`🎤 Microphone ${enabled ? 'enabled' : 'disabled'}`);
    }
  }, [localStream]);

  return {
    isConnected,
    localStream,
    error,
    connect,
    disconnect,
    setMicrophoneEnabled,
  };
};