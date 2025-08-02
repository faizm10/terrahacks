"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Square, RotateCcw, Download } from "lucide-react"

export default function CameraInterface() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const startCamera = useCallback(async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user", // Use "environment" for back camera
        },
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsStreaming(true)
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
      setError("Unable to access camera. Please check permissions.")
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
      setIsStreaming(false)
    }
  }, [])

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        // Draw the video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convert to data URL
        const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9)
        setCapturedImage(imageDataUrl)
      }
    }
  }, [])

  const downloadImage = useCallback(() => {
    if (capturedImage) {
      const link = document.createElement("a")
      link.download = `photo-${Date.now()}.jpg`
      link.href = capturedImage
      link.click()
    }
  }, [capturedImage])

  const retakePhoto = useCallback(() => {
    setCapturedImage(null)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="space-y-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              {!capturedImage ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              ) : (
                <img
                  src={capturedImage || "/placeholder.svg"}
                  alt="Captured photo"
                  className="w-full h-full object-cover"
                />
              )}

              {!isStreaming && !capturedImage && (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <div className="text-center">
                    <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Camera not active</p>
                  </div>
                </div>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <div className="flex flex-wrap gap-2 justify-center">
              {!isStreaming && !capturedImage && (
                <Button onClick={startCamera} className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Start Camera
                </Button>
              )}

              {isStreaming && !capturedImage && (
                <>
                  <Button onClick={capturePhoto} className="flex items-center gap-2">
                    <Square className="w-4 h-4" />
                    Capture Photo
                  </Button>
                  <Button onClick={stopCamera} variant="outline" className="flex items-center gap-2 bg-transparent">
                    <Square className="w-4 h-4" />
                    Stop Camera
                  </Button>
                </>
              )}

              {capturedImage && (
                <>
                  <Button onClick={retakePhoto} variant="outline" className="flex items-center gap-2 bg-transparent">
                    <RotateCcw className="w-4 h-4" />
                    Retake
                  </Button>
                  <Button onClick={downloadImage} className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                  <Button onClick={startCamera} variant="outline" className="flex items-center gap-2 bg-transparent">
                    <Camera className="w-4 h-4" />
                    Take Another
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
