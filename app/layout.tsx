import type { Metadata, Viewport } from "next"
import { Anton, Cormorant_Garamond, Fraunces, Geist, Geist_Mono } from "next/font/google"

import { deploymentOrigin } from "@/lib/site"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
})

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
})

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
})

const site = deploymentOrigin()

export const metadata: Metadata = {
  metadataBase: site ? new URL(site) : undefined,
  title: {
    default: "IKVÄLL",
    template: "%s · IKVÄLL",
  },
  description: "En mening. En öppningsscen. En länk man skickar.",
  applicationName: "IKVÄLL",
}

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="sv"
      className={`${geistSans.variable} ${geistMono.variable} ${anton.variable} ${cormorant.variable} ${fraunces.variable} dark h-full antialiased`}
    >
      <body className="min-h-dvh bg-black text-white">{children}</body>
    </html>
  )
}
