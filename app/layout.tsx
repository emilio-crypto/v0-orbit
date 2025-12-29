import type React from "react"
import type { Metadata } from "next"

import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

// Import fonts
import { Geist, Geist_Mono, Source_Serif_4 as V0_Font_Source_Serif_4, Roboto } from "next/font/google"

// Initialize fonts
const _geist = Geist({ subsets: ["latin"], weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"] })
const _geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})
const _sourceSerif_4 = V0_Font_Source_Serif_4({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
})
const roboto = Roboto({ subsets: ["latin"], weight: ["300", "400", "500", "700"] })

export const metadata: Metadata = {
  title: "Orbit Conference - Video Meetings with Live Translation",
  description: "Professional video conferencing with real-time AI translation powered by Gemini",
  generator: "v0.app",
  icons: {
    icon: "/logo-only.jpg",
    apple: "/logo-only.jpg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
