"use client"

import { useState, useCallback } from "react"
import { SmokeBackground } from "@/components/smoke-background"
import { FortuneTab } from "@/components/fortune-tab"
import { ChatTab } from "@/components/chat-tab"
import { CalendarTab } from "@/components/calendar-tab"
import type { Fortune } from "@/lib/fortunes"

const TABS = [
  { id: "chat", label: "解签", icon: "chat" },
  { id: "fortune", label: "求签", icon: "fortune" },
  { id: "calendar", label: "历书", icon: "calendar" },
] as const

type TabId = (typeof TABS)[number]["id"]

function TabIcon({ type, active }: { type: string; active: boolean }) {
  const color = active ? "#4A7862" : "rgba(74, 120, 98, 0.35)"
  const sw = active ? "1.8" : "1.2"
  if (type === "chat") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <circle cx="9" cy="10" r="0.5" fill={color} /><circle cx="12" cy="10" r="0.5" fill={color} /><circle cx="15" cy="10" r="0.5" fill={color} />
      </svg>
    )
  }
  if (type === "fortune") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3v2M16 3v2M6 7h12" />
        <rect x="5" y="5" width="14" height="16" rx="2" />
        <path d="M12 11v5M9.5 13.5h5" />
      </svg>
    )
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 10h18M16 2v4M8 2v4M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
    </svg>
  )
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<TabId>("fortune")
  const [currentFortune, setCurrentFortune] = useState<Fortune | null>(null)

  const handleFortuneChange = useCallback((fortune: Fortune | null) => {
    setCurrentFortune(fortune)
  }, [])

  const goToChat = useCallback(() => {
    setActiveTab("chat")
  }, [])

  return (
    <div className="relative h-[100dvh] flex flex-col overflow-hidden" style={{ background: "linear-gradient(180deg, #F2F5F3 0%, #FAFCFB 30%, #F5F8F6 60%, #F2F5F3 100%)" }}>
      <SmokeBackground />

      {/* Ambient gradients */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 25% 20%, rgba(74,120,98,0.03) 0%, transparent 55%), radial-gradient(ellipse at 75% 80%, rgba(212,175,55,0.02) 0%, transparent 45%)",
        zIndex: 0,
      }} aria-hidden="true" />

      {/* Main content area */}
      <main className="relative flex-1 overflow-hidden" style={{ zIndex: 2 }}>
        <div className={`h-full transition-opacity duration-500 ${activeTab === "fortune" ? "opacity-100 visible" : "opacity-0 invisible absolute inset-0"}`}>
          <FortuneTab onFortuneChange={handleFortuneChange} onOpenChat={goToChat} />
        </div>
        <div className={`h-full transition-opacity duration-500 ${activeTab === "chat" ? "opacity-100 visible" : "opacity-0 invisible absolute inset-0"}`}>
          <ChatTab currentFortune={currentFortune} />
        </div>
        <div className={`h-full transition-opacity duration-500 ${activeTab === "calendar" ? "opacity-100 visible" : "opacity-0 invisible absolute inset-0"}`}>
          <CalendarTab />
        </div>
      </main>

      {/* Bottom tab bar */}
      <nav
        className="relative flex-shrink-0 glass-strong"
        style={{
          zIndex: 30,
          borderTop: "1px solid rgba(74, 120, 98, 0.06)",
          paddingBottom: "env(safe-area-inset-bottom, 12px)",
        }}
        aria-label="底部导航"
      >
        <div className="flex items-center justify-around h-14">
          {TABS.map((tab) => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-0.5 px-6 py-1.5 transition-all duration-300 ${active ? "scale-105" : "opacity-60 hover:opacity-80"}`}
                aria-label={tab.label}
                aria-current={active ? "page" : undefined}
              >
                <TabIcon type={tab.icon} active={active} />
                <span
                  className="text-[10px] font-sans tracking-wider"
                  style={{ color: active ? "#4A7862" : "rgba(74, 120, 98, 0.35)" }}
                >
                  {tab.label}
                </span>
                {active && (
                  <div className="absolute -top-px left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full" style={{ background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }} />
                )}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
