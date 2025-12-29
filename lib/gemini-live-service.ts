// Gemini Live Service for Neural Translation with Native Audio
export interface GeminiLiveConfig {
  sourceLanguage: string
  targetLanguage: string
  onTranslation?: (translatedText: string, audioBuffer: AudioBuffer) => void
  onError?: (error: Error) => void
}

export class GeminiLiveService {
  private audioContext: AudioContext | null = null
  private nextStartTime = 0
  private config: GeminiLiveConfig
  private audioQueue: AudioBuffer[] = []
  private isPlaying = false
  private currentSource: AudioBufferSourceNode | null = null

  constructor(config: GeminiLiveConfig) {
    this.config = config
    if (typeof window !== "undefined") {
      this.audioContext = new AudioContext({ sampleRate: 24000 })
    }
  }

  async translateAndSynthesize(transcript: string): Promise<void> {
    try {
      console.log("[v0] Gemini Live: Processing transcript:", transcript)

      const response = await fetch("/api/gemini-live/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: transcript,
          sourceLanguage: this.config.sourceLanguage,
          targetLanguage: this.config.targetLanguage,
        }),
      })

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.translatedText) {
        // Decode PCM audio bytes
        const audioBuffer = await this.decodePCMAudio(data.audioData)

        // Add to playback queue
        this.enqueueAudio(audioBuffer)

        // Callback with translation
        if (this.config.onTranslation) {
          this.config.onTranslation(data.translatedText, audioBuffer)
        }
      }
    } catch (error) {
      console.error("[v0] Gemini Live error:", error)
      if (this.config.onError) {
        this.config.onError(error as Error)
      }
    }
  }

  private async decodePCMAudio(base64Audio: string): Promise<AudioBuffer> {
    if (!this.audioContext) {
      throw new Error("AudioContext not initialized")
    }

    // Decode base64 PCM data
    const binaryString = atob(base64Audio)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    // Decode audio data
    const audioBuffer = await this.audioContext.decodeAudioData(bytes.buffer)
    return audioBuffer
  }

  private enqueueAudio(audioBuffer: AudioBuffer): void {
    this.audioQueue.push(audioBuffer)
    if (!this.isPlaying) {
      this.playNextInQueue()
    }
  }

  private playNextInQueue(): void {
    if (!this.audioContext || this.audioQueue.length === 0) {
      this.isPlaying = false
      return
    }

    this.isPlaying = true
    const audioBuffer = this.audioQueue.shift()!

    const source = this.audioContext.createBufferSource()
    source.buffer = audioBuffer
    source.connect(this.audioContext.destination)

    // Gapless scheduling with nextStartTime cursor
    const now = this.audioContext.currentTime
    const startTime = Math.max(now, this.nextStartTime)

    source.start(startTime)
    this.nextStartTime = startTime + audioBuffer.duration
    this.currentSource = source

    // Play next when this one ends
    source.onended = () => {
      this.currentSource = null
      if (this.audioQueue.length > 0) {
        this.playNextInQueue()
      } else {
        this.isPlaying = false
        this.nextStartTime = 0
      }
    }

    console.log("[v0] Gemini Live: Playing audio buffer", {
      duration: audioBuffer.duration,
      startTime,
      queueLength: this.audioQueue.length,
    })
  }

  isSpeaking(): boolean {
    return this.isPlaying
  }

  updateSettings(settings: Partial<GeminiLiveConfig>): void {
    this.config = { ...this.config, ...settings }
  }

  stop(): void {
    if (this.currentSource) {
      this.currentSource.stop()
      this.currentSource = null
    }
    this.audioQueue = []
    this.isPlaying = false
    this.nextStartTime = 0
  }

  cleanup(): void {
    this.stop()
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
  }
}
