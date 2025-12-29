"use client"

import { useEffect, useRef } from "react"
import { GeminiLiveService } from "@/lib/gemini-live-service"
import { WebSpeechSTT } from "@/lib/web-speech-stt"
import { YouTubeDuckingEngine } from "@/lib/youtube-ducking-engine"
import { getTranslatorAPI } from "@/lib/translator-api"

interface NeuralTranslatorProps {
  youtubePlayer: any
  sourceLanguage: string
  targetLanguage: string
  isActive: boolean
  onTranscript?: (text: string, isFinal: boolean) => void
  onTranslation?: (text: string) => void
}

export default function NeuralTranslator({
  youtubePlayer,
  sourceLanguage,
  targetLanguage,
  isActive,
  onTranscript,
  onTranslation,
}: NeuralTranslatorProps) {
  const geminiServiceRef = useRef<GeminiLiveService | null>(null)
  const sttEngineRef = useRef<WebSpeechSTT | null>(null)
  const duckingEngineRef = useRef<YouTubeDuckingEngine | null>(null)
  const translatorAPIRef = useRef(getTranslatorAPI())

  // Initialize services
  useEffect(() => {
    geminiServiceRef.current = new GeminiLiveService({
      sourceLanguage,
      targetLanguage,
      onTranslation: (translatedText, audioBuffer) => {
        console.log("[v0] Neural translation received:", translatedText)
        if (onTranslation) {
          onTranslation(translatedText)
        }

        // Duck YouTube audio when translation starts playing
        if (duckingEngineRef.current) {
          duckingEngineRef.current.duck()
        }
      },
      onError: (error) => {
        console.error("[v0] Gemini Live error:", error)
      },
    })

    sttEngineRef.current = new WebSpeechSTT({
      sourceLanguage,
      onInterimTranscript: (text) => {
        console.log("[v0] STT Interim:", text)
        if (onTranscript) {
          onTranscript(text, false)
        }
      },
      onFinalTranscript: (text) => {
        console.log("[v0] STT Final:", text)
        if (onTranscript) {
          onTranscript(text, true)
        }
        // Send to Gemini Live for translation
        if (geminiServiceRef.current) {
          geminiServiceRef.current.translateAndSynthesize(text)
        }
      },
      onError: (error) => {
        console.error("[v0] STT error:", error)
      },
    })

    if (youtubePlayer) {
      duckingEngineRef.current = new YouTubeDuckingEngine({
        player: youtubePlayer,
        duckVolume: 15,
        normalVolume: 100,
      })
    }

    if (geminiServiceRef.current && sttEngineRef.current && duckingEngineRef.current && youtubePlayer) {
      translatorAPIRef.current.setServices(
        geminiServiceRef.current,
        sttEngineRef.current,
        duckingEngineRef.current,
        youtubePlayer,
      )
    }

    return () => {
      if (geminiServiceRef.current) {
        geminiServiceRef.current.cleanup()
      }
      if (sttEngineRef.current) {
        sttEngineRef.current.cleanup()
      }
    }
  }, [youtubePlayer])

  useEffect(() => {
    if (geminiServiceRef.current) {
      geminiServiceRef.current.updateSettings({ sourceLanguage, targetLanguage })
    }
    if (sttEngineRef.current) {
      sttEngineRef.current.updateLanguage(sourceLanguage)
    }
  }, [sourceLanguage, targetLanguage])

  useEffect(() => {
    if (isActive) {
      console.log("[v0] Starting Neural Translator")
      if (sttEngineRef.current) {
        sttEngineRef.current.start()
      }
    } else {
      console.log("[v0] Stopping Neural Translator")
      if (sttEngineRef.current) {
        sttEngineRef.current.stop()
      }
      if (geminiServiceRef.current) {
        geminiServiceRef.current.stop()
      }
      if (duckingEngineRef.current) {
        duckingEngineRef.current.restore()
      }
    }
  }, [isActive])

  useEffect(() => {
    if (!isActive) return

    const checkSpeakingInterval = setInterval(() => {
      if (geminiServiceRef.current && duckingEngineRef.current) {
        const isSpeaking = geminiServiceRef.current.isSpeaking()

        if (!isSpeaking) {
          // Restore volume when not speaking
          duckingEngineRef.current.restore()
        }
      }
    }, 500)

    return () => clearInterval(checkSpeakingInterval)
  }, [isActive])

  return null // This is a headless component
}
