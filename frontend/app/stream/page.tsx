"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useWebRTC } from "../../hooks/useWebRTC";
import { useTranscript } from "../../hooks/useTranscript";
import { useVideoRecording } from "../../hooks/useVideoRecording";
import { Mic, Video, MessageSquare, Zap, CheckCircle, XCircle, Loader2, Brain, Activity, Shield, Circle, Square, Download } from "lucide-react";

export default function TestStreamPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isFinishing, setIsFinishing] = useState(false);
  const [savedVideoUrl, setSavedVideoUrl] = useState<string | null>(null);

  const { isConnected, localStream, error, connect, disconnect } = useWebRTC();

  const {
    transcripts,
    isConnected: isTranscriptConnected,
    connect: connectTranscript,
    disconnect: disconnectTranscript,
  } = useTranscript();

  const {
    isRecording,
    recordingBlob,
    recordingUrl,
    error: recordingError,
    startRecording,
    stopRecording,
    saveToSupabase,
    clearRecording,
  } = useVideoRecording();

  // Set video source when stream becomes available
  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Auto-scroll transcript to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcripts]);

  // Connect transcript WebSocket when peer connection is established
  useEffect(() => {
    if (isConnected && !isTranscriptConnected) {
      connectTranscript("default");
    }
  }, [isConnected, isTranscriptConnected, connectTranscript]);

  const handleDisconnect = () => {
    // Stop recording if active
    if (isRecording) {
      stopRecording();
    }
    disconnectTranscript();
    disconnect();
  };

  const handleStartRecording = async () => {
    if (localStream) {
      await startRecording(localStream);
    }
  };

  const handleStopRecording = async () => {
    await stopRecording();
  };

  const handleSaveRecording = async () => {
    if (recordingBlob) {
      const videoUrl = await saveToSupabase("default");
      if (videoUrl) {
        setSavedVideoUrl(videoUrl);
        console.log("✅ Video saved to Supabase:", videoUrl);
      }
    }
  };

  const handleFinishConversation = async () => {
    try {
      setIsFinishing(true);
      console.log("🏁 Finishing conversation...");

      // Stop recording if active
      if (isRecording) {
        await stopRecording();
      }

      // Save video recording if available
      if (recordingBlob) {
        console.log("💾 Saving video recording...");
        const videoUrl = await saveToSupabase("default");
        if (videoUrl) {
          setSavedVideoUrl(videoUrl);
        }
      }

      // Call the finish endpoint
      const response = await fetch(
        "http://localhost:8000/api/stream/finish/default",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to finish conversation: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Conversation finished:", result);

      // Disconnect WebRTC and transcript connections
      disconnectTranscript();
      disconnect();

      // Navigate to results page
      router.push(`/results/default`);
    } catch (error) {
      console.error("❌ Error finishing conversation:", error);
      setIsFinishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-background">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-text-primary text-center">
              Live Medical Consultation
            </h1>
          </div>
        </div>

        {/* System Status - Always Visible */}
        <div className="flex-shrink-0 p-3 bg-white/60 backdrop-blur-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${localStream ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-text-secondary">Media</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-text-secondary">AI</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isTranscriptConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-text-secondary">Transcript</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : recordingBlob ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-text-secondary">
                {isRecording ? 'Recording' : recordingBlob ? 'Recorded' : 'Video'}
              </span>
            </div>
            <div className="text-sm text-text-secondary">
              Status: <span className={isConnected ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Video Stream */}
          <div className="flex-1 p-4">
            <div className="h-full bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Video className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-text-primary">Live Video</span>
              </div>
              <div className="flex-1 relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!localStream && (
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center">
                      <Video className="w-8 h-8 mx-auto mb-2 opacity-60" />
                      <p className="text-sm">Camera access required</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Live Conversation */}
          <div className="flex-1 p-4">
            <div className="h-full bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-text-primary">Live Conversation</span>
              </div>
              
              {/* Transcript Area */}
              <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-3 mb-3">
                {transcripts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageSquare className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-text-secondary text-sm">
                      No conversation yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {transcripts.map((transcript) => (
                      <div
                        key={transcript.id}
                        className={`p-2 rounded-lg max-w-[90%] text-sm ${
                          transcript.role === "user"
                            ? "bg-accent text-white ml-auto"
                            : "bg-green-500 text-white mr-auto"
                        }`}
                      >
                        <div className="font-medium text-xs mb-1 opacity-90">
                          {transcript.role === "user" ? "You" : "AI"}
                        </div>
                        <div className="leading-relaxed">
                          {transcript.content}
                        </div>
                        <div className="text-xs opacity-70 mt-1">
                          {new Date(transcript.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                    <div ref={transcriptEndRef} />
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-2">
                <div className="text-xs text-accent font-medium mb-1">How it works:</div>
                <div className="text-xs text-accent/80 space-y-0.5">
                  <div>1. Start consultation</div>
                  <div>2. Allow camera & mic access</div>
                  <div>3. Speak naturally with AI</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Session Controls - Always Visible */}
        <div className="flex-shrink-0 p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={connect}
                disabled={isConnected || isFinishing}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isConnected ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Connected</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span className="font-medium">Start Consultation</span>
                  </>
                )}
              </button>

              {/* Recording Controls */}
              {isConnected && (
                <>
                  <button
                    onClick={handleStartRecording}
                    disabled={isRecording || isFinishing}
                    className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <Circle className="w-4 h-4" />
                    <span className="font-medium">Start Recording</span>
                  </button>

                  <button
                    onClick={handleStopRecording}
                    disabled={!isRecording || isFinishing}
                    className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <Square className="w-4 h-4" />
                    <span className="font-medium">Stop Recording</span>
                  </button>

                  {recordingBlob && !isRecording && (
                    <button
                      onClick={handleSaveRecording}
                      disabled={isFinishing}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span className="font-medium">Save Video</span>
                    </button>
                  )}
                </>
              )}

              <button
                onClick={handleFinishConversation}
                disabled={
                  !isConnected || isFinishing || transcripts.length === 0
                }
                className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isFinishing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="font-medium">Analyzing...</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4" />
                    <span className="font-medium">Finish & Analyze</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDisconnect}
                disabled={!isConnected || isFinishing}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <XCircle className="w-4 h-4" />
                <span className="font-medium">Disconnect</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {(error || recordingError) && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2 flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Error
          </h3>
          <p className="text-red-700 text-sm">{error || recordingError}</p>
        </div>
      )}

      {/* Success Message */}
      {savedVideoUrl && (
        <div className="fixed bottom-4 left-4 bg-green-50 border border-green-200 rounded-lg p-4 max-w-md">
          <h3 className="text-green-800 font-semibold mb-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Video Saved
          </h3>
          <p className="text-green-700 text-sm">
            Video recording has been saved to Supabase storage.
          </p>
          <a
            href={savedVideoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 text-sm underline mt-2 inline-block"
          >
            View Video
          </a>
        </div>
      )}
    </div>
  );
}
