'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Square, Play, Pause, Trash2, Download } from 'lucide-react'

interface VoiceDictationProps {
  onTranscription: (text: string, audioBlob?: Blob) => void
  projectId?: string
  placeholder?: string
}

export default function VoiceDictation({ 
  onTranscription, 
  projectId,
  placeholder = "Tap the microphone to start dictating..."
}: VoiceDictationProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  
  const recognitionRef = useRef<any>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Check if Web Speech API is available
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      setError('Voice dictation is not supported in your browser')
      return
    }

    // Initialize speech recognition
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
    }

    recognition.onresult = (event: any) => {
      let interimText = ''
      let finalText = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalText += transcript + ' '
        } else {
          interimText += transcript
        }
      }

      if (finalText) {
        setTranscript(prev => prev + finalText)
      }
      setInterimTranscript(interimText)
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      let errorMessage = 'Voice recognition error'
      
      switch (event.error) {
        case 'network':
          errorMessage = 'Network error. Please check your connection.'
          break
        case 'not-allowed':
          errorMessage = 'Microphone permission denied'
          break
        case 'no-speech':
          errorMessage = 'No speech detected. Try again.'
          break
      }
      
      setError(errorMessage)
      setIsListening(false)
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      if (isRecording) {
        // Restart if still recording
        recognition.start()
      }
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [isRecording])

  const startRecording = async () => {
    try {
      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start()
      }

      // Start audio recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      })

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(audioBlob)
        setAudioUrl(URL.createObjectURL(audioBlob))
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start(100) // Collect data every 100ms
      setIsRecording(true)
      setError(null)
    } catch (err) {
      console.error('Error starting recording:', err)
      setError('Unable to access microphone')
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    
    setIsRecording(false)
    setIsListening(false)
  }

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const handleSave = () => {
    const finalText = transcript + interimTranscript
    if (finalText.trim() || audioBlob) {
      onTranscription(finalText.trim(), audioBlob || undefined)
      
      // Save to localStorage
      const dictations = JSON.parse(
        localStorage.getItem(`vba-dictations-${projectId}`) || '[]'
      )
      dictations.push({
        text: finalText.trim(),
        timestamp: new Date().toISOString(),
        hasAudio: !!audioBlob
      })
      localStorage.setItem(`vba-dictations-${projectId}`, JSON.stringify(dictations))
      
      // Reset
      handleClear()
    }
  }

  const handleClear = () => {
    setTranscript('')
    setInterimTranscript('')
    setAudioBlob(null)
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    setIsPlaying(false)
  }

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const downloadAudio = () => {
    if (!audioUrl) return

    const a = document.createElement('a')
    a.href = audioUrl
    a.download = `inspection-audio-${new Date().getTime()}.webm`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const fullTranscript = transcript + interimTranscript

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Voice Notes</h3>
        {isListening && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
            <span>Listening...</span>
          </div>
        )}
      </div>

      {/* Transcript Area */}
      <div className="mb-4">
        <div className="min-h-[100px] p-3 bg-gray-50 rounded-lg border border-gray-200">
          {fullTranscript ? (
            <div>
              <p className="text-gray-900 whitespace-pre-wrap">{transcript}</p>
              {interimTranscript && (
                <span className="text-gray-500 italic">{interimTranscript}</span>
              )}
            </div>
          ) : (
            <p className="text-gray-400 italic">{placeholder}</p>
          )}
        </div>
        
        {fullTranscript && (
          <p className="text-xs text-gray-500 mt-1">
            {fullTranscript.split(' ').length} words
          </p>
        )}
      </div>

      {/* Audio Playback */}
      {audioUrl && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center gap-3">
          <button
            onClick={togglePlayback}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          
          <div className="flex-1">
            <p className="text-sm text-blue-900">Audio recorded</p>
            <p className="text-xs text-blue-700">Tap to play back</p>
          </div>
          
          <button
            onClick={downloadAudio}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Record Button */}
        <button
          onClick={handleToggleRecording}
          className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
            isRecording
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isRecording ? (
            <>
              <Square className="h-5 w-5" />
              <span>Stop Recording</span>
            </>
          ) : (
            <>
              <Mic className="h-5 w-5" />
              <span>Start Recording</span>
            </>
          )}
        </button>

        {/* Clear Button */}
        {(fullTranscript || audioUrl) && (
          <button
            onClick={handleClear}
            className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}

        {/* Save Button */}
        {(fullTranscript || audioUrl) && (
          <button
            onClick={handleSave}
            className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            Save
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
    </div>
  )
}