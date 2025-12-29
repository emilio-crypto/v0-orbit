import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import SettingsForm from "@/components/settings-form"

export default async function SettingsPage() {
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
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <SettingsForm initialSettings={settings} user={user} />
    </main>
  )
}
