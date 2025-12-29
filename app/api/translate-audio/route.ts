import { streamText } from "ai"

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get("audio") as Blob
    const sourceLanguage = (formData.get("sourceLanguage") as string) || "en"
    const targetLanguage = (formData.get("targetLanguage") as string) || "es"

    if (!audioFile) {
      return Response.json({ error: "No audio file provided" }, { status: 400 })
    }

    // Convert audio blob to base64
    const arrayBuffer = await audioFile.arrayBuffer()
    const base64Audio = Buffer.from(arrayBuffer).toString("base64")

    // Use Gemini to transcribe and translate the audio
    // Note: Using text generation with audio input for translation
    const languageNames: Record<string, string> = {
      en: "English",
      es: "Spanish",
      fr: "French",
      de: "German",
      it: "Italian",
      pt: "Portuguese",
      zh: "Chinese",
      ja: "Japanese",
      ko: "Korean",
      ar: "Arabic",
    }

    const sourceLang = languageNames[sourceLanguage] || sourceLanguage
    const targetLang = languageNames[targetLanguage] || targetLanguage

    // Use Gemini for audio transcription and translation
    const result = await streamText({
      model: "google/gemini-4-flash-audio",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Transcribe this audio from ${sourceLang} and translate it to ${targetLang}. Only output the translated text, nothing else.`,
            },
            {
              type: "file",
              data: base64Audio,
              mediaType: "audio/wav",
            },
          ],
        },
      ],
      maxOutputTokens: 500,
    })

    let translatedText = ""
    for await (const chunk of result.textStream) {
      translatedText += chunk
    }

    // For demo purposes, we'll return the translated text
    // In production, you would also generate translated audio using a TTS service
    return Response.json({
      translatedText: translatedText.trim(),
      sourceLanguage,
      targetLanguage,
      // translatedAudio would come from a TTS service in production
    })
  } catch (error: any) {
    console.error("[v0] Translation API error:", error)
    return Response.json({ error: error.message || "Translation failed" }, { status: 500 })
  }
}
