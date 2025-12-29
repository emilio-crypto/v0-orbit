export const maxDuration = 60

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY

export async function POST(req: Request) {
  try {
    const { text, sourceLanguage, targetLanguage } = await req.json()

    if (!text) {
      return Response.json({ error: "No text provided" }, { status: 400 })
    }

    if (!GEMINI_API_KEY) {
      return Response.json({ error: "API key not configured" }, { status: 500 })
    }

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

    // System instruction for Gemini Live
    const systemInstruction = `You are a professional real-time translator. Your ONLY task is to:
1. Immediately translate the following ${sourceLang} text to ${targetLang}
2. Respond ONLY with the translated text
3. Use natural human prosody with appropriate breathing and pauses
4. NO conversational responses, NO greetings, NO meta-commentary
5. Output ONLY the translation as if spoken by a native ${targetLang} speaker`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `${systemInstruction}\n\nTranslate: "${text}"`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 500,
          },
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.text()
      console.error("[v0] Gemini API error:", errorData)
      throw new Error(`Gemini API error: ${response.statusText}`)
    }

    const data = await response.json()
    const translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    if (!translatedText) {
      throw new Error("No translation returned from Gemini")
    }

    // Use browser's Speech Synthesis for now (will be replaced with Gemini native audio)
    // For MVP, we return the text and let the client handle synthesis
    return Response.json({
      translatedText,
      audioData: null, // Will add Gemini native audio in next phase
      sourceLanguage,
      targetLanguage,
    })
  } catch (error: any) {
    console.error("[v0] Translation error:", error)
    return Response.json({ error: error.message || "Translation failed" }, { status: 500 })
  }
}
