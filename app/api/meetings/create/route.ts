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

    const { title } = await request.json()

    // Generate unique meeting code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()

    // Create meeting
    const { data: meeting, error } = await supabase
      .from("meetings")
      .insert({
        code,
        title: title || "Orbit Conference",
        host_id: user.id,
        settings: {
          enableChat: true,
          enableTranscription: true,
          maxParticipants: 50,
        },
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating meeting:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Add host as first participant
    await supabase.from("participants").insert({
      meeting_id: meeting.id,
      user_id: user.id,
      name: user.email?.split("@")[0] || "Host",
      role: "host",
      status: "online",
    })

    return NextResponse.json({ meeting })
  } catch (error) {
    console.error("[v0] Error in create meeting API:", error)
    return NextResponse.json({ error: "Failed to create meeting" }, { status: 500 })
  }
}
