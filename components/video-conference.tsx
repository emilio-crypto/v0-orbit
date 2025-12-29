"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, Languages, Settings, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import VideoGrid from "./video-grid"
import ParticipantsList from "./participants-list"
import TranslationPanel from "./translation-panel"
import { WebRTCManager } from "@/lib/webrtc-manager"
import { SignalingService } from "@/lib/signaling-service"
import { AudioTranslationManager } from "@/lib/audio-translation-manager"

interface Translation {
  id: string
  originalText: string
  translatedText: string
  timestamp: Date
}

export default function VideoConference() {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isTranslationActive, setIsTranslationActive] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [participants, setParticipants] = useState([{ id: "local", name: "You", stream: null, isMuted: false }])
  const [translations, setTranslations] = useState<Translation[]>([])
  const [sourceLanguage, setSourceLanguage] = useState("en")
  const [targetLanguage, setTargetLanguage] = useState("es")

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const webrtcManagerRef = useRef<WebRTCManager | null>(null)
  const signalingServiceRef = useRef<SignalingService | null>(null)
  const userIdRef = useRef<string>(`user-${Math.random().toString(36).substring(7)}`)
  const translationManagerRef = useRef<AudioTranslationManager | null>(null)

  // Initialize WebRTC and Signaling
  useEffect(() => {
    // Initialize signaling service
    const roomId = "orbit-room-1" // In production, this would be dynamic
    signalingServiceRef.current = new SignalingService(roomId)

    // Initialize WebRTC manager
    webrtcManagerRef.current = new WebRTCManager(
      (peerId, stream) => {
        console.log("[v0] Adding remote stream for peer:", peerId)
        setParticipants((prev) => {
          const existing = prev.find((p) => p.id === peerId)
          if (existing) {
            return prev.map((p) => (p.id === peerId ? { ...p, stream } : p))
          }
          return [...prev, { id: peerId, name: `User ${peerId.slice(-4)}`, stream, isMuted: false }]
        })
      },
      (peerId) => {
        console.log("[v0] Peer disconnected:", peerId)
        setParticipants((prev) => prev.filter((p) => p.id !== peerId))
      },
    )

    translationManagerRef.current = new AudioTranslationManager()

    // Set up signaling event handlers
    const signaling = signalingServiceRef.current

    signaling.on("user-joined", async ({ userId }: { userId: string }) => {
      if (userId !== userIdRef.current && webrtcManagerRef.current) {
        console.log("[v0] User joined, creating offer for:", userId)
        const offer = await webrtcManagerRef.current.createOffer(userId)
        await signaling.sendOffer(userId, offer)
      }
    })

    signaling.on("offer", async ({ targetUserId, offer }: any) => {
      if (webrtcManagerRef.current && targetUserId === userIdRef.current) {
        console.log("[v0] Received offer, creating answer")
        const answer = await webrtcManagerRef.current.createAnswer(targetUserId, offer)
        await signaling.sendAnswer(targetUserId, answer)
      }
    })

    signaling.on("answer", async ({ targetUserId, answer }: any) => {
      if (webrtcManagerRef.current && targetUserId === userIdRef.current) {
        console.log("[v0] Received answer")
        await webrtcManagerRef.current.handleAnswer(targetUserId, answer)
      }
    })

    signaling.on("ice-candidate", async ({ targetUserId, candidate }: any) => {
      if (webrtcManagerRef.current && targetUserId === userIdRef.current) {
        console.log("[v0] Received ICE candidate")
        await webrtcManagerRef.current.addIceCandidate(targetUserId, candidate)
      }
    })

    signaling.on("user-left", ({ userId }: { userId: string }) => {
      console.log("[v0] User left:", userId)
      setParticipants((prev) => prev.filter((p) => p.id !== userId))
    })

    // Join room
    signaling.joinRoom(userIdRef.current)

    // Initialize local media
    initializeMedia()

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop())
      }
      if (webrtcManagerRef.current) {
        webrtcManagerRef.current.closeAllConnections()
      }
      if (signalingServiceRef.current) {
        signalingServiceRef.current.leaveRoom(userIdRef.current)
        signalingServiceRef.current.disconnect()
      }
      if (translationManagerRef.current) {
        translationManagerRef.current.cleanup()
      }
    }
  }, [])

  useEffect(() => {
    if (isTranslationActive && localStream && translationManagerRef.current) {
      // Start translation with callback
      translationManagerRef.current.startTranslation(
        localStream,
        (translatedText: string, audioBlob: Blob) => {
          // Add new translation to the list
          const newTranslation: Translation = {
            id: Date.now().toString(),
            originalText: "Processing...",
            translatedText,
            timestamp: new Date(),
          }
          setTranslations((prev) => [newTranslation, ...prev].slice(0, 10)) // Keep last 10 translations
        },
        sourceLanguage,
        targetLanguage,
      )
    } else if (!isTranslationActive && translationManagerRef.current) {
      // Stop translation
      translationManagerRef.current.stopTranslation()
    }
  }, [isTranslationActive, sourceLanguage, targetLanguage, localStream])

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [errorMessage])

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      setLocalStream(stream)

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // Set local stream in WebRTC manager
      if (webrtcManagerRef.current) {
        webrtcManagerRef.current.setLocalStream(stream)
      }

      setParticipants((prev) => prev.map((p) => (p.id === "local" ? { ...p, stream } : p)))
    } catch (error) {
      console.error("Error accessing media devices:", error)
    }
  }

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!audioTrack.enabled)
      }
    }
  }

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOff(!videoTrack.enabled)
      }
    }
  }

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      setIsScreenSharing(false)
      initializeMedia()
    } else {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
          setErrorMessage("Screen sharing is not supported in this environment")
          return
        }

        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: "always" },
          audio: false,
        })

        setLocalStream(screenStream)

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream
        }

        // Update WebRTC manager with new stream
        if (webrtcManagerRef.current) {
          webrtcManagerRef.current.setLocalStream(screenStream)
        }

        setIsScreenSharing(true)

        // Handle when user stops sharing from browser UI
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false)
          initializeMedia()
        }

        setErrorMessage(null)
      } catch (error: any) {
        console.error("Error sharing screen:", error)

        if (error.name === "NotAllowedError") {
          setErrorMessage("Screen sharing permission denied. Please allow access and try again.")
        } else if (error.name === "NotSupportedError" || error.message?.includes("permissions policy")) {
          setErrorMessage("Screen sharing is not available in this preview environment. It will work when deployed.")
        } else {
          setErrorMessage("Unable to share screen. Please try again.")
        }
      }
    }
  }

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop())
      setLocalStream(null)
    }

    if (webrtcManagerRef.current) {
      webrtcManagerRef.current.closeAllConnections()
    }

    if (signalingServiceRef.current) {
      signalingServiceRef.current.leaveRoom(userIdRef.current)
    }

    if (translationManagerRef.current) {
      translationManagerRef.current.stopTranslation()
      setIsTranslationActive(false)
    }
  }

  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500">
            <span className="font-bold text-lg">O</span>
          </div>
          <div>
            <h1 className="font-semibold text-lg leading-tight">Orbit Conference</h1>
            <p className="text-xs text-zinc-400">Meeting Room</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={showParticipants ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setShowParticipants(!showParticipants)}
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">{participants.length}</span>
          </Button>

          <Button
            variant={showSettings ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video Grid */}
        <div className="flex-1 relative">
          <VideoGrid
            participants={participants}
            localVideoRef={localVideoRef}
            isTranslationActive={isTranslationActive}
          />

          {/* Error Message Overlay */}
          {errorMessage && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 max-w-md animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="rounded-lg bg-red-500/95 px-4 py-3 text-sm font-medium shadow-lg backdrop-blur">
                <div className="flex items-start gap-2">
                  <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <p>{errorMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Translation Indicator */}
          {isTranslationActive && (
            <div className="absolute top-4 left-4 flex items-center gap-2 rounded-lg bg-emerald-500/90 px-3 py-2 text-sm font-medium backdrop-blur">
              <Languages className="h-4 w-4 animate-pulse" />
              <span>Live Translation Active</span>
            </div>
          )}
        </div>

        {/* Sidebar Panels */}
        {showParticipants && (
          <div className="w-80 border-l border-zinc-800 bg-zinc-900">
            <ParticipantsList participants={participants} />
          </div>
        )}
      </div>

      {/* Translation Panel */}
      {isTranslationActive && (
        <TranslationPanel
          translations={translations}
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLanguage}
          onSourceLanguageChange={setSourceLanguage}
          onTargetLanguageChange={setTargetLanguage}
        />
      )}

      {/* Control Bar */}
      <div className="border-t border-zinc-800 bg-zinc-900 px-6 py-4">
        <div className="flex items-center justify-center gap-3">
          {/* Audio Toggle */}
          <Button
            onClick={toggleMute}
            size="lg"
            variant={isMuted ? "destructive" : "secondary"}
            className={cn("h-12 w-12 rounded-full p-0", isMuted && "bg-red-500 hover:bg-red-600")}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          {/* Video Toggle */}
          <Button
            onClick={toggleVideo}
            size="lg"
            variant={isVideoOff ? "destructive" : "secondary"}
            className={cn("h-12 w-12 rounded-full p-0", isVideoOff && "bg-red-500 hover:bg-red-600")}
          >
            {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          </Button>

          {/* Screen Share */}
          <Button
            onClick={toggleScreenShare}
            size="lg"
            variant={isScreenSharing ? "default" : "secondary"}
            className={cn("h-12 w-12 rounded-full p-0", isScreenSharing && "bg-blue-500 hover:bg-blue-600")}
          >
            <Monitor className="h-5 w-5" />
          </Button>

          {/* Translation Toggle */}
          <Button
            onClick={() => setIsTranslationActive(!isTranslationActive)}
            size="lg"
            variant={isTranslationActive ? "default" : "secondary"}
            className={cn("h-12 w-12 rounded-full p-0", isTranslationActive && "bg-emerald-500 hover:bg-emerald-600")}
          >
            <Languages className="h-5 w-5" />
          </Button>

          {/* End Call */}
          <Button
            onClick={endCall}
            size="lg"
            variant="destructive"
            className="h-12 w-12 rounded-full bg-red-600 p-0 hover:bg-red-700"
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Labels */}
        <div className="mt-3 flex justify-center gap-3 text-xs text-zinc-400 sm:hidden">
          <span>Mic</span>
          <span>Camera</span>
          <span>Share</span>
          <span>Translate</span>
          <span>End</span>
        </div>
      </div>
    </div>
  )
}
