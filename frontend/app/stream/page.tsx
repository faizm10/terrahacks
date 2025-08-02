'use client';

import { useEffect, useRef } from 'react';
import { useWebRTC } from '../../hooks/useWebRTC';
import { useTranscript } from '../../hooks/useTranscript';

export default function TestStreamPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const {
    isConnected,
    isStreaming,
    localStream,
    error,
    startStream,
    stopStream,
    connectToPeer: connectToOpenAI,
  } = useWebRTC();
  
  const {
    transcripts,
    isConnected: isTranscriptConnected,
    connect: connectTranscript,
    disconnect: disconnectTranscript,
  } = useTranscript();

  // Set video source when stream becomes available
  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);
  
  // Auto-scroll transcript to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);
  
  // Connect transcript WebSocket when peer connection is established
  useEffect(() => {
    if (isConnected && !isTranscriptConnected) {
      connectTranscript('default');
    }
  }, [isConnected, isTranscriptConnected, connectTranscript]);
  
  
  const handleStopStream = () => {
    disconnectTranscript();
    stopStream();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">WebRTC Video & Audio Stream with AI Conversation</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Video and Controls */}
          <div>
            {/* Video Preview */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Video & Audio Stream</h2>
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!localStream && (
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <p>No video stream</p>
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Controls</h2>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={startStream}
                  disabled={isStreaming}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isStreaming ? 'Camera & Mic Active' : 'Start Camera & Mic'}
                </button>
                
                <button
                  onClick={connectToOpenAI}
                  disabled={!isStreaming || isConnected}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isConnected ? 'Connected to OpenAI' : 'Connect to OpenAI'}
                </button>
                
                <button
                  onClick={handleStopStream}
                  disabled={!isStreaming}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Stop Stream
                </button>
                
              </div>
            </div>

            {/* Status */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Status</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Camera & Mic:</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    isStreaming ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {isStreaming ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-medium">AI Connection:</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    isConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-medium">Transcript Stream:</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    isTranscriptConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {isTranscriptConnected ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Transcript */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-6 h-[600px] flex flex-col">
              <h2 className="text-xl font-semibold mb-4">AI Conversation Transcript</h2>
              
              {/* Transcript Area */}
              <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4 mb-4">
                {transcripts.length === 0 ? (
                  <p className="text-gray-500 text-center">No conversation yet. Connect to start talking with AI.</p>
                ) : (
                  <div className="space-y-3">
                    {transcripts.map((transcript) => (
                      <div
                        key={transcript.id}
                        className={`p-3 rounded-lg ${
                          transcript.role === 'user'
                            ? 'bg-blue-100 ml-auto max-w-[80%]'
                            : 'bg-green-100 mr-auto max-w-[80%]'
                        }`}
                      >
                        <div className="font-semibold text-sm mb-1">
                          {transcript.role === 'user' ? 'You' : 'AI Assistant'}
                        </div>
                        <div className="text-gray-800">{transcript.content}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(transcript.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                    <div ref={transcriptEndRef} />
                  </div>
                )}
              </div>
              
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                <h4 className="text-blue-800 font-semibold mb-1">How it works:</h4>
                <ol className="text-blue-700 space-y-0.5 text-xs">
                  <li>1. Allow camera & microphone access</li>
                  <li>2. Click "Connect to AI" to start conversation</li>
                  <li>3. Speak naturally - the AI will respond</li>
                  <li>4. Transcripts appear here in real-time</li>
                  <li>5. Export conversation when done</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
            <h3 className="text-red-800 font-semibold mb-2">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}