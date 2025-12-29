import { createBrowserClient } from "@supabase/ssr"

const SUPABASE_URL = "https://rcbuikbjqgykssiatxpo.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjYnVpa2JqcWd5a3NzaWF0eHBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0MzYxNzEsImV4cCI6MjA1MTAxMjE3MX0.JGWNz0cHXAl7wM2YPKbz9T71xZF7a2Bt-CnJE20vVAo"

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
