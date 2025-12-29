"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import SettingsForm from "@/components/settings-form"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface UserSettings {
  targetLanguage: string
  autoTranslate: boolean
  autoCaptions: boolean
}

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/auth/login")
        return
      }

      setUser(user)

      // Load settings from Supabase
      supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            // Set default settings if none exist
            setSettings({
              targetLanguage: "en",
              autoTranslate: false,
              autoCaptions: false,
            })
          } else {
            setSettings({
              targetLanguage: data.target_language || "en",
              autoTranslate: data.auto_translate || false,
              autoCaptions: data.auto_captions || false,
            })
          }
          setIsLoading(false)
        })
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
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-6">
      <SettingsForm initialSettings={settings} user={user} />
    </main>
  )
}
