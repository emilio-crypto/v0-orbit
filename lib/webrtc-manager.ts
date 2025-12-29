// WebRTC connection manager for peer-to-peer video/audio streaming
export class WebRTCManager {
  private peerConnections: Map<string, RTCPeerConnection> = new Map()
  private localStream: MediaStream | null = null
  private configuration: RTCConfiguration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
  }

  constructor(
    private onRemoteStream: (peerId: string, stream: MediaStream) => void,
    private onPeerDisconnected: (peerId: string) => void,
  ) {}

  setLocalStream(stream: MediaStream) {
    this.localStream = stream
  }

  async createPeerConnection(peerId: string): Promise<RTCPeerConnection> {
    const peerConnection = new RTCPeerConnection(this.configuration)

    // Add local tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, this.localStream!)
      })
    }

    // Handle incoming remote tracks
    peerConnection.ontrack = (event) => {
      console.log("[v0] Received remote track from peer:", peerId)
      this.onRemoteStream(peerId, event.streams[0])
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("[v0] New ICE candidate for peer:", peerId)
        // In production, send this to signaling server
        // For demo purposes, we'll handle this locally
      }
    }

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log("[v0] Connection state:", peerConnection.connectionState)
      if (
        peerConnection.connectionState === "disconnected" ||
        peerConnection.connectionState === "failed" ||
        peerConnection.connectionState === "closed"
      ) {
        this.onPeerDisconnected(peerId)
      }
    }

    this.peerConnections.set(peerId, peerConnection)
    return peerConnection
  }

  async createOffer(peerId: string): Promise<RTCSessionDescriptionInit> {
    const peerConnection = this.peerConnections.get(peerId) || (await this.createPeerConnection(peerId))

    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)

    return offer
  }

  async createAnswer(peerId: string, offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    const peerConnection = this.peerConnections.get(peerId) || (await this.createPeerConnection(peerId))

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)

    return answer
  }

  async handleAnswer(peerId: string, answer: RTCSessionDescriptionInit) {
    const peerConnection = this.peerConnections.get(peerId)
    if (peerConnection) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
    }
  }

  async addIceCandidate(peerId: string, candidate: RTCIceCandidateInit) {
    const peerConnection = this.peerConnections.get(peerId)
    if (peerConnection) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
    }
  }

  closePeerConnection(peerId: string) {
    const peerConnection = this.peerConnections.get(peerId)
    if (peerConnection) {
      peerConnection.close()
      this.peerConnections.delete(peerId)
    }
  }

  closeAllConnections() {
    this.peerConnections.forEach((pc) => pc.close())
    this.peerConnections.clear()
  }

  getPeerConnection(peerId: string): RTCPeerConnection | undefined {
    return this.peerConnections.get(peerId)
  }
}
