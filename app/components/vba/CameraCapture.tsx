'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Camera, X, RotateCw, Download, Upload, FlipHorizontal, ZoomIn, ZoomOut, Scan } from 'lucide-react'
// QR code scanning can be added later with @zxing/library

interface CameraCaptureProps {
  onCapture: (imageData: string, metadata?: any) => void
  onClose: () => void
  mode?: 'photo' | 'qr' | 'ar'
  projectId?: string
}

export default function CameraCapture({ onCapture, onClose, mode = 'photo', projectId }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [zoom, setZoom] = useState(1)
  const [flash, setFlash] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [qrResult, setQrResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [deviceCapabilities, setDeviceCapabilities] = useState<any>(null)

  // Initialize camera
  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [facingMode])

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        
        // Get device capabilities
        const track = mediaStream.getVideoTracks()[0]
        const capabilities = track.getCapabilities()
        setDeviceCapabilities(capabilities)
        
        // Apply zoom if supported
        if ('zoom' in capabilities) {
          try {
            // Use any type to bypass TypeScript's incomplete MediaTrackConstraints type
            const constraintsWithZoom: any = {
              ...track.getConstraints(),
              zoom: zoom
            }
            track.applyConstraints(constraintsWithZoom)
          } catch (error) {
            console.log('Zoom not supported on this device')
          }
        }
      }

      // Start QR scanning if in QR mode
      if (mode === 'qr') {
        startQRScanning()
      }
    } catch (err) {
      setError('Unable to access camera. Please ensure camera permissions are granted.')
      console.error('Camera error:', err)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    
    if (!context) return

    // Set canvas dimensions to video dimensions
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0)
    
    // Get image data
    const imageData = canvas.toDataURL('image/jpeg', 0.9)
    setCapturedImage(imageData)
    
    // Add metadata
    const metadata: any = {
      timestamp: new Date().toISOString(),
      projectId,
      location: null, // Will be added with geolocation
      deviceInfo: {
        facingMode,
        zoom,
        flash,
        resolution: `${canvas.width}x${canvas.height}`
      }
    }
    
    // Get geolocation if available
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          metadata.location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          }
          onCapture(imageData, metadata)
        },
        () => {
          // Proceed without location
          onCapture(imageData, metadata)
        }
      )
    } else {
      onCapture(imageData, metadata)
    }
  }

  const startQRScanning = async () => {
    if (!videoRef.current) return
    
    setScanning(true)
    // QR code scanning functionality would go here
    // Requires @zxing/library to be installed
    setTimeout(() => {
      setScanning(false)
      alert('QR code scanning requires additional libraries to be installed')
    }, 1000)
  }

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }

  const handleZoom = (direction: 'in' | 'out') => {
    if (!deviceCapabilities?.zoom) return
    
    const { min, max, step } = deviceCapabilities.zoom
    const newZoom = direction === 'in' 
      ? Math.min(zoom + step, max)
      : Math.max(zoom - step, min)
    
    setZoom(newZoom)
    
    if (stream) {
      const track = stream.getVideoTracks()[0]
      try {
        // Use any type to bypass TypeScript's incomplete MediaTrackConstraints type
        const constraintsWithZoom: any = { zoom: newZoom }
        track.applyConstraints(constraintsWithZoom)
      } catch (error) {
        console.log('Zoom adjustment not supported')
      }
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const imageData = e.target?.result as string
      setCapturedImage(imageData)
      onCapture(imageData, {
        timestamp: new Date().toISOString(),
        projectId,
        source: 'upload',
        fileName: file.name,
        fileSize: file.size
      })
    }
    reader.readAsDataURL(file)
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    setQrResult(null)
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-black bg-opacity-50 p-4 flex items-center justify-between text-white">
        <h3 className="text-lg font-semibold">
          {mode === 'photo' && 'Capture Photo'}
          {mode === 'qr' && 'Scan QR Code'}
          {mode === 'ar' && 'AR Measurement'}
        </h3>
        <button onClick={onClose} className="p-2">
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden">
        {error ? (
          <div className="flex items-center justify-center h-full text-white p-4 text-center">
            <div>
              <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{error}</p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Upload Photo Instead
              </button>
            </div>
          </div>
        ) : (
          <>
            {!capturedImage ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* QR Scanner Overlay */}
                {mode === 'qr' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 border-2 border-white rounded-lg relative">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-yellow-400 rounded-tl-lg"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-yellow-400 rounded-tr-lg"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-yellow-400 rounded-bl-lg"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-yellow-400 rounded-br-lg"></div>
                      {scanning && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-black bg-opacity-50 px-3 py-1 rounded">
                            <p className="text-white text-sm">Scanning...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* AR Measurement Overlay */}
                {mode === 'ar' && (
                  <div className="absolute inset-0 pointer-events-none">
                    <svg className="w-full h-full">
                      <line x1="50%" y1="0" x2="50%" y2="100%" stroke="yellow" strokeWidth="2" opacity="0.5" />
                      <line x1="0" y1="50%" x2="100%" y2="50%" stroke="yellow" strokeWidth="2" opacity="0.5" />
                    </svg>
                    <div className="absolute top-4 left-4 bg-black bg-opacity-50 px-3 py-2 rounded">
                      <p className="text-white text-sm">Tap to measure</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <img 
                src={capturedImage} 
                alt="Captured" 
                className="w-full h-full object-contain"
              />
            )}
          </>
        )}
        
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* QR Result */}
      {qrResult && (
        <div className="absolute top-20 left-4 right-4 bg-white rounded-lg p-4 shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">QR Code Detected</p>
          <p className="text-sm text-gray-600 break-all">{qrResult}</p>
        </div>
      )}

      {/* Controls */}
      <div className="bg-black bg-opacity-50 p-4">
        {!capturedImage ? (
          <div className="flex items-center justify-around">
            {/* Upload button */}
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-white"
            >
              <Upload className="h-6 w-6" />
            </button>

            {/* Zoom controls */}
            {deviceCapabilities?.zoom && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleZoom('out')}
                  className="p-2 text-white"
                >
                  <ZoomOut className="h-5 w-5" />
                </button>
                <span className="text-white text-sm">{zoom.toFixed(1)}x</span>
                <button 
                  onClick={() => handleZoom('in')}
                  className="p-2 text-white"
                >
                  <ZoomIn className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Capture button */}
            {mode === 'photo' && (
              <button 
                onClick={capturePhoto}
                className="p-4 bg-white rounded-full"
              >
                <div className="w-12 h-12 bg-red-500 rounded-full"></div>
              </button>
            )}

            {/* Camera toggle */}
            <button 
              onClick={toggleCamera}
              className="p-3 text-white"
            >
              <RotateCw className="h-6 w-6" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-around">
            <button 
              onClick={retakePhoto}
              className="px-6 py-2 text-white"
            >
              Retake
            </button>
            <button 
              onClick={() => onCapture(capturedImage, {})}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg"
            >
              Use Photo
            </button>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  )
}