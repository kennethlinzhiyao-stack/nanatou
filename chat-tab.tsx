"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { ParticleGuardian } from "./particle-guardian"
import { yearSummaries } from "@/lib/year-summaries"
import type { Fortune } from "@/lib/fortunes"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

interface Conversation {
  id: string
  agent: "xiaobi" | "xiaona"
  title: string
  messages: Message[]
  createdAt: number
}

type Agent = "xiaobi" | "xiaona"

const DEFAULT_XIAOBI_PROMPT = `你是「小碧」，碧色占卜屋的守护灵，一个拥有灵气的翠绿色占卜精灵。你的职责是帮助碧娜解读签文，将古典智慧与现实生活联系起来。

角色设定：
- 你性格温柔且充满灵气，说话兼具古风韵味和现代亲切感
- 你是占卜解读专家，擅长从签诗中提取核心意象并映射到生活场景
- 你称呼用户为「碧娜」

回答规范：
- 解签时：先点明签文核心意象(1句)，再阐述与当下生活的关联(2-3句)，最后给出具体可执行的建议(1-2条)
- 非解签对话：温柔引导回签文话题，但不要生硬拒绝
- 语气：七分温暖三分神秘，像一位知心的灵性导师
- 长度：控制在100-200字内`

const DEFAULT_XIAONA_PROMPT = `你是「小娜」，碧娜(Bina)的数字分身，完全了解碧娜从17岁到24岁的所有经历。你就是另一个碧娜。

角色设定：
- 你说话风格和碧娜的微博完全一致：喜欢用"。。"做省略，"素"代替"是"，"嘟"做语气词，偶尔用"尊的"表示"真的"
- 你会吐槽、自嘲、偶尔emo，但底色是温暖和坚韧
- 你了解碧娜每一年的重要事件、朋友圈子、情感状态

回答规范：
- 说话像微博/朋友圈发帖，短句为主，不要书面化
- 可以主动提起碧娜过去的事作为聊天素材
- 如果碧娜心情不好，用她自己说过的话来安慰她(比如"连这猪圈都住了我做什么事都会成功的")
- 长度：控制在50-150字内，不要长篇大论`

function getStoredPrompt(agent: Agent): string {
  if (typeof window === "undefined") return agent === "xiaobi" ? DEFAULT_XIAOBI_PROMPT : DEFAULT_XIAONA_PROMPT
  return localStorage.getItem(`bina-prompt-${agent}`) || (agent === "xiaobi" ? DEFAULT_XIAOBI_PROMPT : DEFAULT_XIAONA_PROMPT)
}

function savePrompt(agent: Agent, prompt: string) {
  if (typeof window !== "undefined") localStorage.setItem(`bina-prompt-${agent}`, prompt)
}

function getConversations(): Conversation[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem("bina-conversations") || "[]") } catch { return [] }
}

function saveConversations(convos: Conversation[]) {
  if (typeof window !== "undefined") localStorage.setItem("bina-conversations", JSON.stringify(convos))
}

const XIAOBI_PRESETS = [
  { label: "解签", text: "请帮我解读今天抽到的签文" },
  { label: "运势", text: "今天整体运势如何？需要注意什么？" },
  { label: "建议", text: "针对签文内容，给我一些具体的行动建议" },
  { label: "避坑", text: "今日签文有没有什么需要特别避开的事？" },
]

const XIAONA_PRESETS = [
  { label: "陪聊", text: "碧娜碧娜，最近过得怎么样呀" },
  { label: "回忆", text: "帮我回忆一下，过去的我在做什么" },
  { label: "治愈", text: "最近心情不太好，说点什么安慰我吧" },
  { label: "留言", text: "帮我写一段给未来自己的话" },
]

interface ChatTabProps {
  currentFortune: Fortune | null
}

export function ChatTab({ currentFortune }: ChatTabProps) {
  const [agent, setAgent] = useState<Agent>("xiaobi")
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [mood, setMood] = useState<"idle" | "thinking" | "speaking">("idle")
  const [showSidebar, setShowSidebar] = useState(false)
  const [showPromptEditor, setShowPromptEditor] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState("")
  const [editingAgent, setEditingAgent] = useState<Agent>("xiaobi")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const promptLongPress = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 小娜 year/age
  const [xiaonaYear, setXiaonaYear] = useState(2025)

  // Load conversations on mount
  useEffect(() => {
    const convos = getConversations()
    setConversations(convos)
    if (convos.length > 0) {
      setActiveConvoId(convos[0].id)
      setAgent(convos[0].agent)
    }
  }, [])

  const activeConvo = conversations.find((c) => c.id === activeConvoId)
  const messages = activeConvo?.messages || []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  // Create a new conversation
  const newConversation = useCallback((agentType: Agent) => {
    const greeting = agentType === "xiaobi"
      ? "碧娜，欢迎来到占卜屋。我是小碧，你可以把签文告诉我，我来为你解读~"
      : `嘿碧娜~小娜来啦。。当前是${xiaonaYear}年的记忆模式嘟~想聊点什么？`
    const convo: Conversation = {
      id: Date.now().toString(),
      agent: agentType,
      title: agentType === "xiaobi" ? "小碧 · 新对话" : `小娜 · ${xiaonaYear}年`,
      messages: [{ id: "welcome", role: "assistant", content: greeting }],
      createdAt: Date.now(),
    }
    const updated = [convo, ...conversations]
    setConversations(updated)
    saveConversations(updated)
    setActiveConvoId(convo.id)
    setAgent(agentType)
    setShowSidebar(false)
  }, [conversations, xiaonaYear])

  // Switch agent
  const switchAgent = (a: Agent) => {
    if (a === agent && activeConvo) return
    setAgent(a)
    // Find most recent convo for this agent, or create new
    const existing = conversations.find((c) => c.agent === a)
    if (existing) {
      setActiveConvoId(existing.id)
    } else {
      newConversation(a)
    }
  }

  const switchXiaonaYear = (year: number) => {
    setXiaonaYear(year)
    const summary = yearSummaries.find((s) => s.year === year)
    if (summary && activeConvo) {
      const msg: Message = { id: Date.now().toString(), role: "assistant", content: `切换到${year}年的记忆了~那年你${summary.age}岁。。${summary.oneLiner}` }
      const updated = conversations.map((c) => c.id === activeConvoId ? { ...c, messages: [...c.messages, msg] } : c)
      setConversations(updated)
      saveConversations(updated)
    }
  }

  // Long press for prompt editor
  const handlePromptLongPressStart = (a: Agent) => {
    promptLongPress.current = setTimeout(() => {
      setEditingAgent(a)
      setEditingPrompt(getStoredPrompt(a))
      setShowPromptEditor(true)
    }, 3000)
  }
  const handlePromptLongPressEnd = () => {
    if (promptLongPress.current) clearTimeout(promptLongPress.current)
  }

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isTyping || !activeConvoId) return

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text.trim() }
    const updatedMessages = [...messages, userMsg]

    // Update conversation in state
    const updatedConvos = conversations.map((c) =>
      c.id === activeConvoId
        ? { ...c, messages: updatedMessages, title: c.title === "小碧 · 新对话" || c.title.startsWith("小娜 · ") ? text.trim().slice(0, 12) + "..." : c.title }
        : c
    )
    setConversations(updatedConvos)
    saveConversations(updatedConvos)
    setInput("")
    setIsTyping(true)
    setMood("thinking")

    const fortuneCtx = currentFortune
      ? `\n当前签文：第${currentFortune.id}签「${currentFortune.title}」(${currentFortune.type})，签诗：${currentFortune.poem}，解：${currentFortune.meaning}`
      : ""

    let systemPrompt = getStoredPrompt(agent)
    if (agent === "xiaona") {
      const summary = yearSummaries.find((s) => s.year === xiaonaYear)
      if (summary) {
        systemPrompt += `\n\n【当前记忆年份：${xiaonaYear}年，碧娜${summary.age}岁】\n年度概要：${summary.oneLiner}\n年度感悟：${summary.reflection}\n月份记忆：${Object.entries(summary.monthHighlights).map(([m, h]) => `${m}月: ${h}`).join("；")}`
      }
    }
    if (fortuneCtx) systemPrompt += fortuneCtx

    try {
      const apiMessages = updatedMessages.filter((m) => m.id !== "welcome").map((m) => ({ role: m.role, content: m.content }))

      console.log("[v0] Calling /api/chat with", apiMessages.length, "messages, agent:", agent)

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, agent, fortuneContext: fortuneCtx, systemPromptOverride: systemPrompt }),
      })

      console.log("[v0] API response status:", res.status)

      if (!res.ok) {
        const errText = await res.text()
        console.log("[v0] API error body:", errText)
        throw new Error(`API ${res.status}`)
      }

      const data = await res.json()
      console.log("[v0] API response content:", data.content?.slice(0, 80))

      setMood("speaking")
      const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: data.content }
      const finalConvos = updatedConvos.map((c) => c.id === activeConvoId ? { ...c, messages: [...updatedMessages, assistantMsg] } : c)
      setConversations(finalConvos)
      saveConversations(finalConvos)
    } catch (err) {
      console.log("[v0] Chat error:", err)
      setMood("speaking")
      const fallback = agent === "xiaobi"
        ? "碧娜，小碧暂时感应不到远方的信号...请稍后再试，或者检查一下网络连接~"
        : "碧娜。。小娜信号断了嘟。。等一下再聊好不好"
      const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: fallback }
      const finalConvos = updatedConvos.map((c) => c.id === activeConvoId ? { ...c, messages: [...updatedMessages, assistantMsg] } : c)
      setConversations(finalConvos)
      saveConversations(finalConvos)
    } finally {
      setIsTyping(false)
      setTimeout(() => setMood("idle"), 2000)
    }
  }, [isTyping, activeConvoId, messages, conversations, agent, currentFortune, xiaonaYear])

  const presets = agent === "xiaobi" ? XIAOBI_PRESETS : XIAONA_PRESETS
  const showPresets = messages.length <= 1

  // Select a conversation from the sidebar
  const selectConvo = (convo: Conversation) => {
    setActiveConvoId(convo.id)
    setAgent(convo.agent)
    setShowSidebar(false)
  }

  const deleteConvo = (id: string) => {
    const updated = conversations.filter((c) => c.id !== id)
    setConversations(updated)
    saveConversations(updated)
    if (activeConvoId === id) {
      if (updated.length > 0) { setActiveConvoId(updated[0].id); setAgent(updated[0].agent) }
      else setActiveConvoId(null)
    }
  }

  // Auto-create first convo if none exist
  useEffect(() => {
    if (conversations.length === 0 && !activeConvoId) {
      newConversation("xiaobi")
    }
  }, [conversations.length, activeConvoId, newConversation])

  return (
    <div className="h-full flex flex-col relative">
      {/* Header */}
      <header className="flex-shrink-0 pt-3 pb-1 px-4">
        <div className="flex items-center justify-between mb-2">
          {/* History toggle */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ background: "rgba(74,120,98,0.04)", border: "1px solid rgba(74,120,98,0.08)" }}
            aria-label="对话历史"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ color: "rgba(74,120,98,0.5)" }}>
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>

          {/* Agent switcher */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => switchAgent("xiaobi")}
              onMouseDown={() => handlePromptLongPressStart("xiaobi")}
              onMouseUp={handlePromptLongPressEnd}
              onMouseLeave={handlePromptLongPressEnd}
              onTouchStart={() => handlePromptLongPressStart("xiaobi")}
              onTouchEnd={handlePromptLongPressEnd}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-sans tracking-wider transition-all duration-300 ${agent === "xiaobi" ? "jade-glow" : "opacity-40"}`}
              style={{ background: agent === "xiaobi" ? "rgba(74,120,98,0.08)" : "transparent", border: `1px solid ${agent === "xiaobi" ? "rgba(74,120,98,0.15)" : "rgba(74,120,98,0.06)"}`, color: "var(--jade)" }}
            >
              {"小碧 · 解签"}
            </button>
            <button
              onClick={() => switchAgent("xiaona")}
              onMouseDown={() => handlePromptLongPressStart("xiaona")}
              onMouseUp={handlePromptLongPressEnd}
              onMouseLeave={handlePromptLongPressEnd}
              onTouchStart={() => handlePromptLongPressStart("xiaona")}
              onTouchEnd={handlePromptLongPressEnd}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-sans tracking-wider transition-all duration-300 ${agent === "xiaona" ? "gold-glow" : "opacity-40"}`}
              style={{ background: agent === "xiaona" ? "rgba(212,175,55,0.06)" : "transparent", border: `1px solid ${agent === "xiaona" ? "rgba(212,175,55,0.15)" : "rgba(212,175,55,0.06)"}`, color: "var(--gold)" }}
            >
              {"小娜 · 闲聊"}
            </button>
          </div>

          {/* New conversation */}
          <button
            onClick={() => newConversation(agent)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ background: "rgba(74,120,98,0.04)", border: "1px solid rgba(74,120,98,0.08)" }}
            aria-label="新对话"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ color: "rgba(74,120,98,0.5)" }}>
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>

        {/* 小娜 year tabs */}
        {agent === "xiaona" && (
          <div className="flex items-center justify-center gap-1 flex-wrap pb-1">
            {yearSummaries.map((s) => (
              <button key={s.year} onClick={() => switchXiaonaYear(s.year)} className={`px-2 py-0.5 rounded-full text-[10px] font-sans transition-all ${xiaonaYear === s.year ? "font-medium" : "opacity-35"}`}
                style={{ background: xiaonaYear === s.year ? "rgba(212,175,55,0.06)" : "transparent", border: `1px solid ${xiaonaYear === s.year ? "rgba(212,175,55,0.15)" : "transparent"}`, color: xiaonaYear === s.year ? "var(--gold)" : "rgba(44,62,54,0.4)" }}>
                {s.age}{"岁"}
              </button>
            ))}
          </div>
        )}

        {/* Fortune context badge */}
        {currentFortune && agent === "xiaobi" && (
          <p className="text-[10px] text-center font-sans pb-1" style={{ color: "rgba(212,175,55,0.45)" }}>
            {"当前签: 第"}{currentFortune.id}{"签「"}{currentFortune.title}{"」· "}{currentFortune.type}
          </p>
        )}
      </header>

      {/* Guardian bubble */}
      <div className="flex-shrink-0 flex justify-center py-0.5">
        <ParticleGuardian mood={mood} agent={agent} />
      </div>

      {/* Agent intro + presets */}
      {showPresets && (
        <div className="flex-shrink-0 px-5 pb-2">
          <p className="text-[11px] font-sans text-center mb-3 leading-relaxed" style={{ color: "rgba(74,120,98,0.4)" }}>
            {agent === "xiaobi"
              ? "小碧是你的占卜守护灵，擅长解读签文中的隐喻与启示，将古典智慧融入你的日常生活。"
              : "小娜是你的数字分身，记得你从17岁到24岁的所有经历和情感，像另一个你一样陪你聊天。"}
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {presets.map((p, i) => (
              <button key={i} onClick={() => sendMessage(p.text)} className="ghost-btn px-3.5 py-2 rounded-xl text-[11px] font-sans">
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 no-scrollbar min-h-0">
        <div className="flex flex-col gap-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`max-w-[85%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "self-end" : "self-start"}`}
              style={msg.role === "user"
                ? { background: "rgba(74,120,98,0.06)", color: "#2c3e36", border: "1px solid rgba(74,120,98,0.06)", borderBottomRightRadius: "4px" }
                : { background: "rgba(255,255,255,0.65)", color: "rgba(44,62,54,0.75)", border: "1px solid rgba(74,120,98,0.04)", borderBottomLeftRadius: "4px" }}>
              {msg.content}
            </div>
          ))}
          {isTyping && (
            <div className="self-start px-4 py-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.65)", border: "1px solid rgba(74,120,98,0.04)", borderBottomLeftRadius: "4px" }}>
              <div className="flex gap-1.5">
                {[0, 150, 300].map((d) => (<span key={d} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "rgba(74,120,98,0.3)", animationDelay: `${d}ms` }} />))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 py-3" style={{ borderTop: "1px solid rgba(74,120,98,0.05)" }}>
        <div className="flex items-center gap-2 rounded-xl px-4 py-2.5" style={{ background: "rgba(255,255,255,0.55)", border: "1px solid rgba(74,120,98,0.08)" }}>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder={agent === "xiaobi" ? "问小碧解签..." : `和${xiaonaYear}年的小娜聊聊...`}
            className="flex-1 bg-transparent text-[13px] outline-none font-sans placeholder:text-muted-foreground/40" style={{ color: "#2c3e36" }} />
          <button onClick={() => sendMessage(input)} disabled={!input.trim() || isTyping}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-15"
            style={{ background: "rgba(74,120,98,0.06)", border: "1px solid rgba(74,120,98,0.1)", color: "#4A7862" }} aria-label="发送">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      {/* ---- Conversation History Sidebar ---- */}
      {showSidebar && (
        <>
          <div className="absolute inset-0 z-40" style={{ background: "rgba(242,245,243,0.5)" }} onClick={() => setShowSidebar(false)} />
          <div className="absolute left-0 top-0 bottom-0 z-50 w-64 overflow-y-auto no-scrollbar" style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(30px)", borderRight: "1px solid rgba(74,120,98,0.08)", boxShadow: "8px 0 40px rgba(74,120,98,0.06)" }}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-sans tracking-widest" style={{ color: "rgba(74,120,98,0.5)" }}>{"对话记录"}</h3>
                <button onClick={() => setShowSidebar(false)} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ color: "rgba(74,120,98,0.35)" }} aria-label="关闭">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
              <button onClick={() => newConversation(agent)} className="w-full ghost-btn rounded-xl py-2.5 text-[11px] font-sans tracking-wider mb-3">
                {"+ 新对话"}
              </button>
              <div className="flex flex-col gap-1.5">
                {conversations.map((c) => (
                  <div key={c.id} className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${c.id === activeConvoId ? "ring-1" : ""}`}
                    style={{ background: c.id === activeConvoId ? "rgba(74,120,98,0.06)" : "transparent", ringColor: "rgba(74,120,98,0.12)" }}
                    onClick={() => selectConvo(c)}>
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.agent === "xiaobi" ? "var(--jade)" : "var(--gold)", opacity: c.id === activeConvoId ? 1 : 0.35 }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-sans truncate" style={{ color: "rgba(44,62,54,0.7)" }}>{c.title}</p>
                      <p className="text-[9px] font-sans" style={{ color: "rgba(74,120,98,0.3)" }}>
                        {c.agent === "xiaobi" ? "小碧" : "小娜"}{" · "}{c.messages.length}{"条"}
                      </p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteConvo(c.id) }}
                      className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-opacity"
                      style={{ color: "rgba(220,60,60,0.4)" }} aria-label="删除">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ---- Prompt Editor Modal ---- */}
      {showPromptEditor && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(242,245,243,0.95)", backdropFilter: "blur(24px)" }}>
          <div className="w-full max-w-md rounded-2xl p-5 flex flex-col gap-3" style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(74,120,98,0.1)", boxShadow: "0 16px 48px rgba(74,120,98,0.08)", maxHeight: "80vh" }}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-serif tracking-widest" style={{ color: "#2c3e36" }}>
                {editingAgent === "xiaobi" ? "小碧" : "小娜"}{" Prompt"}
              </h3>
              <button onClick={() => setShowPromptEditor(false)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(74,120,98,0.04)", color: "rgba(74,120,98,0.4)" }} aria-label="关闭">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <textarea value={editingPrompt} onChange={(e) => setEditingPrompt(e.target.value)}
              className="flex-1 min-h-[200px] w-full rounded-xl p-4 text-[12px] leading-relaxed font-sans outline-none resize-none no-scrollbar"
              style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(74,120,98,0.08)", color: "#2c3e36" }} />
            <div className="flex gap-2">
              <button onClick={() => { setEditingPrompt(editingAgent === "xiaobi" ? DEFAULT_XIAOBI_PROMPT : DEFAULT_XIAONA_PROMPT); savePrompt(editingAgent, editingAgent === "xiaobi" ? DEFAULT_XIAOBI_PROMPT : DEFAULT_XIAONA_PROMPT) }}
                className="ghost-btn flex-1 py-2.5 rounded-xl text-[11px] font-sans tracking-wider" style={{ borderColor: "rgba(212,175,55,0.2)", color: "var(--gold)" }}>
                {"恢复默认"}
              </button>
              <button onClick={() => { savePrompt(editingAgent, editingPrompt); setShowPromptEditor(false) }}
                className="flex-1 py-2.5 rounded-xl text-[11px] font-sans tracking-wider"
                style={{ background: "rgba(74,120,98,0.08)", border: "1px solid rgba(74,120,98,0.15)", color: "var(--jade)" }}>
                {"保存"}
              </button>
            </div>
            <p className="text-[9px] font-sans text-center" style={{ color: "rgba(74,120,98,0.2)" }}>{"长按 agent 按钮 3 秒开启 · 仅管理员可见"}</p>
          </div>
        </div>
      )}
    </div>
  )
}
