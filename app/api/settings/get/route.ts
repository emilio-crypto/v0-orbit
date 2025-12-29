import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { getNeonClient } from "@/lib/neon/client"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sql = getNeonClient()

    const settings = await sql`
      SELECT * FROM user_settings
      WHERE id = ${user.id}
      LIMIT 1
    `

    if (!settings || settings.length === 0) {
      return NextResponse.json({ settings: null }, { status: 404 })
    }

    return NextResponse.json({ settings: settings[0] })
  } catch (error) {
    console.error("[v0] Error getting settings:", error)
    return NextResponse.json({ error: "Failed to get settings" }, { status: 500 })
  }
}
