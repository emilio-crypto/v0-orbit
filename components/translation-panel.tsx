"use client"

import { Languages, Volume2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Translation {
  id: string
  originalText: string
  translatedText: string
  timestamp: Date
}

interface TranslationPanelProps {
  translations: Translation[]
  sourceLanguage: string
  targetLanguage: string
  onSourceLanguageChange: (lang: string) => void
  onTargetLanguageChange: (lang: string) => void
}

export default function TranslationPanel({
  translations,
  sourceLanguage,
  targetLanguage,
  onSourceLanguageChange,
  onTargetLanguageChange,
}: TranslationPanelProps) {
  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
    { code: "zh", name: "Chinese" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
    { code: "ar", name: "Arabic" },
  ]

  return (
    <div className="border-t border-zinc-800 bg-zinc-900">
      <div className="mx-auto max-w-4xl px-6 py-3">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
            <Languages className="h-4 w-4 text-emerald-500" />
          </div>

          <div className="flex-1 space-y-3">
            {/* Language Selection */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-emerald-500">LIVE TRANSLATION</span>
              <div className="flex items-center gap-2">
                <Select value={sourceLanguage} onValueChange={onSourceLanguageChange}>
                  <SelectTrigger className="h-7 w-[120px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code} className="text-xs">
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <span className="text-xs text-zinc-400">→</span>

                <Select value={targetLanguage} onValueChange={onTargetLanguageChange}>
                  <SelectTrigger className="h-7 w-[120px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code} className="text-xs">
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Translation Display */}
            <ScrollArea className="h-24 rounded-lg bg-zinc-800 p-3">
              {translations.length === 0 ? (
                <p className="text-sm text-zinc-400">Listening for speech to translate...</p>
              ) : (
                <div className="space-y-3">
                  {translations.map((translation) => (
                    <div key={translation.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-3 w-3 text-emerald-500" />
                        <p className="text-sm text-emerald-400">{translation.translatedText}</p>
                      </div>
                      {translation.originalText !== "Processing..." && (
                        <p className="text-xs text-zinc-500 pl-5">{translation.originalText}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  )
}
