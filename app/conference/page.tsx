"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import VideoConference from "@/components/video-conference"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface UserSettings {
  id: string
  display_name: string | null
  preferred_language: string | null
  translation_target_language: string | null
  enable_auto_translation: boolean | null
  enable_auto_captions: boolean | null
}

export default function ConferencePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push("/auth/login")
        return
      }

      setUser(user)

      try {
        const response = await fetch("/api/settings/get")
        if (response.ok) {
          const { settings: userSettings } = await response.json()
          setSettings(userSettings)
        } else {
          // Set default settings if none exist
          setSettings({
            id: user.id,
            display_name: user.email?.split("@")[0] || null,
            preferred_language: "en",
            translation_target_language: "es",
            enable_auto_translation: false,
            enable_auto_captions: false,
          })
        }
      } catch (error) {
        console.error("[v0] Error loading settings:", error)
        setSettings({
          id: user.id,
          display_name: user.email?.split("@")[0] || null,
          preferred_language: "en",
          translation_target_language: "es",
          enable_auto_translation: false,
          enable_auto_captions: false,
        })
      }
      setIsLoading(false)
    })
  }, [router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <VideoConference userSettings={settings} user={user} />
    </main>
  )
}
