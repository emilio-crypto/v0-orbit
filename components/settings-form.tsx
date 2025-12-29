"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
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
  const [displayName, setDisplayName] = useState(initialSettings?.display_name || user.email?.split("@")[0] || "")
  const [preferredLanguage, setPreferredLanguage] = useState(initialSettings?.preferred_language || "en")
  const [targetLanguage, setTargetLanguage] = useState(initialSettings?.translation_target_language || "es")
  const [autoTranslation, setAutoTranslation] = useState(initialSettings?.enable_auto_translation || false)
  const [autoCaptions, setAutoCaptions] = useState(initialSettings?.enable_auto_captions || false)
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const isGuestUser = user.is_anonymous || false

  const handleSave = async () => {
    setIsSaving(true)
    setSuccess(false)

    try {
      const response = await fetch("/api/settings/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName,
          preferred_language: preferredLanguage,
          translation_target_language: targetLanguage,
          enable_auto_translation: autoTranslation,
          enable_auto_captions: autoCaptions,
        }),
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        console.error("[v0] Failed to save settings")
      }
    } catch (error) {
      console.error("[v0] Error saving settings:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOut = async () => {
    router.push("/auth/login")
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-8 flex items-center justify-between">
        <Button variant="ghost" asChild className="hover:bg-primary/10">
          <Link href="/conference">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Conference
          </Link>
        </Button>
        <Image src="/logo-full.png" alt="Orbit Conference" width={120} height={36} className="object-contain" />
      </div>

      <Card className="shadow-xl border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl">Settings</CardTitle>
          <CardDescription>Manage your account and conference preferences</CardDescription>
          {isGuestUser && (
            <div className="mt-2 rounded-md bg-muted/50 border border-border px-3 py-2 text-sm text-muted-foreground">
              You're using Orbit as a guest. Sign up to save your preferences permanently.
            </div>
          )}
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
              <Input id="email" value={isGuestUser ? "Guest User" : user.email} disabled className="bg-muted" />
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

          {success && <p className="text-sm text-emerald-600 dark:text-emerald-400">Settings saved successfully!</p>}

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} disabled={isSaving} className="flex-1">
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              {isGuestUser ? "Exit Guest Mode" : "Sign Out"}
            </Button>
          </div>

          {isGuestUser && (
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3">Want to keep your settings and meeting history?</p>
              <Button variant="default" asChild className="w-full">
                <Link href="/auth/sign-up">Create an Account</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
