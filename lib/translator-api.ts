// Global Translator API for external control
import type { GeminiLiveService } from "./gemini-live-service"
import type { WebSpeechSTT } from "./web-speech-stt"
import type { YouTubeDuckingEngine } from "./youtube-ducking-engine"

export interface TranslatorAPISettings {
  sourceLanguage?: string
  targetLanguage?: string
  sourceVolume?: number
  translationVolume?: number
}

export class TranslatorAPI {
  private geminiService: GeminiLiveService | null = null
  private sttEngine: WebSpeechSTT | null = null
  private duckingEngine: YouTubeDuckingEngine | null = null
  private youtubePlayer: any = null

  setServices(gemini: GeminiLiveService, stt: WebSpeechSTT, ducking: YouTubeDuckingEngine, player: any): void {
    this.geminiService = gemini
    this.sttEngine = stt
    this.duckingEngine = ducking
    this.youtubePlayer = player
  }

  speak(text: string): void {
    if (!this.geminiService) {
      console.error("[v0] TranslatorAPI: Gemini service not initialized")
      return
    }
    this.geminiService.translateAndSynthesize(text)
  }

  setSettings(settings: TranslatorAPISettings): void {
    if (settings.sourceLanguage && this.sttEngine) {
      this.sttEngine.updateLanguage(settings.sourceLanguage)
    }

    if (settings.targetLanguage && this.geminiService) {
      this.geminiService.updateSettings({ targetLanguage: settings.targetLanguage })
    }

    if (settings.sourceVolume !== undefined && this.duckingEngine) {
      this.duckingEngine.setNormalVolume(settings.sourceVolume)
    }
  }

  setVideo(videoId: string): void {
    if (!this.youtubePlayer) {
      console.error("[v0] TranslatorAPI: YouTube player not initialized")
      return
    }
    this.youtubePlayer.loadVideoById(videoId)
  }

  getStatus() {
    return {
      isGeminiSpeaking: this.geminiService?.isSpeaking() ?? false,
      isSTTListening: this.sttEngine ? true : false,
    }
  }
}

// Global singleton instance
let translatorAPIInstance: TranslatorAPI | null = null

export function getTranslatorAPI(): TranslatorAPI {
  if (!translatorAPIInstance) {
    translatorAPIInstance = new TranslatorAPI()

    // Expose to window for external access
    if (typeof window !== "undefined") {
      ;(window as any).translatorAPI = translatorAPIInstance
    }
  }
  return translatorAPIInstance
}
