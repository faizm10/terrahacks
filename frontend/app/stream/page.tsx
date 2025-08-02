'use client';

import { useEffect, useRef } from 'react';
import { useWebRTC } from '../../hooks/useWebRTC';

export default function TestStreamPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const {
    isConnected,
    isStreaming,
    localStream,
    error,
    startStream,
    stopStream,
    connectToPeer,
  } = useWebRTC();

  // Set video source when stream becomes available
  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">WebRTC Video Stream Test</h1>
        
        {/* Video Preview */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Local Video Preview</h2>
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
              {isStreaming ? 'Camera Active' : 'Start Camera'}
            </button>
            
            <button
              onClick={connectToPeer}
              disabled={!isStreaming || isConnected}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isConnected ? 'Connected to Backend' : 'Connect to Backend'}
            </button>
            
            <button
              onClick={stopStream}
              disabled={!isStreaming}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Stop Stream
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Camera:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                isStreaming ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {isStreaming ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-medium">Backend Connection:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                isConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-semibold mb-2">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-blue-800 font-semibold mb-2">Instructions</h3>
          <ol className="text-blue-700 space-y-1">
            <li>1. Click &quot;Start Camera&quot; to access your webcam</li>
            <li>2. Click &quot;Connect to Backend&quot; to establish WebRTC connection</li>
            <li>3. Your video stream will be sent to the backend in real-time</li>
            <li>4. Check the backend logs to see received video frames</li>
          </ol>
        </div>
      </div>
    </div>
  );
}