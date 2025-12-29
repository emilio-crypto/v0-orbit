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

    const { meetingId, content, type } = await request.json()
    const sql = getNeonClient()

    const messages = await sql`
      INSERT INTO messages (meeting_id, sender_id, content, type)
      VALUES (
        ${meetingId},
        ${user.id},
        ${content},
        ${type || "text"}
      )
      RETURNING *
    `

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
    }

    return NextResponse.json({ message: messages[0] })
  } catch (error) {
    console.error("[v0] Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
