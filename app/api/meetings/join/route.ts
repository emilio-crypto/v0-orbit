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

    const { code, name } = await request.json()

    const sql = getNeonClient()

    // Find meeting by code
    const meetings = await sql`
      SELECT * FROM meetings
      WHERE code = ${code.toUpperCase()}
      AND ended_at IS NULL
      LIMIT 1
    `

    if (!meetings || meetings.length === 0) {
      return NextResponse.json({ error: "Meeting not found or has ended" }, { status: 404 })
    }

    const meeting = meetings[0]

    // Check if already a participant
    const existingParticipants = await sql`
      SELECT * FROM participants
      WHERE meeting_id = ${meeting.id}
      AND user_id = ${user.id}
      AND left_at IS NULL
      LIMIT 1
    `

    if (existingParticipants && existingParticipants.length > 0) {
      return NextResponse.json({ meeting, participant: existingParticipants[0] })
    }

    // Add as participant
    const participants = await sql`
      INSERT INTO participants (meeting_id, user_id, name, role, status)
      VALUES (
        ${meeting.id},
        ${user.id},
        ${name || user.email?.split("@")[0] || "Guest"},
        'attendee',
        'online'
      )
      RETURNING *
    `

    if (!participants || participants.length === 0) {
      return NextResponse.json({ error: "Failed to add participant" }, { status: 500 })
    }

    return NextResponse.json({ meeting, participant: participants[0] })
  } catch (error) {
    console.error("[v0] Error in join meeting API:", error)
    return NextResponse.json({ error: "Failed to join meeting" }, { status: 500 })
  }
}
