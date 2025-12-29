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

    const { roomName, sender, text } = await request.json()

    const sql = getNeonClient()

    const transcriptions = await sql`
      INSERT INTO transcriptions (user_id, room_name, sender, text)
      VALUES (
        ${user.id},
        ${roomName},
        ${sender},
        ${text}
      )
      RETURNING *
    `

    if (!transcriptions || transcriptions.length === 0) {
      return NextResponse.json({ error: "Failed to save transcription" }, { status: 500 })
    }

    return NextResponse.json({ transcription: transcriptions[0] })
  } catch (error) {
    console.error("[v0] Error in save transcription API:", error)
    return NextResponse.json({ error: "Failed to save transcription" }, { status: 500 })
  }
}
