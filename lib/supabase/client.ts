import { createBrowserClient } from "@supabase/ssr"

const SUPABASE_URL = "https://rcbuikbjqgykssiatxpo.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjYnVpa2JqcWd5a3NzaWF0eHBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NjQ3MjAsImV4cCI6MjA4MjA0MDcyMH0.VpbbCzQo9N78WxXTu2vdhKqOi3lRYQBufujXWu61gyU"

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
