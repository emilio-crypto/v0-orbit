"use client"

import { Users, Mic, MicOff, Monitor } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Participant {
  id: string
  name: string
  stream: MediaStream | null
  isMuted: boolean
  videoUrl?: string
}

interface ParticipantsListProps {
  participants: Participant[]
}

export default function ParticipantsList({ participants }: ParticipantsListProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Users className="h-4 w-4" />
          <span>Participants ({participants.length})</span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {participants.map((participant) => (
            <div key={participant.id} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-zinc-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 text-sm font-semibold">
                {participant.name.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium">{participant.name}</p>
                {participant.videoUrl && (
                  <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                    <Monitor className="h-3 w-3" />
                    Co-Host
                  </p>
                )}
              </div>

              {participant.isMuted ? (
                <MicOff className="h-4 w-4 text-red-500" />
              ) : (
                <Mic className="h-4 w-4 text-emerald-500" />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
