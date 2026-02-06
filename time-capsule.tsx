"use client"

import { useState, useEffect } from "react"
import { yearSummaries } from "@/lib/year-summaries"

const capsuleLetters = [
  "亲爱的碧娜，\n\n如果此刻你正被什么事困扰着，请先深呼吸三次。\n\n然后想一想——过去那些你觉得过不去的坎，是不是都已经变成了故事？\n\n你一直都很好，只是有时候忘了而已。",
  "Dear 碧娜，\n\n你好呀，远方的我。\n\n不知道你现在在哪里，在做什么。但我知道，不管你正经历什么，你都没有忘记最初的那个自己。\n\n谢谢你一直在坚持。谢谢你偶尔脆弱但从不放弃。",
  "碧娜碧娜，\n\n别急着长大好不好？\n\n慢慢来，一步一步，你已经走了很远了。回头看看——那个哭着说「我不行」的女孩，现在多厉害啊。\n\n未来的你一定会感谢现在的你。",
  "嘿，碧娜，\n\n记得那年你说「连这猪圈都住了，我做什么事都会成功的」吗？\n\n看，你果然成功了。不是因为运气，而是因为你从来都是那个不会被打倒的人。",
]

function getSavedLetters(): { date: string; content: string }[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem("bina-saved-letters") || "[]") } catch { return [] }
}

function saveLetter(content: string) {
  if (typeof window === "undefined") return
  const letters = getSavedLetters()
  const today = new Date().toISOString().split("T")[0]
  if (!letters.some((l) => l.date === today && l.content === content)) {
    letters.push({ date: today, content })
    localStorage.setItem("bina-saved-letters", JSON.stringify(letters))
  }
}

export { getSavedLetters }

export function TimeCapsule() {
  const [isOpen, setIsOpen] = useState(false)
  const [letter, setLetter] = useState("")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const base = capsuleLetters[Math.floor(Math.random() * capsuleLetters.length)]
    const summary = yearSummaries[Math.floor(Math.random() * yearSummaries.length)]
    const extra = summary ? `\n\n——${summary.year}年的碧娜曾说：「${summary.reflection}」` : ""
    setLetter(base + extra)
  }, [])

  const handleSave = () => {
    saveLetter(letter)
    setSaved(true)
    setTimeout(() => setIsOpen(false), 800)
  }

  return (
    <>
      <div className="relative z-10 flex flex-col items-center gap-2 py-4">
        <button onClick={() => { setIsOpen(true); setSaved(false) }} className="group flex flex-col items-center gap-2.5 cursor-pointer focus:outline-none transition-all duration-500 hover:scale-105" aria-label="打开时空回信">
          <div className="w-12 h-9 rounded-sm relative overflow-hidden transition-all duration-500 group-hover:gold-glow" style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.2)" }}>
            <div className="absolute top-0 left-0 right-0 h-4" style={{ background: "linear-gradient(180deg, rgba(212,175,55,0.1) 0%, transparent 100%)", clipPath: "polygon(0 0, 50% 100%, 100% 0)" }} />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full animate-pulse-gold" style={{ background: "rgba(212,175,55,0.45)" }} />
          </div>
          <span className="text-[10px] tracking-[0.3em] font-sans" style={{ color: "rgba(212,175,55,0.4)" }}>{"时空回信"}</span>
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(242,245,243,0.88)", backdropFilter: "blur(20px)" }}
          onClick={() => setIsOpen(false)} onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)} role="dialog" aria-modal="true" aria-label="来自过去的信">
          <div className="max-w-md w-full animate-envelope-in" onClick={(e) => e.stopPropagation()} onKeyDown={() => {}}>
            <div className="relative rounded-2xl px-8 py-10" style={{ background: "rgba(255,255,255,0.92)", border: "1px solid rgba(212,175,55,0.15)", boxShadow: "0 24px 64px rgba(74,120,98,0.08)" }}>
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent 15%, rgba(212,175,55,0.3) 50%, transparent 85%)" }} />
              <p className="text-[10px] tracking-[0.35em] font-sans mb-5 text-center" style={{ color: "rgba(212,175,55,0.5)" }}>{"来自过去的碧娜"}</p>
              <p className="text-[14px] leading-loose font-serif whitespace-pre-line" style={{ color: "rgba(44,62,54,0.65)" }}>{letter}</p>
              <div className="flex justify-center mt-7">
                {saved ? (
                  <span className="text-[11px] font-sans tracking-wider" style={{ color: "rgba(212,175,55,0.6)" }}>{"已珍藏到历书"}</span>
                ) : (
                  <button onClick={handleSave} className="ghost-btn px-6 py-2 rounded-xl text-[11px] font-sans tracking-wider" style={{ borderColor: "rgba(212,175,55,0.2)", color: "var(--gold)" }}>
                    {"珍藏此信"}
                  </button>
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent 15%, rgba(212,175,55,0.15) 50%, transparent 85%)" }} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
