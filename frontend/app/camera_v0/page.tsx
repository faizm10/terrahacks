"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-2xl space-y-8">
          {/* Centered Header */}
          <div className="text-center">
            <h1 className="text-4xl font-light text-gray-800 tracking-wide">CareLens</h1>
            <p className="text-gray-600 mt-2 font-light">Professional Camera Interface</p>
          </div>

          {/* Main Camera Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-8 space-y-6">
              {error && (
                <div className="bg-red-50/80 border border-red-100 text-red-700 px-4 py-3 rounded-lg text-sm font-light">
                  {error}
                </div>
              )}

              <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video shadow-inner">
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
                      <Camera className="w-12 h-12 mx-auto mb-3 opacity-40" />
                      <p className="text-sm font-light opacity-60">Camera Ready</p>
                    </div>
                  </div>
                )}
              </div>

              <canvas ref={canvasRef} className="hidden" />

              <div className="flex flex-wrap gap-3 justify-center">
                {!isStreaming && !capturedImage && (
                  <Button
                    onClick={startCamera}
                    className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-light transition-all duration-200"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Start Camera
                  </Button>
                )}

                {isStreaming && !capturedImage && (
                  <>
                    <Button
                      onClick={capturePhoto}
                      className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-light transition-all duration-200"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Capture
                    </Button>
                    <Button
                      onClick={stopCamera}
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-lg font-light transition-all duration-200 bg-transparent"
                    >
                      Stop
                    </Button>
                  </>
                )}

                {capturedImage && (
                  <>
                    <Button
                      onClick={retakePhoto}
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-lg font-light transition-all duration-200 bg-transparent"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Retake
                    </Button>
                    <Button
                      onClick={downloadImage}
                      className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-light transition-all duration-200"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      onClick={startCamera}
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-lg font-light transition-all duration-200 bg-transparent"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      New Photo
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
