"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useWebRTC } from "../../hooks/useWebRTC";
import { useTranscript } from "../../hooks/useTranscript";
import { Mic, Video, MessageSquare, Zap, CheckCircle, XCircle, Loader2, Brain, Activity, Shield } from "lucide-react";

export default function TestStreamPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isFinishing, setIsFinishing] = useState(false);
  const [isPressToSpeak, setIsPressToSpeak] = useState(false);

  const { isConnected, localStream, error, connect, disconnect, setMicrophoneEnabled } = useWebRTC();

  // Handle press to speak functionality
  const handlePressToSpeakStart = () => {
    setIsPressToSpeak(true);
    setMicrophoneEnabled(true);
  };

  const handlePressToSpeakEnd = () => {
    setIsPressToSpeak(false);
    setMicrophoneEnabled(false);
  };

  // Disable microphone by default when connected
  useEffect(() => {
    if (isConnected && localStream) {
      setMicrophoneEnabled(false);
    }
  }, [isConnected, localStream, setMicrophoneEnabled]);

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
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcripts]);

  // Connect transcript WebSocket when peer connection is established
  useEffect(() => {
    if (isConnected && !isTranscriptConnected) {
      connectTranscript("default");
    }
  }, [isConnected, isTranscriptConnected, connectTranscript]);

  const handleDisconnect = () => {
    disconnectTranscript();
    disconnect();
  };

  const handleFinishConversation = async () => {
    try {
      setIsFinishing(true);
      console.log("🏁 Finishing conversation...");

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
    <div className="min-h-screen bg-white">
      {/* Floating Status Indicators */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
        <div className="px-3 py-1.5 rounded-full text-xs font-medium shadow-sm bg-gray-100 text-gray-600">
          <div className={`inline-block w-2 h-2 rounded-full mr-2 ${
            localStream ? 'bg-green-400' : 'bg-gray-400'
          }`}></div>
          Media
        </div>
        <div className="px-3 py-1.5 rounded-full text-xs font-medium shadow-sm bg-gray-100 text-gray-600">
          <div className={`inline-block w-2 h-2 rounded-full mr-2 ${
            isConnected ? 'bg-blue-400' : 'bg-gray-400'
          }`}></div>
          AI
        </div>
        <div className="px-3 py-1.5 rounded-full text-xs font-medium shadow-sm bg-gray-100 text-gray-600">
          <div className={`inline-block w-2 h-2 rounded-full mr-2 ${
            isTranscriptConnected ? 'bg-amber-400' : 'bg-gray-400'
          }`}></div>
          Transcript
        </div>
      </div>

      {/* Header with floating style */}
      <div className="pt-8 pb-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Live Medical Consultation
          </h1>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-280px)]">
          
          {/* Video Section */}
          <div className="relative">
            {/* Floating decorative elements */}
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-slate-200 rounded-full opacity-40"></div>
            <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-amber-100 rounded-2xl opacity-40 rotate-12"></div>
            
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-xl ${
                  isConnected ? 'bg-green-100' : 'bg-slate-100'
                }`}>
                  <Video className={`w-5 h-5 ${
                    isConnected ? 'text-green-600' : 'text-slate-600'
                  }`} />
                </div>
                <span className="font-semibold text-gray-900">Live Video</span>
              </div>
              
              <div className="relative bg-gray-900 rounded-2xl overflow-hidden h-[calc(100%-80px)] shadow-inner">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!localStream && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm inline-block mb-4">
                        <Video className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-medium">Camera access required</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Conversation Section */}
          <div className="relative">
            {/* Floating decorative elements */}
            <div className="absolute -top-6 -right-4 w-10 h-10 bg-emerald-100 rounded-2xl opacity-40 rotate-45"></div>
            <div className="absolute -bottom-4 -left-6 w-6 h-6 bg-orange-100 rounded-full opacity-40"></div>
            
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                <div className="p-2 bg-emerald-50 rounded-xl">
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="font-semibold text-gray-900">Live Conversation</span>
              </div>
              
              {/* Chat Area */}
              <div className="flex-1 bg-gray-50 rounded-2xl p-4 mb-4">
                {transcripts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="p-4 bg-gray-200 rounded-2xl mb-4">
                      <MessageSquare className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">
                      Ready to start your consultation
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 overflow-y-scroll h-120">
                    {transcripts.map((transcript) => (
                      <div
                        key={transcript.id}
                        className={`flex ${transcript.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] p-3 rounded-2xl shadow-sm ${
                            transcript.role === "user"
                              ? "bg-slate-600 text-white rounded-br-md"
                              : "bg-white border border-gray-200 text-gray-900 rounded-bl-md"
                          }`}
                        >
                          <div className={`text-xs font-medium mb-1 ${
                            transcript.role === "user" ? "text-slate-200" : "text-gray-500"
                          }`}>
                            {transcript.role === "user" ? "You" : "AI Doctor"}
                          </div>
                          <div className="text-sm leading-relaxed">
                            {transcript.content}
                          </div>
                          <div className={`text-xs mt-1 ${
                            transcript.role === "user" ? "text-slate-300" : "text-gray-400"
                          }`}>
                            {new Date(transcript.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={transcriptEndRef} />
                  </div>
                )}
              </div>

              {/* Instructions Card */}
              <div className="flex-shrink-0 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-800">How it works</span>
                </div>
                <div className="text-xs text-amber-700 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                    Start consultation
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                    Allow camera & mic access
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                    Speak naturally with AI
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action Buttons */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-4 bg-white rounded-full shadow-xl p-3 border border-gray-100">
            <button
              {...(isConnected ? {
                onMouseDown: handlePressToSpeakStart,
                onMouseUp: handlePressToSpeakEnd,
                onMouseLeave: handlePressToSpeakEnd,
                onTouchStart: handlePressToSpeakStart,
                onTouchEnd: handlePressToSpeakEnd
              } : {
                onClick: connect
              })}
              disabled={!isConnected && isFinishing}
              className={`flex items-center gap-3 px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-105 disabled:scale-100 disabled:opacity-50 ${
                isConnected 
                  ? (isPressToSpeak 
                      ? "bg-red-500 text-white shadow-lg shadow-red-200 scale-105" 
                      : "bg-slate-600 text-white hover:bg-slate-700 shadow-md")
                  : "bg-green-500 text-white hover:bg-green-600 shadow-md"
              }`}
            >
              {isConnected ? (
                <>
                  <Mic className={`w-5 h-5 ${isPressToSpeak ? 'animate-pulse' : ''}`} />
                  <span>{isPressToSpeak ? "Speaking..." : "Hold to Speak"}</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  <span>Start Consultation</span>
                </>
              )}
            </button>

            <button
              onClick={handleFinishConversation}
              disabled={!isConnected || isFinishing || transcripts.length === 0}
              className="flex items-center gap-3 px-6 py-3 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:scale-100 shadow-md"
            >
              {isFinishing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Activity className="w-5 h-5" />
                  <span>Finish & Analyze</span>
                </>
              )}
            </button>

            <button
              onClick={handleDisconnect}
              disabled={!isConnected || isFinishing}
              className="flex items-center gap-3 px-6 py-3 bg-gray-500 text-white rounded-full font-semibold hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:scale-100 shadow-md"
            >
              <XCircle className="w-5 h-5" />
              <span>Disconnect</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modern Error Display */}
      {error && (
        <div className="fixed bottom-6 right-6 bg-white border border-red-200 rounded-2xl p-4 max-w-md shadow-xl z-50">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-50 rounded-xl">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Connection Error</h3>
              <p className="text-sm text-gray-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-slate-100 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-amber-100 rounded-full opacity-25 blur-lg"></div>
        <div className="absolute bottom-32 left-32 w-28 h-28 bg-emerald-100 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute bottom-40 right-16 w-20 h-20 bg-orange-100 rounded-full opacity-25 blur-lg"></div>
      </div>
    </div>
  );
}
