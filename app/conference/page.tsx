import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import VideoConference from "@/components/video-conference"

export default async function ConferencePage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Fetch user settings
  const { data: settings } = await supabase.from("user_settings").select("*").eq("id", user.id).single()

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <VideoConference userSettings={settings} user={user} />
    </main>
  )
}
