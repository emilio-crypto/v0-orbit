// Audio translation manager using Gemini Live API
export class AudioTranslationManager {
  private audioContext: AudioContext | null = null
  private sourceNode: MediaStreamAudioSourceNode | null = null
  private processorNode: ScriptProcessorNode | null = null
  private translationStream: MediaStream | null = null
  private isTranslating = false
  private onTranslationCallback: ((text: string, audio: Blob) => void) | null = null
  private audioChunks: Float32Array[] = []
  private lastProcessTime = 0
  private readonly PROCESS_INTERVAL = 2000 // Process every 2 seconds
  private outputAudioContext: AudioContext | null = null
  private isPlayingTranslation = false

  constructor() {
    if (typeof window !== "undefined") {
      this.audioContext = new AudioContext()
      this.outputAudioContext = new AudioContext()
    }
  }

  async startTranslation(
    inputStream: MediaStream,
    onTranslation: (text: string, audio: Blob) => void,
    sourceLanguage = "en",
    targetLanguage = "es",
  ) {
    if (!this.audioContext) return

    this.isTranslating = true
    this.onTranslationCallback = onTranslation

    // Create audio source from input stream (but filter out translation output)
    this.sourceNode = this.audioContext.createMediaStreamSource(inputStream)

    // Create processor node for audio analysis
    this.processorNode = this.audioContext.createScriptProcessor(4096, 1, 1)

    this.processorNode.onaudioprocess = (event) => {
      if (!this.isTranslating || this.isPlayingTranslation) {
        // Skip processing if we're playing translation output to avoid loop
        return
      }

      const inputData = event.inputBuffer.getChannelData(0)
      const now = Date.now()

      // Store audio chunks
      this.audioChunks.push(new Float32Array(inputData))

      // Process every PROCESS_INTERVAL milliseconds
      if (now - this.lastProcessTime >= this.PROCESS_INTERVAL) {
        this.processAudioChunks(sourceLanguage, targetLanguage)
        this.lastProcessTime = now
      }
    }

    // Connect nodes
    this.sourceNode.connect(this.processorNode)
    this.processorNode.connect(this.audioContext.destination)

    console.log("[v0] Translation started:", sourceLanguage, "→", targetLanguage)
  }

  private async processAudioChunks(sourceLanguage: string, targetLanguage: string) {
    if (this.audioChunks.length === 0) return

    try {
      // Combine audio chunks
      const totalLength = this.audioChunks.reduce((acc, chunk) => acc + chunk.length, 0)
      const combinedAudio = new Float32Array(totalLength)
      let offset = 0
      for (const chunk of this.audioChunks) {
        combinedAudio.set(chunk, offset)
        offset += chunk.length
      }

      // Convert to WAV blob
      const audioBlob = this.floatArrayToWavBlob(combinedAudio, this.audioContext!.sampleRate)

      // Send to translation API
      const formData = new FormData()
      formData.append("audio", audioBlob, "audio.wav")
      formData.append("sourceLanguage", sourceLanguage)
      formData.append("targetLanguage", targetLanguage)

      const response = await fetch("/api/translate-audio", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()

        if (data.translatedText && this.onTranslationCallback) {
          // Mark that we're playing translation to avoid feedback loop
          this.isPlayingTranslation = true

          this.onTranslationCallback(data.translatedText, audioBlob)

          // Play translated audio if available
          if (data.translatedAudio) {
            await this.playTranslatedAudio(data.translatedAudio)
          }

          // Reset flag after a delay
          setTimeout(() => {
            this.isPlayingTranslation = false
          }, 1000)
        }
      }

      // Clear processed chunks
      this.audioChunks = []
    } catch (error) {
      console.error("[v0] Translation error:", error)
      this.isPlayingTranslation = false
    }
  }

  private floatArrayToWavBlob(samples: Float32Array, sampleRate: number): Blob {
    const buffer = new ArrayBuffer(44 + samples.length * 2)
    const view = new DataView(buffer)

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }

    writeString(0, "RIFF")
    view.setUint32(4, 36 + samples.length * 2, true)
    writeString(8, "WAVE")
    writeString(12, "fmt ")
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, 1, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * 2, true)
    view.setUint16(32, 2, true)
    view.setUint16(34, 16, true)
    writeString(36, "data")
    view.setUint32(40, samples.length * 2, true)

    // Convert samples to 16-bit PCM
    const offset = 44
    for (let i = 0; i < samples.length; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]))
      view.setInt16(offset + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true)
    }

    return new Blob([buffer], { type: "audio/wav" })
  }

  private async playTranslatedAudio(audioBase64: string) {
    if (!this.outputAudioContext) return

    try {
      const audioData = Uint8Array.from(atob(audioBase64), (c) => c.charCodeAt(0))
      const audioBuffer = await this.outputAudioContext.decodeAudioData(audioData.buffer)

      const source = this.outputAudioContext.createBufferSource()
      source.buffer = audioBuffer
      source.connect(this.outputAudioContext.destination)
      source.start()

      console.log("[v0] Playing translated audio")
    } catch (error) {
      console.error("[v0] Error playing translated audio:", error)
    }
  }

  stopTranslation() {
    this.isTranslating = false

    if (this.processorNode) {
      this.processorNode.disconnect()
      this.processorNode = null
    }

    if (this.sourceNode) {
      this.sourceNode.disconnect()
      this.sourceNode = null
    }

    this.audioChunks = []
    this.isPlayingTranslation = false

    console.log("[v0] Translation stopped")
  }

  cleanup() {
    this.stopTranslation()

    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }

    if (this.outputAudioContext) {
      this.outputAudioContext.close()
      this.outputAudioContext = null
    }
  }
}
