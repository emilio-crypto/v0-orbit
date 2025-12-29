import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    "https://rcbuikbjqgykssiatxpo.supabase.co",
    "sb_publishable_uTIwEo4TJBo_YkX-OWN9qQ_5HJvl4c5",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Ignore if called from Server Component
          }
        },
      },
    },
  )
}

export { createClient as createServerClient }
