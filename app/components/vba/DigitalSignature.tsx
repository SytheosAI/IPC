'use client'

import { useState, useRef, useEffect } from 'react'
import { Pen, RotateCcw, Check, X, Download } from 'lucide-react'

interface DigitalSignatureProps {
  onSignature: (signatureData: string, metadata?: any) => void
  onClose?: () => void
  signerName?: string
  documentName?: string
  projectId?: string
}

export default function DigitalSignature({
  onSignature,
  onClose,
  signerName = '',
  documentName = 'Inspection Report',
  projectId
}: DigitalSignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [signatureData, setSignatureData] = useState<string | null>(null)
  const [name, setName] = useState(signerName)
  const [date] = useState(new Date())
  const [touchSupported, setTouchSupported] = useState(false)

  useEffect(() => {
    // Check for touch support
    setTouchSupported('ontouchstart' in window)
    
    // Set up canvas
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
        ctx.strokeStyle = '#1e3a8a'
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
      }
    }

    // Prevent scrolling when drawing
    const preventScroll = (e: TouchEvent) => {
      if (isDrawing) {
        e.preventDefault()
      }
    }

    document.addEventListener('touchmove', preventScroll, { passive: false })
    return () => {
      document.removeEventListener('touchmove', preventScroll)
    }
  }, [isDrawing])

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      }
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    }
  }

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    setIsDrawing(true)
    setHasSignature(true)
    
    const { x, y } = getCoordinates(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return

    const { x, y } = getCoordinates(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (!isDrawing) return
    
    setIsDrawing(false)
    
    // Save signature data
    const canvas = canvasRef.current
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png')
      setSignatureData(dataUrl)
    }
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
    setSignatureData(null)
  }

  const handleAccept = () => {
    if (!signatureData || !name) return

    const metadata = {
      signerName: name,
      signedAt: date.toISOString(),
      documentName,
      projectId,
      ipAddress: 'Hidden for privacy',
      userAgent: navigator.userAgent,
      signatureHash: btoa(signatureData).substring(0, 32) // Simple hash for verification
    }

    // Save to localStorage
    const signatures = JSON.parse(
      localStorage.getItem(`vba-signatures-${projectId}`) || '[]'
    )
    signatures.push({
      ...metadata,
      thumbnail: signatureData.substring(0, 100) + '...' // Store partial data as thumbnail
    })
    localStorage.setItem(`vba-signatures-${projectId}`, JSON.stringify(signatures))

    onSignature(signatureData, metadata)
  }

  const downloadSignature = () => {
    if (!signatureData) return

    const link = document.createElement('a')
    link.download = `signature-${date.getTime()}.png`
    link.href = signatureData
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Digital Signature</h3>
            {onClose && (
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Sign below to confirm {documentName}
          </p>
        </div>

        {/* Signature Pad */}
        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Signature
            </label>
            <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50">
              <canvas
                ref={canvasRef}
                className="w-full h-48 cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                style={{ touchAction: 'none' }}
              />
              
              {!hasSignature && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <Pen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      {touchSupported ? 'Draw your signature' : 'Sign here'}
                    </p>
                  </div>
                </div>
              )}

              {/* Signature line */}
              <div className="absolute bottom-8 left-8 right-8 border-b-2 border-gray-400 border-dashed"></div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <button
                onClick={clearSignature}
                className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
                disabled={!hasSignature}
              >
                <RotateCcw className="h-4 w-4" />
                Clear
              </button>
              
              {signatureData && (
                <button
                  onClick={downloadSignature}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              )}
            </div>
          </div>

          {/* Date and Time */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Date & Time: <span className="font-medium text-gray-900">
                {date.toLocaleString()}
              </span>
            </p>
          </div>

          {/* Legal Text */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800">
              By signing above, I certify that the information provided is accurate 
              and complete. This electronic signature is legally binding and equivalent 
              to a handwritten signature.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-end gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleAccept}
            disabled={!hasSignature || !name}
            className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 ${
              hasSignature && name
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Check className="h-5 w-5" />
            Accept & Sign
          </button>
        </div>
      </div>
    </div>
  )
}