import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

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

    // Find meeting by code
    const { data: meeting, error: meetingError } = await supabase
      .from("meetings")
      .select("*")
      .eq("code", code.toUpperCase())
      .is("ended_at", null)
      .single()

    if (meetingError || !meeting) {
      return NextResponse.json({ error: "Meeting not found or has ended" }, { status: 404 })
    }

    // Check if already a participant
    const { data: existingParticipant } = await supabase
      .from("participants")
      .select("*")
      .eq("meeting_id", meeting.id)
      .eq("user_id", user.id)
      .is("left_at", null)
      .single()

    if (existingParticipant) {
      return NextResponse.json({ meeting, participant: existingParticipant })
    }

    // Add as participant
    const { data: participant, error: participantError } = await supabase
      .from("participants")
      .insert({
        meeting_id: meeting.id,
        user_id: user.id,
        name: name || user.email?.split("@")[0] || "Guest",
        role: "attendee",
        status: "online",
      })
      .select()
      .single()

    if (participantError) {
      console.error("[v0] Error adding participant:", participantError)
      return NextResponse.json({ error: participantError.message }, { status: 500 })
    }

    return NextResponse.json({ meeting, participant })
  } catch (error) {
    console.error("[v0] Error in join meeting API:", error)
    return NextResponse.json({ error: "Failed to join meeting" }, { status: 500 })
  }
}
