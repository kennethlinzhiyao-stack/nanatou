"use client"

import { useState, useEffect, useRef } from "react"
import { fortunes, getFortuneLevel, type Fortune } from "@/lib/fortunes"
import { yearSummaries } from "@/lib/year-summaries"
import { getSavedLetters } from "./time-capsule"

interface FortuneHistoryEntry { date: string; fortuneId: number; accepted: boolean }

function getHistory(): FortuneHistoryEntry[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem("bina-fortune-history") || "[]") } catch { return [] }
}

function getDaysInMonth(y: number, m: number) { return new Date(y, m, 0).getDate() }
function getFirstDayOfWeek(y: number, m: number) { return new Date(y, m - 1, 1).getDay() }

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"]
const MONTHS = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]

const DEFAULT_XIAOBI_PROMPT = `你是「小碧」，碧色占卜屋的守护灵...`
const DEFAULT_XIAONA_PROMPT = `你是「小娜」，碧娜(Bina)的数字分身...`

export function CalendarTab() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [history, setHistory] = useState<FortuneHistoryEntry[]>([])
  const [savedLetters, setSavedLetters] = useState<{ date: string; content: string }[]>([])
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate())
  const [showAdmin, setShowAdmin] = useState(false)
  const [showPromptEditor, setShowPromptEditor] = useState(false)
  const [editingAgent, setEditingAgent] = useState<"xiaobi" | "xiaona">("xiaobi")
  const [editingPrompt, setEditingPrompt] = useState("")
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setHistory(getHistory())
    setSavedLetters(getSavedLetters())
  }, [])

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfWeek(year, month)
  const today = now.getFullYear() === year && now.getMonth() + 1 === month ? now.getDate() : -1

  const getFortuneForDate = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    const entry = history.find((h) => h.date === dateStr)
    if (!entry) return null
    return fortunes.find((f) => f.id === entry.fortuneId) || null
  }

  const getLettersForDate = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return savedLetters.filter((l) => l.date === dateStr)
  }

  const prevMonth = () => { if (month === 1) { setYear(year - 1); setMonth(12) } else setMonth(month - 1); setSelectedDay(null) }
  const nextMonth = () => { if (month === 12) { setYear(year + 1); setMonth(1) } else setMonth(month + 1); setSelectedDay(null) }

  const selectedFortune = selectedDay ? getFortuneForDate(selectedDay) : null
  const selectedLetters = selectedDay ? getLettersForDate(selectedDay) : []
  const currentSummary = yearSummaries.find((s) => s.year === year)
  const monthHighlight = currentSummary?.monthHighlights[month]

  const handleLongPressStart = () => { longPressTimer.current = setTimeout(() => setShowAdmin(true), 3000) }
  const handleLongPressEnd = () => { if (longPressTimer.current) clearTimeout(longPressTimer.current) }

  const clearHistory = () => {
    localStorage.removeItem("bina-fortune-history"); localStorage.removeItem("bina-fortune-state")
    localStorage.removeItem("bina-chat-visited"); localStorage.removeItem("bina-conversations")
    localStorage.removeItem("bina-saved-letters")
    setHistory([]); setSavedLetters([]); setShowAdmin(false)
  }

  const openPromptEditor = (agent: "xiaobi" | "xiaona") => {
    setEditingAgent(agent)
    const stored = typeof window !== "undefined" ? localStorage.getItem(`bina-prompt-${agent}`) : null
    setEditingPrompt(stored || (agent === "xiaobi" ? DEFAULT_XIAOBI_PROMPT : DEFAULT_XIAONA_PROMPT))
    setShowPromptEditor(true)
  }

  const saveEditingPrompt = () => {
    if (typeof window !== "undefined") localStorage.setItem(`bina-prompt-${editingAgent}`, editingPrompt)
    setShowPromptEditor(false)
  }

  const totalDraws = history.length
  const jiCount = history.filter((h) => { const f = fortunes.find((ff) => ff.id === h.fortuneId); return f && getFortuneLevel(f.type) === "吉" }).length

  return (
    <div className="h-full overflow-y-auto no-scrollbar">
      <div className="flex flex-col items-center px-4 pt-6 pb-4">
        <h2 className="text-lg font-light tracking-[0.3em] font-serif mb-4" style={{ color: "#2c3e36" }}>{"历书"}</h2>

        {/* Month nav */}
        <div className="flex items-center gap-6 mb-4">
          <button onClick={prevMonth} className="ghost-btn w-8 h-8 rounded-full flex items-center justify-center" aria-label="上月">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <span className="text-sm font-serif tracking-widest min-w-[120px] text-center" style={{ color: "#2c3e36" }}>{year}{"年"}{MONTHS[month - 1]}</span>
          <button onClick={nextMonth} className="ghost-btn w-8 h-8 rounded-full flex items-center justify-center" aria-label="下月">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>

        {/* Calendar grid */}
        <div className="w-full max-w-sm glass-card rounded-2xl p-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((d) => (<div key={d} className="text-center text-[10px] font-sans" style={{ color: "rgba(74,120,98,0.4)" }}>{d}</div>))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} className="aspect-square" />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const fortune = getFortuneForDate(day)
              const letters = getLettersForDate(day)
              const isToday = day === today
              const isSelected = day === selectedDay
              const level = fortune ? getFortuneLevel(fortune.type) : null
              const hasLetter = letters.length > 0

              return (
                <button key={day} onClick={() => setSelectedDay(day)}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all duration-300 ${isSelected ? "ring-1" : ""}`}
                  style={{ background: isSelected ? "rgba(74,120,98,0.08)" : isToday ? "rgba(212,175,55,0.04)" : "transparent", ringColor: "rgba(74,120,98,0.2)" }}>
                  <span className={`text-xs font-sans ${isToday ? "font-medium" : "font-light"}`} style={{ color: isToday ? "var(--jade)" : "rgba(44,62,54,0.6)" }}>{day}</span>
                  <div className="flex gap-0.5 mt-0.5">
                    {level && <span className="text-[7px]" style={{ color: level === "吉" ? "var(--gold)" : "rgba(140,110,80,0.5)" }}>{level}</span>}
                    {hasLetter && <span className="text-[7px]" style={{ color: "var(--gold)" }}>{"+"}</span>}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected day detail */}
        {selectedDay && (
          <div className="w-full max-w-sm mt-4 glass-card rounded-2xl p-5">
            <p className="text-[10px] font-sans tracking-wider mb-2" style={{ color: "rgba(74,120,98,0.4)" }}>{year}{"年"}{month}{"月"}{selectedDay}{"日"}</p>

            {selectedFortune ? (
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-serif" style={{ color: getFortuneLevel(selectedFortune.type) === "吉" ? "var(--gold)" : "rgba(140,110,80,0.6)" }}>{selectedFortune.type}</span>
                  <span className="text-xs font-serif" style={{ color: "rgba(44,62,54,0.5)" }}>{"第"}{selectedFortune.id}{"签 · "}{selectedFortune.title}</span>
                </div>
                <p className="text-[12px] font-serif leading-relaxed" style={{ color: "rgba(44,62,54,0.55)" }}>{selectedFortune.poem}</p>
                <p className="text-[11px] font-sans mt-2" style={{ color: "rgba(44,62,54,0.4)" }}>{selectedFortune.meaning}</p>
              </div>
            ) : (
              <p className="text-[12px] font-serif mb-3" style={{ color: "rgba(74,120,98,0.25)" }}>{"此日无签记录"}</p>
            )}

            {/* Saved letters for this date */}
            {selectedLetters.length > 0 && (
              <div className="pt-3" style={{ borderTop: "1px solid rgba(212,175,55,0.1)" }}>
                <p className="text-[10px] font-sans tracking-wider mb-2" style={{ color: "rgba(212,175,55,0.5)" }}>{"珍藏的来信"}</p>
                {selectedLetters.map((l, i) => (
                  <div key={i} className="rounded-xl px-4 py-3 mb-2" style={{ background: "rgba(212,175,55,0.03)", border: "1px solid rgba(212,175,55,0.08)" }}>
                    <p className="text-[12px] font-serif leading-relaxed whitespace-pre-line" style={{ color: "rgba(44,62,54,0.55)" }}>{l.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Month highlight */}
        {monthHighlight && (
          <div className="w-full max-w-sm mt-4 glass-card rounded-2xl p-5">
            <p className="text-[10px] font-sans tracking-wider mb-2" style={{ color: "rgba(212,175,55,0.5)" }}>{"岁月底色 · "}{year}</p>
            <p className="text-[12px] font-serif leading-relaxed" style={{ color: "rgba(44,62,54,0.5)" }}>{monthHighlight}</p>
          </div>
        )}

        {/* Stats */}
        <div className="w-full max-w-sm mt-4 flex gap-3">
          <div className="flex-1 glass-card rounded-xl p-4 text-center">
            <p className="text-2xl font-light font-serif" style={{ color: "var(--jade)" }}>{totalDraws}</p>
            <p className="text-[10px] font-sans mt-1" style={{ color: "rgba(74,120,98,0.4)" }}>{"总求签"}</p>
          </div>
          <div className="flex-1 glass-card rounded-xl p-4 text-center">
            <p className="text-2xl font-light font-serif" style={{ color: "var(--gold)" }}>{jiCount}</p>
            <p className="text-[10px] font-sans mt-1" style={{ color: "rgba(212,175,55,0.5)" }}>{"吉"}</p>
          </div>
          <div className="flex-1 glass-card rounded-xl p-4 text-center">
            <p className="text-2xl font-light font-serif" style={{ color: "rgba(140,110,80,0.5)" }}>{totalDraws - jiCount}</p>
            <p className="text-[10px] font-sans mt-1" style={{ color: "rgba(140,110,80,0.4)" }}>{"凶"}</p>
          </div>
        </div>

        {/* Hidden admin trigger */}
        <div className="mt-8">
          <button onMouseDown={handleLongPressStart} onMouseUp={handleLongPressEnd} onMouseLeave={handleLongPressEnd} onTouchStart={handleLongPressStart} onTouchEnd={handleLongPressEnd}
            className="text-[9px] font-sans tracking-wider select-none" style={{ color: "rgba(74,120,98,0.12)" }}>{"灵力管理"}</button>
        </div>

        {/* Admin panel */}
        {showAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(242,245,243,0.92)", backdropFilter: "blur(20px)" }}>
            <div className="w-full max-w-xs rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.88)", border: "1px solid rgba(74,120,98,0.1)", boxShadow: "0 16px 48px rgba(74,120,98,0.08)" }}>
              <h3 className="text-sm font-serif tracking-widest mb-5 text-center" style={{ color: "#2c3e36" }}>{"管理面板"}</h3>
              <div className="flex flex-col gap-3">
                <button onClick={() => openPromptEditor("xiaobi")} className="ghost-btn px-4 py-3 rounded-xl text-xs font-sans tracking-wider">{"编辑小碧 Prompt"}</button>
                <button onClick={() => openPromptEditor("xiaona")} className="ghost-btn px-4 py-3 rounded-xl text-xs font-sans tracking-wider" style={{ borderColor: "rgba(212,175,55,0.2)", color: "var(--gold)" }}>{"编辑小娜 Prompt"}</button>
                <div className="h-px my-1" style={{ background: "rgba(74,120,98,0.06)" }} />
                <button onClick={clearHistory} className="ghost-btn px-4 py-3 rounded-xl text-xs font-sans" style={{ borderColor: "rgba(220,60,60,0.15)", color: "rgba(220,60,60,0.6)" }}>{"清除所有数据"}</button>
                <button onClick={() => setShowAdmin(false)} className="ghost-btn px-4 py-3 rounded-xl text-xs font-sans">{"关闭"}</button>
              </div>
            </div>
          </div>
        )}

        {/* Prompt Editor (from admin) */}
        {showPromptEditor && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(242,245,243,0.95)", backdropFilter: "blur(24px)" }}>
            <div className="w-full max-w-md rounded-2xl p-5 flex flex-col gap-3" style={{ background: "rgba(255,255,255,0.88)", border: "1px solid rgba(74,120,98,0.1)", maxHeight: "80vh" }}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-serif tracking-widest" style={{ color: "#2c3e36" }}>{editingAgent === "xiaobi" ? "小碧" : "小娜"}{" Prompt"}</h3>
                <button onClick={() => setShowPromptEditor(false)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(74,120,98,0.04)", color: "rgba(74,120,98,0.4)" }} aria-label="关闭">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
              <textarea value={editingPrompt} onChange={(e) => setEditingPrompt(e.target.value)}
                className="flex-1 min-h-[200px] w-full rounded-xl p-4 text-[12px] leading-relaxed font-sans outline-none resize-none no-scrollbar"
                style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(74,120,98,0.08)", color: "#2c3e36" }} />
              <div className="flex gap-2">
                <button onClick={() => { const def = editingAgent === "xiaobi" ? DEFAULT_XIAOBI_PROMPT : DEFAULT_XIAONA_PROMPT; setEditingPrompt(def); if (typeof window !== "undefined") localStorage.setItem(`bina-prompt-${editingAgent}`, def) }}
                  className="ghost-btn flex-1 py-2.5 rounded-xl text-[11px] font-sans tracking-wider" style={{ borderColor: "rgba(212,175,55,0.2)", color: "var(--gold)" }}>{"恢复默认"}</button>
                <button onClick={saveEditingPrompt} className="flex-1 py-2.5 rounded-xl text-[11px] font-sans tracking-wider"
                  style={{ background: "rgba(74,120,98,0.08)", border: "1px solid rgba(74,120,98,0.15)", color: "var(--jade)" }}>{"保存"}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
