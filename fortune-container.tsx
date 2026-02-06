"use client"

import { useState, useCallback, useEffect } from "react"
import { getRandomFortune, splitPoemLines, getFortuneLevel, fortunes, type Fortune } from "@/lib/fortunes"
import { playShakeSound, playRevealSound } from "@/lib/sounds"
import { FortuneSlip } from "./fortune-slip"

const DAILY_LIMIT = 3
const MAX_REROLLS = 2

interface DailyState {
  draws: number
  rerolls: number
  accepted: boolean
  date: string
  acceptedFortuneId: number
}

function getTodayStr() {
  return new Date().toISOString().split("T")[0]
}

function getDailyState(): DailyState {
  if (typeof window === "undefined") return { draws: 0, rerolls: 0, accepted: false, date: "", acceptedFortuneId: 0 }
  const stored = localStorage.getItem("bina-fortune-state")
  if (stored) {
    const state = JSON.parse(stored)
    if (state.date === getTodayStr()) return state
  }
  return { draws: 0, rerolls: 0, accepted: false, date: getTodayStr(), acceptedFortuneId: 0 }
}

function saveDailyState(state: DailyState) {
  if (typeof window === "undefined") return
  localStorage.setItem("bina-fortune-state", JSON.stringify(state))
  const historyKey = "bina-fortune-history"
  const history = JSON.parse(localStorage.getItem(historyKey) || "[]")
  const today = state.date
  const existing = history.findIndex((h: { date: string }) => h.date === today)
  if (existing >= 0) {
    history[existing] = { date: today, fortuneId: state.acceptedFortuneId, accepted: state.accepted }
  } else if (state.accepted) {
    history.push({ date: today, fortuneId: state.acceptedFortuneId, accepted: true })
  }
  localStorage.setItem(historyKey, JSON.stringify(history))
}

interface FortuneContainerProps {
  onFortuneChange: (fortune: Fortune | null) => void
  onOpenChat: () => void
}

export function FortuneContainer({ onFortuneChange, onOpenChat }: FortuneContainerProps) {
  const [isShaking, setIsShaking] = useState(false)
  const [isDimmed, setIsDimmed] = useState(false)
  const [fortune, setFortune] = useState<Fortune | null>(null)
  const [showSlip, setShowSlip] = useState(false)
  const [dailyState, setDailyState] = useState<DailyState>(getDailyState)
  const [drawnIds, setDrawnIds] = useState<number[]>([])

  // On mount, if accepted today, show the accepted fortune
  useEffect(() => {
    const s = getDailyState()
    setDailyState(s)
    if (s.accepted && s.acceptedFortuneId > 0) {
      const f = fortunes.find((ff) => ff.id === s.acceptedFortuneId) || null
      setFortune(f)
      onFortuneChange(f)
    }
  }, [onFortuneChange])

  const drawFortune = useCallback(() => {
    if (dailyState.draws >= DAILY_LIMIT || dailyState.accepted) return
    setIsDimmed(true)
    setIsShaking(true)
    setShowSlip(false)
    setFortune(null)
    onFortuneChange(null)
    playShakeSound()

    setTimeout(() => {
      const newFortune = getRandomFortune(drawnIds)
      setFortune(newFortune)
      setDrawnIds((prev) => [...prev, newFortune.id])
      onFortuneChange(newFortune)
      setIsShaking(false)
      setTimeout(() => {
        setShowSlip(true)
        playRevealSound()
      }, 300)
      const newState = { ...dailyState, draws: dailyState.draws + 1, date: getTodayStr() }
      setDailyState(newState)
      saveDailyState(newState)
    }, 1200)
  }, [dailyState, onFortuneChange, drawnIds])

  const rerollFortune = useCallback(() => {
    if (dailyState.rerolls >= MAX_REROLLS) return
    setShowSlip(false)
    setTimeout(() => {
      const newFortune = getRandomFortune([...drawnIds])
      setFortune(newFortune)
      setDrawnIds((prev) => [...prev, newFortune.id])
      onFortuneChange(newFortune)
      setTimeout(() => setShowSlip(true), 300)
      const newState = { ...dailyState, rerolls: dailyState.rerolls + 1 }
      setDailyState(newState)
      saveDailyState(newState)
    }, 500)
  }, [dailyState, drawnIds, onFortuneChange])

  const acceptFortune = useCallback(() => {
    const newState: DailyState = { ...dailyState, accepted: true, acceptedFortuneId: fortune?.id || 0 }
    setDailyState(newState)
    saveDailyState(newState)
    setShowSlip(false)
    setIsDimmed(false)
  }, [dailyState, fortune])

  const openChatForFortune = useCallback(() => {
    setShowSlip(false)
    setIsDimmed(false)
    onOpenChat()
  }, [onOpenChat])

  const remaining = DAILY_LIMIT - dailyState.draws
  const rerollsLeft = MAX_REROLLS - dailyState.rerolls
  const locked = dailyState.accepted

  // ---- Accepted: show today's fortune card pinned ----
  if (locked && fortune) {
    const lines = splitPoemLines(fortune.poem)
    const level = getFortuneLevel(fortune.type)
    const accentColor = level === "吉" ? "var(--gold)" : "rgba(140,110,80,0.6)"
    return (
      <section className="relative z-10 flex flex-col items-center gap-3 py-4 px-4">
        <div
          className="w-full max-w-sm rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(30px)",
            border: "1px solid rgba(74,120,98,0.08)",
            boxShadow: "0 8px 40px rgba(74,120,98,0.06)",
          }}
        >
          {/* Top gold line */}
          <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent 10%, ${accentColor} 50%, transparent 90%)`, opacity: 0.5 }} />

          <div className="px-6 py-5">
            {/* Header row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] tracking-wider font-sans" style={{ color: "rgba(74,120,98,0.35)" }}>{"今日签文"}</span>
                <span className="text-[10px] font-sans" style={{ color: "rgba(212,175,55,0.4)" }}>{"第"}{fortune.id}{"签"}</span>
              </div>
              <span
                className="px-3 py-0.5 rounded-full text-[10px] tracking-widest font-serif"
                style={{ color: accentColor, border: `1px solid ${level === "吉" ? "rgba(212,175,55,0.2)" : "rgba(140,110,80,0.15)"}`, background: level === "吉" ? "rgba(212,175,55,0.04)" : "rgba(140,110,80,0.03)" }}
              >
                {fortune.type}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-light font-serif tracking-widest mb-3" style={{ color: "#2c3e36" }}>
              {fortune.title}
            </h3>

            {/* Poem lines */}
            <div className="py-3 mb-3" style={{ borderTop: "1px solid rgba(212,175,55,0.08)", borderBottom: "1px solid rgba(212,175,55,0.08)" }}>
              <div className="flex flex-col items-start gap-0.5">
                {lines.map((line, i) => (
                  <p key={i} className="text-[13px] leading-relaxed font-serif" style={{ color: "rgba(44,62,54,0.55)" }}>
                    {line}
                  </p>
                ))}
              </div>
            </div>

            {/* Meaning */}
            <p className="text-[12px] leading-relaxed font-sans" style={{ color: "rgba(44,62,54,0.4)" }}>
              <span className="text-[10px] mr-1.5" style={{ color: "var(--gold)" }}>{"解"}</span>
              {fortune.meaning}
            </p>

            {/* Chat CTA */}
            <button
              onClick={onOpenChat}
              className="mt-4 w-full py-2.5 rounded-xl text-[11px] font-sans tracking-wider transition-all duration-300"
              style={{ background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.15)", color: "var(--gold)" }}
            >
              {"与小碧对话解签"}
            </button>
          </div>
        </div>
      </section>
    )
  }

  // ---- Not accepted: show the fortune jar ----
  return (
    <section className="relative z-10 flex flex-col items-center gap-4 py-4">
      <div
        className={`fixed inset-0 z-20 transition-all duration-1000 pointer-events-none ${isDimmed && !showSlip ? "opacity-100" : "opacity-0"}`}
        style={{ background: "radial-gradient(ellipse at center, transparent 20%, rgba(44,62,54,0.12) 100%)" }}
        aria-hidden="true"
      />

      <div className="relative flex flex-col items-center">
        <button
          onClick={drawFortune}
          disabled={isShaking || remaining <= 0}
          className="group relative cursor-pointer disabled:cursor-not-allowed focus:outline-none"
          aria-label="求签"
        >
          <div className={`relative transition-transform duration-300 ${isShaking ? "animate-shake" : "hover:scale-[1.02]"}`} style={{ perspective: "1000px" }}>
            <div className="relative w-28 h-48 md:w-32 md:h-56">
              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: "linear-gradient(160deg, #e8f0ec 0%, #d8e6de 40%, #e0ebe5 70%, #e8f0ec 100%)",
                  boxShadow: "inset -8px 0 20px rgba(74,120,98,0.08), inset 8px 0 16px rgba(255,255,255,0.5), 0 8px 32px rgba(74,120,98,0.1), 0 2px 8px rgba(74,120,98,0.06)",
                  border: "1px solid rgba(74,120,98,0.1)",
                }}
              />
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-[115%] h-5 rounded-full" style={{ background: "linear-gradient(180deg, rgba(212,175,55,0.55) 0%, rgba(212,175,55,0.2) 100%)", boxShadow: "0 2px 12px rgba(212,175,55,0.15)" }} />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[108%] h-3.5 rounded-full" style={{ background: "linear-gradient(0deg, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.3) 100%)" }} />
              {[...Array(6)].map((_, i) => (
                <div key={i} className="absolute rounded-full" style={{ width: "3px", height: "24px", background: "linear-gradient(180deg, rgba(212,175,55,0.6) 0%, rgba(212,175,55,0.2) 100%)", top: "-20px", left: `${32 + i * 7}%`, transform: `rotate(${(i - 2.5) * 4}deg)` }} />
              ))}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl md:text-4xl font-light select-none" style={{ color: "rgba(74,120,98,0.45)", fontFamily: "var(--font-serif-sc), serif" }}>{"签"}</span>
              </div>
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ boxShadow: "0 4px 40px rgba(74,120,98,0.1), inset 0 0 24px rgba(255,255,255,0.3)" }} />
            </div>
          </div>
        </button>

        <p className="mt-6 text-[13px] tracking-[0.25em] animate-breathe font-serif" style={{ color: "rgba(74,120,98,0.4)" }}>
          {remaining > 0 ? "轻触签筒 · 问道天机" : "今日机缘已尽 · 明日再来"}
        </p>

        <div className="mt-2 flex items-center gap-4 text-[11px] font-sans" style={{ color: "rgba(74,120,98,0.3)" }}>
          <span>{"灵力 "}<span style={{ color: "var(--gold)" }}>{remaining}</span>{"/3"}</span>
          {fortune && <span>{"可换 "}<span style={{ color: "var(--gold)" }}>{rerollsLeft}</span>{" 次"}</span>}
        </div>
      </div>

      {fortune && (
        <FortuneSlip fortune={fortune} show={showSlip} onAccept={acceptFortune} onReroll={rerollFortune} onChat={openChatForFortune} canReroll={rerollsLeft > 0} />
      )}
    </section>
  )
}
