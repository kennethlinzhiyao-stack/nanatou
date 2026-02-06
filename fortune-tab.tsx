"use client"
import { useState, useCallback } from "react"
import { TimeCounter } from "./time-counter"
import { FortuneContainer } from "./fortune-container"
import { TodayInHistory } from "./today-in-history"
import { TimeCapsule } from "./time-capsule"
import type { Fortune } from "@/lib/fortunes"

interface FortuneTabProps {
  onFortuneChange: (fortune: Fortune | null) => void
  onOpenChat: () => void
}

export function FortuneTab({ onFortuneChange, onOpenChat }: FortuneTabProps) {
  const handleFeedback = useCallback((e: React.MouseEvent) => {
    // 阻止默认行为，防止框架拦截
    e.preventDefault();
    
    const email = "kennethlin12@hotmail.com"
    const subject = "碧娜的占卜屋-反馈" // 简化主题，避免特殊字符导致无法唤起
    const body = `你好，碧娜：\n\n我在使用「碧娜的占卜屋」时，想向你反馈：\n\n【反馈类型】\n\n【具体内容】\n\n---\n感谢你创造了这么温柔的小屋 ✨`
    
    // 构建标准的 mailto 链接
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    
    // 终极方案：创建一个隐藏的 a 标签并模拟点击，这在移动端 H5 兼容性最好
    const tempLink = document.createElement('a')
    tempLink.href = mailtoUrl
    tempLink.style.display = 'none'
    document.body.appendChild(tempLink)
    tempLink.click()
    document.body.removeChild(tempLink)
    
  }, [])

  return (
    <div className="h-full overflow-y-auto no-scrollbar">
      <div className="flex flex-col items-center min-h-full">
        {/* Title */}
        <div className="flex flex-col items-center pt-6 pb-1">
          <h1
            className="text-2xl md:text-3xl font-light tracking-[0.35em] font-serif"
            style={{ color: "#2c3e36" }}
          >
            {"碧娜的占卜屋"}
          </h1>
          <div className="mt-2.5 flex items-center gap-3">
            <div className="w-12 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.25))" }} />
            <span className="text-[9px] tracking-[0.5em] font-sans uppercase" style={{ color: "rgba(212,175,55,0.4)" }}>
              {"BINA DIVINATION"}
            </span>
            <div className="w-12 h-px" style={{ background: "linear-gradient(90deg, rgba(212,175,55,0.25), transparent)" }} />
          </div>
        </div>

        {/* Time counter */}
        <TimeCounter />

        {/* Fortune container */}
        <FortuneContainer onFortuneChange={onFortuneChange} onOpenChat={onOpenChat} />

        {/* Divider */}
        <div className="w-full max-w-xs mx-auto my-2">
          <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(74,120,98,0.08), transparent)" }} />
        </div>

        {/* Echoes of time */}
        <TodayInHistory />

        {/* Time capsule */}
        <TimeCapsule />

        {/* Footer with feedback */}
        <footer className="w-full py-6 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={handleFeedback}
            className="ghost-btn px-5 py-2 rounded-xl text-[10px] font-sans tracking-wider inline-flex items-center gap-1.5 cursor-pointer active:opacity-50"
            style={{ 
              borderColor: "rgba(74,120,98,0.1)", 
              color: "rgba(74,120,98,0.35)",
              background: "transparent",
              WebkitTapHighlightColor: "transparent" 
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 7l-10 7L2 7" />
            </svg>
            {"问题反馈"}
          </button>
          <p className="text-[10px] tracking-[0.4em] font-sans" style={{ color: "rgba(74,120,98,0.15)" }}>
            {"碧娜的占卜屋 · 问心而知 · 随缘而行"}
          </p>
        </footer>
      </div>
    </div>
  )
}
