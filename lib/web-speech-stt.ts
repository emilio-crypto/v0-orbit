// Web Speech API STT Engine with robust restart logic
export interface WebSpeechSTTConfig {
  sourceLanguage: string
  onInterimTranscript?: (text: string) => void
  onFinalTranscript?: (text: string) => void
  onError?: (error: Error) => void
}

export class WebSpeechSTT {
  private recognition: any = null
  private config: WebSpeechSTTConfig
  private isListening = false
  private restartTimeout: NodeJS.Timeout | null = null

  constructor(config: WebSpeechSTTConfig) {
    this.config = config
    this.initializeRecognition()
  }

  private initializeRecognition(): void {
    if (typeof window === "undefined") return

    // @ts-ignore - webkitSpeechRecognition is not in TypeScript types
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      console.error("[v0] Web Speech API not supported")
      return
    }

    this.recognition = new SpeechRecognition()
    this.recognition.continuous = true
    this.recognition.interimResults = true
    this.recognition.lang = this.getLangCode(this.config.sourceLanguage)

    this.recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript

        if (event.results[i].isFinal) {
          console.log("[v0] STT Final:", transcript)
          if (this.config.onFinalTranscript) {
            this.config.onFinalTranscript(transcript)
          }
        } else {
          console.log("[v0] STT Interim:", transcript)
          if (this.config.onInterimTranscript) {
            this.config.onInterimTranscript(transcript)
          }
        }
      }
    }

    this.recognition.onerror = (event: any) => {
      console.error("[v0] STT Error:", event.error)
      if (event.error !== "no-speech") {
        if (this.config.onError) {
          this.config.onError(new Error(event.error))
        }
      }
    }

    // Robust restart logic for no-speech timeouts
    this.recognition.onend = () => {
      console.log("[v0] STT Ended, restarting...")
      if (this.isListening) {
        this.restartTimeout = setTimeout(() => {
          this.start()
        }, 100)
      }
    }
  }

  private getLangCode(lang: string): string {
    const langMap: Record<string, string> = {
      en: "en-US",
      es: "es-ES",
      fr: "fr-FR",
      de: "de-DE",
      it: "it-IT",
      pt: "pt-PT",
      zh: "zh-CN",
      ja: "ja-JP",
      ko: "ko-KR",
      ar: "ar-SA",
    }
    return langMap[lang] || "en-US"
  }

  start(): void {
    if (!this.recognition) {
      console.error("[v0] Speech recognition not initialized")
      return
    }

    this.isListening = true
    try {
      this.recognition.start()
      console.log("[v0] STT Started:", this.config.sourceLanguage)
    } catch (error) {
      console.error("[v0] STT Start error:", error)
    }
  }

  stop(): void {
    this.isListening = false

    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout)
      this.restartTimeout = null
    }

    if (this.recognition) {
      try {
        this.recognition.stop()
        console.log("[v0] STT Stopped")
      } catch (error) {
        console.error("[v0] STT Stop error:", error)
      }
    }
  }

  updateLanguage(language: string): void {
    const wasListening = this.isListening
    this.stop()
    this.config.sourceLanguage = language
    if (this.recognition) {
      this.recognition.lang = this.getLangCode(language)
    }
    if (wasListening) {
      this.start()
    }
  }

  cleanup(): void {
    this.stop()
    this.recognition = null
  }
}
