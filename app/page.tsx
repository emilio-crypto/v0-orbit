"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import Image from "next/image"

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleGuestLogin = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInAnonymously()

      if (error) throw error

      router.push("/conference")
      router.refresh()
    } catch (error) {
      console.error("Guest login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center p-6 bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="flex flex-col items-center gap-8 text-center max-w-2xl">
        <Image
          src="/logo-full.png"
          alt="Orbit Conference"
          width={240}
          height={72}
          className="object-contain"
          priority
        />
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-balance">
            AI-Powered Video Conferencing with Real-Time Translation
          </h1>
          <p className="text-lg text-muted-foreground text-balance">
            Connect globally with neural translation, live captions, and seamless video collaboration
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button size="lg" asChild className="min-w-[200px]">
            <Link href="/auth/sign-up">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="min-w-[200px] bg-transparent">
            <Link href="/auth/login">Sign In</Link>
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={handleGuestLogin}
            disabled={isLoading}
            className="min-w-[200px]"
          >
            {isLoading ? "Joining..." : "Try as Guest"}
          </Button>
        </div>
      </div>
    </div>
  )
}
