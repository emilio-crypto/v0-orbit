"use client"

import { useEffect, useRef, useState } from "react"

interface CaptionsDisplayProps {
  caption: string
}

export default function CaptionsDisplay({ caption }: CaptionsDisplayProps) {
  const [displayText, setDisplayText] = useState("")
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (caption) {
      setDisplayText(caption)

      // Auto-scroll to the end as new text appears
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth
      }
    }
  }, [caption])

  if (!displayText) return null

  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 pointer-events-none">
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-hide"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          height: "32px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <p
          style={{
            fontFamily: "Roboto, sans-serif",
            fontSize: "12px",
            lineHeight: "32px",
            color: "white",
            paddingLeft: "16px",
            paddingRight: "16px",
          }}
        >
          {displayText}
        </p>
      </div>
    </div>
  )
}
