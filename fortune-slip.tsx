"use client"

import { splitPoemLines, type Fortune } from "@/lib/fortunes"

interface FortuneSlipProps {
  fortune: Fortune
  show: boolean
  onAccept: () => void
  onReroll: () => void
  onChat: () => void
  canReroll: boolean
}

function getTypeStyle(type: Fortune["type"]) {
  switch (type) {
    case "上上":
      return { accent: "rgba(212, 175, 55, 0.8)", glow: "rgba(212, 175, 55, 0.12)", bg: "rgba(212, 175, 55, 0.05)", label: "上上签" }
    case "上签":
      return { accent: "rgba(74, 120, 98, 0.8)", glow: "rgba(74, 120, 98, 0.08)", bg: "rgba(74, 120, 98, 0.04)", label: "上签" }
    case "中平":
      return { accent: "rgba(100, 120, 110, 0.7)", glow: "rgba(100, 120, 110, 0.06)", bg: "rgba(100, 120, 110, 0.03)", label: "中平签" }
    case "下签":
      return { accent: "rgba(140, 110, 80, 0.6)", glow: "rgba(140, 110, 80, 0.05)", bg: "rgba(140, 110, 80, 0.03)", label: "下签" }
  }
}

export function FortuneSlip({ fortune, show, onAccept, onReroll, onChat, canReroll }: FortuneSlipProps) {
  const style = getTypeStyle(fortune.type)
  const lines = splitPoemLines(fortune.poem)

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto no-scrollbar transition-all duration-700 ${
        show ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      style={{ background: "rgba(242, 245, 243, 0.92)", backdropFilter: "blur(20px)" }}
    >
      <div className="min-h-full flex items-center justify-center px-5 py-10">
        <div
          className={`relative max-w-[340px] w-full transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            show ? "scale-100 translate-y-0 rotate-0" : "scale-50 translate-y-24 rotate-3"
          }`}
          style={{ transformOrigin: "center bottom" }}
        >
          {/* The jade slip card -- buttons are INSIDE */}
          <div
            className="relative overflow-hidden rounded-2xl"
            style={{
              background: "linear-gradient(170deg, rgba(255,255,255,0.97) 0%, rgba(245,250,248,0.98) 50%, rgba(255,255,255,0.97) 100%)",
              backdropFilter: "blur(40px)",
              border: `1px solid ${style.accent}25`,
              boxShadow: `0 24px 64px rgba(74,120,98,0.12), 0 4px 16px rgba(74,120,98,0.06), 0 0 80px ${style.glow}`,
            }}
          >
            {/* Gold shimmer line at top */}
            <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent 10%, ${style.accent} 50%, transparent 90%)` }} />

            {/* Top ornament */}
            <div className="flex justify-center pt-7">
              <div className="w-20 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)" }} />
            </div>

            {/* Fortune number */}
            <div className="flex justify-center mt-3">
              <span className="text-[10px] tracking-[0.6em] font-sans" style={{ color: "rgba(212,175,55,0.45)" }}>
                {"第 "}{fortune.id}{" 签"}
              </span>
            </div>

            {/* Type badge */}
            <div className="flex justify-center mt-3">
              <span
                className="px-5 py-1.5 rounded-full text-[11px] tracking-[0.4em] font-serif"
                style={{ color: style.accent, border: `1px solid ${style.accent}30`, background: style.bg }}
              >
                {style.label}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-center text-xl font-light mt-4 font-serif tracking-widest" style={{ color: "#2c3e36" }}>
              {fortune.title}
            </h2>

            {/* Poem -- one line per phrase */}
            <div className="mx-8 mt-5 py-4" style={{ borderTop: "1px solid rgba(212,175,55,0.12)", borderBottom: "1px solid rgba(212,175,55,0.12)" }}>
              <div className="flex flex-col items-center gap-1">
                {lines.map((line, i) => (
                  <p key={i} className="text-sm leading-relaxed font-serif text-center" style={{ color: "rgba(44,62,54,0.65)" }}>
                    {line}
                  </p>
                ))}
              </div>
            </div>

            {/* Meaning */}
            <div className="px-8 mt-4">
              <p className="text-[13px] leading-relaxed font-sans text-center" style={{ color: "rgba(44,62,54,0.5)" }}>
                <span className="text-xs mr-2" style={{ color: "var(--gold)" }}>{"解曰"}</span>
                {fortune.meaning}
              </p>
            </div>

            {/* === Three ghost action buttons INSIDE the card === */}
            <div className="flex gap-2.5 justify-center flex-wrap px-6 mt-6 mb-2">
              <button
                onClick={onAccept}
                className="flex-1 min-w-[80px] py-2.5 rounded-xl text-[12px] font-sans tracking-wider transition-all duration-300"
                style={{ background: "rgba(74,120,98,0.06)", border: "1px solid rgba(74,120,98,0.15)", color: "var(--jade)" }}
              >
                {"收下此签"}
              </button>
              {canReroll && (
                <button
                  onClick={onReroll}
                  className="flex-1 min-w-[80px] py-2.5 rounded-xl text-[12px] font-sans tracking-wider transition-all duration-300"
                  style={{ background: "rgba(74,120,98,0.03)", border: "1px solid rgba(74,120,98,0.12)", color: "var(--jade)" }}
                >
                  {"废弃重抽"}
                </button>
              )}
              <button
                onClick={onChat}
                className="flex-1 min-w-[80px] py-2.5 rounded-xl text-[12px] font-sans tracking-wider transition-all duration-300"
                style={{ background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.2)", color: "var(--gold)" }}
              >
                {"对话解签"}
              </button>
            </div>

            {/* Bottom ornament */}
            <div className="flex justify-center py-4">
              <div className="w-20 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.15), transparent)" }} />
            </div>

            <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent 10%, ${style.accent}40 50%, transparent 90%)` }} />
          </div>
        </div>
      </div>
    </div>
  )
}
