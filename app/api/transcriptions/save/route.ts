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

    const { roomName, sender, text } = await request.json()

    const { data, error } = await supabase
      .from("transcriptions")
      .insert({
        user_id: user.id,
        room_name: roomName,
        sender,
        text,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error saving transcription:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ transcription: data })
  } catch (error) {
    console.error("[v0] Error in save transcription API:", error)
    return NextResponse.json({ error: "Failed to save transcription" }, { status: 500 })
  }
}
