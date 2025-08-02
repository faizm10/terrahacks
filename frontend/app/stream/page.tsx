"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  VideoIcon,
  WifiIcon,
  XCircleIcon,
  InfoIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWebRTC } from "../../hooks/useWebRTC"; // Assuming this hook is in the root hooks folder

export default function TestStreamPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
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
    <div className="min-h-screen bg-[var(--color-primary-background)] text-[var(--color-text-primary)] font-[var(--font-body)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
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
            WebRTC Video Stream Test
          </h1>
        </div>

        {/* Video Preview */}
        <Card className="mb-6 bg-white shadow-card rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
              <VideoIcon className="h-6 w-6 text-[var(--color-accent)]" />
              Local Video Preview
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
                onClick={startStream}
                disabled={isStreaming}
                className="bg-[var(--color-accent)] text-white hover:bg-opacity-90 transition-colors duration-200 rounded-radius-button px-6 py-3 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed"
              >
                {isStreaming ? "Camera Active" : "Start Camera"}
              </Button>
              <Button
                onClick={connectToPeer}
                disabled={!isStreaming || isConnected}
                className="bg-green-600 text-white hover:bg-green-700 transition-colors duration-200 rounded-radius-button px-6 py-3 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed"
              >
                {isConnected ? "Connected to Backend" : "Connect to Backend"}
              </Button>
              <Button
                onClick={stopStream}
                disabled={!isStreaming}
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
                  Camera:
                </span>
                <Badge
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isStreaming
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {isStreaming ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <WifiIcon className="h-5 w-5 text-[var(--color-accent)]" />
                <span className="font-medium text-[var(--color-text-primary)]">
                  Backend Connection:
                </span>
                <Badge
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isConnected
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {isConnected ? "Connected" : "Disconnected"}
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
              <li>Click &quot;Start Camera&quot; to access your webcam.</li>
              <li>
                Click &quot;Connect to Backend&quot; to establish WebRTC
                connection.
              </li>
              <li>
                Your video stream will be sent to the backend in real-time.
              </li>
              <li>Check the backend logs to see received video frames.</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
