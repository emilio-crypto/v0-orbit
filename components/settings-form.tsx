"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { User } from "@supabase/supabase-js"

interface UserSettings {
  id: string
  display_name: string | null
  preferred_language: string | null
  translation_target_language: string | null
  enable_auto_translation: boolean | null
  enable_auto_captions: boolean | null
}

interface SettingsFormProps {
  initialSettings: UserSettings | null
  user: User
}

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

export default function SettingsForm({ initialSettings, user }: SettingsFormProps) {
  const router = useRouter()
  const [displayName, setDisplayName] = useState(initialSettings?.display_name || user.email || "")
  const [preferredLanguage, setPreferredLanguage] = useState(initialSettings?.preferred_language || "en")
  const [targetLanguage, setTargetLanguage] = useState(initialSettings?.translation_target_language || "es")
  const [autoTranslation, setAutoTranslation] = useState(initialSettings?.enable_auto_translation || false)
  const [autoCaptions, setAutoCaptions] = useState(initialSettings?.enable_auto_captions || false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(false)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("user_settings").upsert({
        id: user.id,
        display_name: displayName,
        preferred_language: preferredLanguage,
        translation_target_language: targetLanguage,
        enable_auto_translation: autoTranslation,
        enable_auto_captions: autoCaptions,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || "Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/conference">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Conference
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Manage your account and conference preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Profile</h3>
            <div className="space-y-2">
              <Label htmlFor="display-name">Display Name</Label>
              <Input
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} disabled className="bg-muted" />
            </div>
          </div>

          {/* Language Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Language Preferences</h3>
            <div className="space-y-2">
              <Label htmlFor="preferred-language">Your Language</Label>
              <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
                <SelectTrigger id="preferred-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-language">Translation Target Language</Label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger id="target-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Conference Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Conference Features</h3>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-translation">Enable Auto Translation</Label>
                <p className="text-sm text-muted-foreground">Automatically translate audio during meetings</p>
              </div>
              <Switch id="auto-translation" checked={autoTranslation} onCheckedChange={setAutoTranslation} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-captions">Enable Auto Captions</Label>
                <p className="text-sm text-muted-foreground">Show live captions during meetings</p>
              </div>
              <Switch id="auto-captions" checked={autoCaptions} onCheckedChange={setAutoCaptions} />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-500">Settings saved successfully!</p>}

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} disabled={isSaving} className="flex-1">
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
