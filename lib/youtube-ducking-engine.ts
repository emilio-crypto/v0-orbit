// YouTube Player Audio Ducking Engine
export interface DuckingEngineConfig {
  player: any // YouTube Player instance
  duckVolume?: number
  normalVolume?: number
  duckDuration?: number
  restoreDuration?: number
}

export class YouTubeDuckingEngine {
  private player: any
  private duckVolume: number
  private normalVolume: number
  private duckDuration: number
  private restoreDuration: number
  private isDucked = false

  constructor(config: DuckingEngineConfig) {
    this.player = config.player
    this.duckVolume = config.duckVolume ?? 15
    this.normalVolume = config.normalVolume ?? 100
    this.duckDuration = config.duckDuration ?? 200
    this.restoreDuration = config.restoreDuration ?? 500
  }

  duck(): void {
    if (!this.player || this.isDucked) return

    console.log("[v0] Ducking YouTube audio")
    this.isDucked = true

    // Gradually reduce volume to duck level
    this.animateVolume(this.player.getVolume(), this.duckVolume, this.duckDuration)
  }

  restore(): void {
    if (!this.player || !this.isDucked) return

    console.log("[v0] Restoring YouTube audio")
    this.isDucked = false

    // Gradually restore volume to normal level
    this.animateVolume(this.player.getVolume(), this.normalVolume, this.restoreDuration)
  }

  private animateVolume(from: number, to: number, duration: number): void {
    const startTime = Date.now()
    const volumeDiff = to - from

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      const currentVolume = from + volumeDiff * this.easeInOutQuad(progress)
      this.player.setVolume(currentVolume)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    animate()
  }

  private easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
  }

  setNormalVolume(volume: number): void {
    this.normalVolume = volume
    if (!this.isDucked) {
      this.player.setVolume(volume)
    }
  }
}
