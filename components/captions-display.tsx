"use client"

interface CaptionsDisplayProps {
  caption: string
}

export default function CaptionsDisplay({ caption }: CaptionsDisplayProps) {
  if (!caption) return null

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 max-w-4xl w-full px-4">
      <div className="rounded-lg bg-black/90 px-6 py-3 text-center backdrop-blur-sm">
        <p className="text-lg font-medium leading-relaxed text-white">{caption}</p>
      </div>
    </div>
  )
}
