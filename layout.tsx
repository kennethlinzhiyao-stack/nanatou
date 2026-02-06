import React from "react"
import type { Metadata, Viewport } from "next"
import { Noto_Serif_SC, Inter } from "next/font/google"

import "./globals.css"

const notoSerifSC = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-serif-sc",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "碧娜的占卜屋",
  description: "在碧色烟雾中，寻找今日的指引与启示",
}

export const viewport: Viewport = {
  themeColor: "#F2F5F3",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className={`${notoSerifSC.variable} ${inter.variable}`}>
      <body className="font-serif antialiased overflow-x-hidden film-grain">{children}</body>
    </html>
  )
}
