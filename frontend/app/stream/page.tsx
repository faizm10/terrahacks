"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  VideoIcon,
  WifiIcon,
  XCircleIcon,
  InfoIcon,
  MicIcon,
  MessageSquareIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useWebRTC } from "../../hooks/useWebRTC";
import { useWebSocket } from "../../hooks/useWebSocket";

export default function TestStreamPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  const {
    isConnected: isWebRTCConnected,
    isStreaming: isWebRTCStreaming,
    localStream,
    error: webrtcError,
    startStream,
    stopStream,
    connectToPeer,
  } = useWebRTC();

  const {
    isConnected: isWebSocketConnected,
    isStreaming: isWebSocketStreaming,
    transcript,
    error: websocketError,
    connect: connectWebSocket,
    disconnect: disconnectWebSocket,
    sendAudioData,
    sendVideoData,
    requestTranscription,
  } = useWebSocket();

  // Set video source when stream becomes available
  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Start WebSocket connection when WebRTC connects
  useEffect(() => {
    if (isWebRTCConnected && !isWebSocketConnected) {
      connectWebSocket();
    }
  }, [isWebRTCConnected, isWebSocketConnected, connectWebSocket]);

  const startRecording = () => {
    if (!localStream) return;

    const audioTrack = localStream.getAudioTracks()[0];
    if (!audioTrack) return;

    const audioStream = new MediaStream([audioTrack]);
    const mediaRecorder = new MediaRecorder(audioStream);
    mediaRecorderRef.current = mediaRecorder;

    const chunks: Blob[] = [];
    setAudioChunks(chunks);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
        setAudioChunks([...chunks]);
      }
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(chunks, { type: 'audio/wav' });
      await requestTranscription(audioBlob);
    };

    mediaRecorder.start(1000); // Collect data every second
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleStartStream = async () => {
    await startStream();
  };

  const handleStopStream = () => {
    stopStream();
    disconnectWebSocket();
  };

  const error = webrtcError || websocketError;

  return (
    <div className="min-h-screen bg-[var(--color-primary-background)] text-[var(--color-text-primary)] font-[var(--font-body)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="relative mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="absolute left-0 top-1/2 -translate-y-1/2 text-[var(--color-text-primary)] hover:bg-gray-200"
            aria-label="Go back"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </Button>
          <h1 className="text-4xl sm:text-5xl font-bold text-center text-[var(--color-text-primary)] font-[var(--font-headline)]">
            MediAI - Real-time Health Consultation
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video Preview */}
          <Card className="bg-white shadow-card rounded-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                <VideoIcon className="h-6 w-6 text-[var(--color-accent)]" />
                Live Video Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video border border-gray-200">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!localStream && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white text-lg">
                    <p>No video stream available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Transcription Panel */}
          <Card className="bg-white shadow-card rounded-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                <MessageSquareIcon className="h-6 w-6 text-[var(--color-accent)]" />
                Live Transcription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  value={transcript}
                  placeholder="Transcription will appear here..."
                  className="min-h-[200px] resize-none"
                  readOnly
                />
                <div className="flex gap-2">
                  <Button
                    onClick={startRecording}
                    disabled={!isWebSocketConnected || isRecording}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <MicIcon className="h-4 w-4 mr-2" />
                    Start Recording
                  </Button>
                  <Button
                    onClick={stopRecording}
                    disabled={!isRecording}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    Stop Recording
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="mb-6 bg-white shadow-card rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-[var(--color-text-primary)]">
              Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={handleStartStream}
                disabled={isWebRTCStreaming}
                className="bg-[var(--color-accent)] text-white hover:bg-opacity-90 transition-colors duration-200 rounded-radius-button px-6 py-3 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed"
              >
                {isWebRTCStreaming ? "Camera Active" : "Start Camera & Mic"}
              </Button>
              <Button
                onClick={connectToPeer}
                disabled={!isWebRTCStreaming || isWebRTCConnected}
                className="bg-green-600 text-white hover:bg-green-700 transition-colors duration-200 rounded-radius-button px-6 py-3 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed"
              >
                {isWebRTCConnected ? "Connected to Backend" : "Connect to Backend"}
              </Button>
              <Button
                onClick={handleStopStream}
                disabled={!isWebRTCStreaming}
                className="bg-red-600 text-white hover:bg-red-700 transition-colors duration-200 rounded-radius-button px-6 py-3 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed"
              >
                Stop Stream
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card className="mb-6 bg-white shadow-card rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-[var(--color-text-primary)]">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <VideoIcon className="h-5 w-5 text-[var(--color-accent)]" />
                <span className="font-medium text-[var(--color-text-primary)]">
                  Camera & Microphone:
                </span>
                <Badge
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isWebRTCStreaming
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {isWebRTCStreaming ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <WifiIcon className="h-5 w-5 text-[var(--color-accent)]" />
                <span className="font-medium text-[var(--color-text-primary)]">
                  WebRTC Connection:
                </span>
                <Badge
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isWebRTCConnected
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {isWebRTCConnected ? "Connected" : "Disconnected"}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <MicIcon className="h-5 w-5 text-[var(--color-accent)]" />
                <span className="font-medium text-[var(--color-text-primary)]">
                  WebSocket Connection:
                </span>
                <Badge
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isWebSocketConnected
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {isWebSocketConnected ? "Connected" : "Disconnected"}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <MessageSquareIcon className="h-5 w-5 text-[var(--color-accent)]" />
                <span className="font-medium text-[var(--color-text-primary)]">
                  Recording:
                </span>
                <Badge
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isRecording
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {isRecording ? "Recording" : "Not Recording"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 bg-red-50 border border-red-200 shadow-card rounded-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-red-800 flex items-center gap-2">
                <XCircleIcon className="h-6 w-6 text-red-600" />
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="bg-blue-50 border border-blue-200 shadow-card rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-blue-800 flex items-center gap-2">
              <InfoIcon className="h-6 w-6 text-blue-600" />
              Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="text-blue-700 space-y-2 list-decimal list-inside">
              <li>Click &quot;Start Camera & Mic&quot; to access your webcam and microphone.</li>
              <li>
                Click &quot;Connect to Backend&quot; to establish WebRTC and WebSocket connections.
              </li>
              <li>
                Click &quot;Start Recording&quot; to begin audio transcription.
              </li>
              <li>
                Speak clearly and the transcription will appear in real-time.
              </li>
              <li>
                Click &quot;Stop Recording&quot; to end the current transcription session.
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
