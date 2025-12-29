"use client"

import { useEffect, useRef, type RefObject } from "react"
import { cn } from "@/lib/utils"

interface Participant {
  id: string
  name: string
  stream: MediaStream | null
  isMuted: boolean
}

interface VideoGridProps {
  participants: Participant[]
  localVideoRef: RefObject<HTMLVideoElement>
  isTranslationActive?: boolean
}

export default function VideoGrid({ participants, localVideoRef, isTranslationActive }: VideoGridProps) {
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map())

  useEffect(() => {
    // Update remote video elements with streams
    participants.forEach((participant) => {
      if (participant.id !== "local" && participant.stream) {
        const videoElement = remoteVideoRefs.current.get(participant.id)
        if (videoElement && videoElement.srcObject !== participant.stream) {
          videoElement.srcObject = participant.stream
        }
      }
    })
  }, [participants])

  const getGridClass = () => {
    const count = participants.length
    if (count === 1) return "grid-cols-1"
    if (count === 2) return "grid-cols-1 md:grid-cols-2"
    if (count <= 4) return "grid-cols-2"
    if (count <= 6) return "grid-cols-2 lg:grid-cols-3"
    return "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  }

  return (
    <div className={cn("grid h-full w-full gap-2 p-4", getGridClass())}>
      {participants.map((participant) => (
        <div key={participant.id} className="relative overflow-hidden rounded-lg bg-zinc-800">
          {participant.id === "local" ? (
            <video ref={localVideoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
          ) : participant.stream ? (
            <video
              ref={(el) => {
                if (el) remoteVideoRefs.current.set(participant.id, el)
              }}
              autoPlay
              playsInline
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 text-3xl font-bold">
                {participant.name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}

          {/* Participant Info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{participant.name}</span>
              {participant.isMuted && <div className="rounded bg-red-500 px-2 py-1 text-xs">Muted</div>}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
