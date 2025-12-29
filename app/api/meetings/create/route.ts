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

    const { title } = await request.json()

    const sql = getNeonClient()

    // Generate unique meeting code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()

    // Create meeting
    const meeting = await sql`
      INSERT INTO meetings (code, title, host_id, settings)
      VALUES (
        ${code},
        ${title || "Orbit Conference"},
        ${user.id},
        ${JSON.stringify({
          enableChat: true,
          enableTranscription: true,
          maxParticipants: 50,
        })}
      )
      RETURNING *
    `

    if (!meeting || meeting.length === 0) {
      return NextResponse.json({ error: "Failed to create meeting" }, { status: 500 })
    }

    const createdMeeting = meeting[0]

    // Add host as first participant
    await sql`
      INSERT INTO participants (meeting_id, user_id, name, role, status)
      VALUES (
        ${createdMeeting.id},
        ${user.id},
        ${user.email?.split("@")[0] || "Host"},
        'host',
        'online'
      )
    `

    return NextResponse.json({ meeting: createdMeeting })
  } catch (error) {
    console.error("[v0] Error in create meeting API:", error)
    return NextResponse.json({ error: "Failed to create meeting" }, { status: 500 })
  }
}
