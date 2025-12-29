"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

interface AddCoHostDialogProps {
  onClose: () => void
  onAdd: (name: string, videoUrl: string) => void
}

export default function AddCoHostDialog({ onClose, onAdd }: AddCoHostDialogProps) {
  const [name, setName] = useState("")
  const [videoUrl, setVideoUrl] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && videoUrl.trim()) {
      onAdd(name.trim(), videoUrl.trim())
      setName("")
      setVideoUrl("")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg bg-zinc-900 p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Add Co-Host Video</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Co-Host Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter co-host name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="videoUrl">Video URL</Label>
            <Input
              id="videoUrl"
              type="url"
              placeholder="https://example.com/video-stream"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              required
            />
            <p className="text-xs text-zinc-400">Enter a direct video URL, YouTube embed, or stream URL</p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-500 to-cyan-500">
              Add Co-Host
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
