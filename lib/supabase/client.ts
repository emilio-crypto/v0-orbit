import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    "https://rcbuikbjqgykssiatxpo.supabase.co",
    "sb_publishable_uTIwEo4TJBo_YkX-OWN9qQ_5HJvl4c5",
  )
}
