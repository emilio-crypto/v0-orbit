import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { getNeonClient } from "@/lib/neon/client"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const settings = await request.json()
    const sql = getNeonClient()

    // Upsert user settings
    const result = await sql`
      INSERT INTO user_settings (
        id, 
        display_name, 
        preferred_language, 
        translation_target_language, 
        enable_auto_translation, 
        enable_auto_captions
      )
      VALUES (
        ${user.id},
        ${settings.display_name || null},
        ${settings.preferred_language || null},
        ${settings.translation_target_language || null},
        ${settings.enable_auto_translation || false},
        ${settings.enable_auto_captions || false}
      )
      ON CONFLICT (id) 
      DO UPDATE SET
        display_name = EXCLUDED.display_name,
        preferred_language = EXCLUDED.preferred_language,
        translation_target_language = EXCLUDED.translation_target_language,
        enable_auto_translation = EXCLUDED.enable_auto_translation,
        enable_auto_captions = EXCLUDED.enable_auto_captions,
        updated_at = NOW()
      RETURNING *
    `

    return NextResponse.json({ settings: result[0] })
  } catch (error) {
    console.error("[v0] Error updating settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
