"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useWebRTC } from "../../hooks/useWebRTC";
import { useTranscript } from "../../hooks/useTranscript";
import { supabase } from "@/lib/supabase/client"
import {
  Mic,
  Video,
  MessageSquare,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

export default function TestStreamPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { isConnected, localStream, error, connect, disconnect } = useWebRTC();
  const {
    transcripts,
    isConnected: isTranscriptConnected,
    connect: connectTranscript,
    disconnect: disconnectTranscript,
  } = useTranscript();

  // Recording state
  const mediaRecorderRef = useRef<MediaRecorder>();
  const recordedChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  // Initialize MediaRecorder when stream is ready
  useEffect(() => {
    if (localStream) {
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";
      const recorder = new MediaRecorder(localStream, { mimeType });

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) recordedChunksRef.current.push(ev.data);
      };
      recorder.onstop = () => setIsRecording(false);

      mediaRecorderRef.current = recorder;
    }
  }, [localStream]);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcripts]);

  // Connect transcript WebSocket once peer is up
  useEffect(() => {
    if (isConnected && !isTranscriptConnected) {
      connectTranscript("default");
    }
  }, [isConnected, isTranscriptConnected, connectTranscript]);

  // Start WebRTC + recording
  const handleStart = async () => {
    await connect();
    if (mediaRecorderRef.current?.state === "inactive") {
      recordedChunksRef.current = [];
      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
    }
  };

  // Stop everything
  const handleDisconnect = () => {
    disconnectTranscript();
    disconnect();
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  // Finish conversation, upload video, then navigate
  const handleFinishConversation = async () => {
    try {
      setIsFinishing(true);
      console.log("🏁 Finishing conversation...");

      // 1) stop streams & recorder
      disconnectTranscript();
      disconnect();
      if (mediaRecorderRef.current?.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }

      // 2) call finish endpoint
      const fin = await fetch(
        "http://localhost:8000/api/stream/finish/default",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!fin.ok) throw new Error(`Failed to finish: ${fin.status}`);
      const result = await fin.json();
      console.log("✅ Conversation finished:", result);

      // 3) assemble video blob
      const blob = new Blob(recordedChunksRef.current, {
        type: recordedChunksRef.current[0]?.type,
      });
      const filename = `user-${Date.now()}.webm`;

      // 4) upload to Supabase
      const { error: uploadError } = await supabase.storage
        .from("videos")
        .upload(filename, blob, {
          cacheControl: "3600",
          upsert: false,
          contentType: blob.type,
        });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
      } else {
        console.log("🎥 Video uploaded:", filename);
      }

      // 5) navigate to results
      router.push(`/results/default`);
    } catch (err) {
      console.error("❌ Error finishing conversation:", err);
      setIsFinishing(false);
    }
  };

  // Set video element src
  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  return (
    <div className="min-h-screen bg-primary-background">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
          <h1 className="text-2xl font-bold text-text-primary text-center">
            Live Medical Consultation
          </h1>
        </div>

        {/* Status Bar */}
        <div className="flex-shrink-0 p-3 bg-white/60 backdrop-blur-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  localStream ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-sm text-text-secondary">Media</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-sm text-text-secondary">AI</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isTranscriptConnected ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-sm text-text-secondary">Transcript</span>
            </div>
            <div className="text-sm text-text-secondary">
              Status:{" "}
              <span
                className={
                  isConnected
                    ? "text-green-600 font-medium"
                    : "text-red-600 font-medium"
                }
              >
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 flex">
          {/* Video */}
          <div className="flex-1 p-4">
            <div className="h-full bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Video className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-text-primary">
                  Live Video
                </span>
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

          {/* Conversation */}
          <div className="flex-1 p-4">
            <div className="h-full bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-text-primary">
                  Live Conversation
                </span>
              </div>
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
                    {transcripts.map((t) => (
                      <div
                        key={t.id}
                        className={`p-2 rounded-lg max-w-[90%] text-sm ${
                          t.role === "user"
                            ? "bg-accent text-white ml-auto"
                            : "bg-green-500 text-white mr-auto"
                        }`}
                      >
                        <div className="font-medium text-xs mb-1 opacity-90">
                          {t.role === "user" ? "You" : "AI"}
                        </div>
                        <div className="leading-relaxed">{t.content}</div>
                        <div className="text-xs opacity-70 mt-1">
                          {new Date(t.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                    <div ref={transcriptEndRef} />
                  </div>
                )}
              </div>
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-2">
                <div className="text-xs text-accent font-medium mb-1">
                  How it works:
                </div>
                <div className="text-xs text-accent/80 space-y-0.5">
                  <div>1. Start consultation</div>
                  <div>2. Allow camera & mic access</div>
                  <div>3. Speak naturally with AI</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-shrink-0 p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
            <button
              onClick={handleStart}
              disabled={isConnected || isRecording}
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

            <button
              onClick={handleFinishConversation}
              disabled={!isConnected || transcripts.length === 0 || isFinishing}
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
              disabled={!isConnected}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <XCircle className="w-4 h-4" />
              <span className="font-medium">Disconnect</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2 flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Error
          </h3>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
