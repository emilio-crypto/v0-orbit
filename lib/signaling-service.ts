// Simulated signaling service for WebRTC
// In production, this would be a WebSocket connection to a signaling server
export class SignalingService {
  private eventHandlers: Map<string, Function[]> = new Map()
  private roomId: string

  constructor(roomId: string) {
    this.roomId = roomId
  }

  on(event: string, handler: Function) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
    }
    this.eventHandlers.get(event)?.push(handler)
  }

  off(event: string, handler: Function) {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  emit(event: string, data: any) {
    console.log("[v0] Signaling event:", event, data)
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.forEach((handler) => handler(data))
    }
  }

  // Simulate joining a room
  async joinRoom(userId: string) {
    console.log("[v0] Joining room:", this.roomId, "as user:", userId)

    // Simulate a delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Emit user joined event
    this.emit("user-joined", { userId, roomId: this.roomId })

    return { success: true, roomId: this.roomId }
  }

  // Send offer to peer
  async sendOffer(targetUserId: string, offer: RTCSessionDescriptionInit) {
    console.log("[v0] Sending offer to:", targetUserId)
    // In production, this would send via WebSocket to signaling server
    this.emit("offer", { targetUserId, offer })
  }

  // Send answer to peer
  async sendAnswer(targetUserId: string, answer: RTCSessionDescriptionInit) {
    console.log("[v0] Sending answer to:", targetUserId)
    // In production, this would send via WebSocket to signaling server
    this.emit("answer", { targetUserId, answer })
  }

  // Send ICE candidate
  async sendIceCandidate(targetUserId: string, candidate: RTCIceCandidateInit) {
    console.log("[v0] Sending ICE candidate to:", targetUserId)
    // In production, this would send via WebSocket to signaling server
    this.emit("ice-candidate", { targetUserId, candidate })
  }

  // Leave room
  async leaveRoom(userId: string) {
    console.log("[v0] Leaving room:", this.roomId, "user:", userId)
    this.emit("user-left", { userId, roomId: this.roomId })
  }

  disconnect() {
    this.eventHandlers.clear()
  }
}
