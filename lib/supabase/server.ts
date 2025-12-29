import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const SUPABASE_URL = "https://rcbuikbjqgykssiatxpo.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjYnVpa2JqcWd5a3NzaWF0eHBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0MzYxNzEsImV4cCI6MjA1MTAxMjE3MX0.JGWNz0cHXAl7wM2YPKbz9T71xZF7a2Bt-CnJE20vVAo"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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
  })
}

export { createClient as createServerClient }
