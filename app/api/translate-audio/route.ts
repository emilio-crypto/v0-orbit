import { generateText } from "ai"

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

    const arrayBuffer = await audioFile.arrayBuffer()
    const base64Audio = Buffer.from(arrayBuffer).toString("base64")

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

    const result = await generateText({
      model: "google/gemini-2.5-flash-image",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Listen to this audio in ${sourceLang} and translate it to ${targetLang}. Provide ONLY the translated text as if a native ${targetLang} speaker is saying it naturally. No explanations, no original text, just the natural translation.`,
            },
            {
              type: "file",
              data: base64Audio,
              mimeType: "audio/wav",
            },
          ],
        },
      ],
      maxTokens: 500,
    })

    const translatedText = result.text.trim()

    // Note: This returns the text that can be read aloud by browser's speech synthesis
    // or a TTS API in production for more natural voices
    return Response.json({
      translatedText,
      sourceLanguage,
      targetLanguage,
      nativeSpeech: true, // Flag to indicate this should be spoken aloud
    })
  } catch (error: any) {
    console.error("[v0] Translation API error:", error)
    return Response.json({ error: error.message || "Translation failed" }, { status: 500 })
  }
}
