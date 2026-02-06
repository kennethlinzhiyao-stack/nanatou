"use client"

import { useState, useEffect } from "react"
import { getMonthWeibo, getTodayWeibo, type WeiboPost } from "@/lib/weibo-data"
import { yearSummaries } from "@/lib/year-summaries"

export function TodayInHistory() {
  const [month, setMonth] = useState(0)
  const [day, setDay] = useState(0)
  const [todayPosts, setTodayPosts] = useState<WeiboPost[]>([])
  const [monthPosts, setMonthPosts] = useState<WeiboPost[]>([])
  const [reflection, setReflection] = useState("")

  useEffect(() => {
    const now = new Date()
    const m = now.getMonth() + 1
    const d = now.getDate()
    setMonth(m)
    setDay(d)

    const exact = getTodayWeibo(m, d)
    setTodayPosts(exact)

    const monthly = getMonthWeibo(m).filter((w) => !exact.some((e) => e.content === w.content))
    setMonthPosts(monthly.slice(0, 3))

    // Pick a random year-end reflection
    const randomSummary = yearSummaries[Math.floor(Math.random() * yearSummaries.length)]
    if (randomSummary) {
      setReflection(`${randomSummary.year}年：${randomSummary.oneLiner}`)
    }
  }, [])

  const allPosts = [...todayPosts, ...monthPosts]
  if (!allPosts.length && !reflection) return null

  return (
    <section className="relative z-10 w-full max-w-lg mx-auto px-4 pb-6">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(74,120,98,0.1), transparent)" }} />
        <h2 className="text-xs font-sans tracking-[0.3em] whitespace-nowrap" style={{ color: "rgba(74,120,98,0.4)" }}>
          {"时光回响 ·"} {month}{"月"}{day}{"日"}
        </h2>
        <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(74,120,98,0.1), transparent)" }} />
      </div>

      {/* Exact day matches first */}
      {todayPosts.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] font-sans tracking-wider mb-2 ml-1" style={{ color: "rgba(212,175,55,0.6)" }}>{"那年今日"}</p>
          {todayPosts.map((post, i) => (
            <article key={`today-${i}`} className="glass-card rounded-xl px-5 py-4 mb-2 transition-all duration-500 hover:jade-glow">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-1 rounded-full" style={{ background: "var(--gold)" }} />
                <span className="text-[10px] font-sans tracking-wider" style={{ color: "rgba(212,175,55,0.6)" }}>{post.date}</span>
                <div className="flex gap-1 ml-auto">
                  {post.mood.slice(0, 2).map((m) => (
                    <span key={m} className="text-[9px] px-1.5 py-0.5 rounded-full font-sans" style={{ background: "rgba(74,120,98,0.06)", color: "rgba(74,120,98,0.45)" }}>{m}</span>
                  ))}
                </div>
              </div>
              <p className="text-[13px] leading-relaxed font-serif" style={{ color: "rgba(44,62,54,0.65)" }}>{post.content}</p>
            </article>
          ))}
        </div>
      )}

      {/* Month memories */}
      {monthPosts.length > 0 && (
        <div>
          <p className="text-[10px] font-sans tracking-wider mb-2 ml-1" style={{ color: "rgba(74,120,98,0.3)" }}>{month}{"月碎片"}</p>
          {monthPosts.map((post, i) => (
            <article key={`month-${i}`} className="glass-card rounded-xl px-5 py-4 mb-2 transition-all duration-500 hover:jade-glow">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-1 rounded-full" style={{ background: "rgba(74,120,98,0.25)" }} />
                <span className="text-[10px] font-sans tracking-wider" style={{ color: "rgba(74,120,98,0.3)" }}>{post.date}</span>
              </div>
              <p className="text-[13px] leading-relaxed font-serif" style={{ color: "rgba(44,62,54,0.55)" }}>{post.content}</p>
            </article>
          ))}
        </div>
      )}

      {/* Year-end reflection */}
      {reflection && (
        <div className="mt-4 px-4">
          <p className="text-[11px] leading-relaxed font-serif italic text-right" style={{ color: "rgba(212,175,55,0.35)", transform: "rotate(-0.5deg)" }}>
            {"—— "}{reflection}
          </p>
        </div>
      )}
    </section>
  )
}
