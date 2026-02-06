"use client"

import { useEffect, useRef } from "react"

interface ParticleGuardianProps {
  mood: "idle" | "thinking" | "speaking"
  agent?: "xiaobi" | "xiaona"
}

export function ParticleGuardian({ mood, agent = "xiaobi" }: ParticleGuardianProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const moodRef = useRef(mood)
  const agentRef = useRef(agent)

  useEffect(() => { moodRef.current = mood }, [mood])
  useEffect(() => { agentRef.current = agent }, [agent])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const W = 160, H = 150
    canvas.width = W
    canvas.height = H
    const CX = W / 2, CY = 60

    let time = 0
    let animId: number

    // Orbiting particles
    const particles: { angle: number; dist: number; speed: number; size: number; phase: number; opacity: number }[] = []
    for (let i = 0; i < 20; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        dist: 34 + Math.random() * 28,
        speed: 0.002 + Math.random() * 0.006,
        size: 0.8 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2,
        opacity: 0.08 + Math.random() * 0.18,
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, W, H)
      time += 0.016
      const currentMood = moodRef.current
      const isXiaona = agentRef.current === "xiaona"

      // Color theme
      const cr = isXiaona ? 212 : 74
      const cg = isXiaona ? 175 : 120
      const cb = isXiaona ? 55 : 98
      const col = `${cr}, ${cg}, ${cb}`

      const floatY = Math.sin(time * 1.1) * 4

      // Outer ambient glow
      const ambientSize = currentMood === "speaking" ? 58 : 50
      const ambientA = currentMood === "speaking" ? 0.1 : 0.05
      const outerGlow = ctx.createRadialGradient(CX, CY + floatY, 0, CX, CY + floatY, ambientSize)
      outerGlow.addColorStop(0, `rgba(${col}, ${ambientA + 0.03})`)
      outerGlow.addColorStop(0.6, `rgba(${col}, ${ambientA * 0.5})`)
      outerGlow.addColorStop(1, `rgba(${col}, 0)`)
      ctx.fillStyle = outerGlow
      ctx.beginPath()
      ctx.arc(CX, CY + floatY, ambientSize, 0, Math.PI * 2)
      ctx.fill()

      // Main bubble body
      const R = 26
      const breathe = 1 + Math.sin(time * 1.8) * 0.03
      const bR = R * breathe

      // Bubble gradient (glass-like)
      const bubGrad = ctx.createRadialGradient(CX - 6, CY + floatY - 6, 0, CX, CY + floatY, bR + 4)
      if (isXiaona) {
        bubGrad.addColorStop(0, "rgba(255, 248, 235, 0.65)")
        bubGrad.addColorStop(0.4, "rgba(255, 240, 215, 0.45)")
        bubGrad.addColorStop(0.8, "rgba(240, 220, 180, 0.3)")
        bubGrad.addColorStop(1, "rgba(212, 175, 55, 0.15)")
      } else {
        bubGrad.addColorStop(0, "rgba(220, 240, 230, 0.65)")
        bubGrad.addColorStop(0.4, "rgba(200, 228, 215, 0.45)")
        bubGrad.addColorStop(0.8, "rgba(170, 210, 190, 0.3)")
        bubGrad.addColorStop(1, "rgba(74, 120, 98, 0.15)")
      }
      ctx.fillStyle = bubGrad
      ctx.beginPath()
      ctx.arc(CX, CY + floatY, bR, 0, Math.PI * 2)
      ctx.fill()

      // Bubble border ring
      const ringA = 0.15 + Math.sin(time * 2) * 0.05
      ctx.strokeStyle = `rgba(${col}, ${ringA})`
      ctx.lineWidth = 0.8
      ctx.beginPath()
      ctx.arc(CX, CY + floatY, bR, 0, Math.PI * 2)
      ctx.stroke()

      // Inner highlight (top-left specular)
      const specGrad = ctx.createRadialGradient(CX - 8, CY + floatY - 8, 0, CX - 8, CY + floatY - 8, 14)
      specGrad.addColorStop(0, "rgba(255, 255, 255, 0.45)")
      specGrad.addColorStop(1, "rgba(255, 255, 255, 0)")
      ctx.fillStyle = specGrad
      ctx.beginPath()
      ctx.arc(CX - 8, CY + floatY - 8, 14, 0, Math.PI * 2)
      ctx.fill()

      // Speaking: pulsing rings
      if (currentMood === "speaking") {
        for (let w = 0; w < 3; w++) {
          const waveR = bR + 6 + w * 8 + Math.sin(time * 5 + w * 1.2) * 3
          const waveA = 0.08 - w * 0.02
          ctx.strokeStyle = `rgba(${col}, ${Math.max(0, waveA)})`
          ctx.lineWidth = 0.6
          ctx.beginPath()
          ctx.arc(CX, CY + floatY, waveR, 0, Math.PI * 2)
          ctx.stroke()
        }
      }

      // Thinking: 3 floating dots above
      if (currentMood === "thinking") {
        for (let i = 0; i < 3; i++) {
          const dotA = 0.25 + Math.sin(time * 3 + i * 1.2) * 0.15
          const dotY = CY + floatY - bR - 10 - i * 8 + Math.sin(time * 2.5 + i) * 3
          const dotR = 2 - i * 0.3
          ctx.fillStyle = `rgba(${col}, ${dotA})`
          ctx.beginPath()
          ctx.arc(CX + 12 + i * 4, dotY, dotR, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Orbiting particles
      for (const p of particles) {
        p.angle += p.speed * (currentMood === "speaking" ? 1.8 : currentMood === "thinking" ? 0.5 : 1)
        const px = CX + Math.cos(p.angle + Math.sin(time * 0.5 + p.phase) * 0.5) * p.dist
        const py = CY + floatY + Math.sin(p.angle + Math.cos(time * 0.5 + p.phase) * 0.5) * (p.dist * 0.55)
        const pa = p.opacity * (0.5 + Math.sin(time * 1.5 + p.phase) * 0.5)
        ctx.fillStyle = `rgba(${col}, ${pa})`
        ctx.beginPath()
        ctx.arc(px, py, p.size, 0, Math.PI * 2)
        ctx.fill()
      }

      // Label below
      ctx.font = "10px var(--font-inter, sans-serif)"
      ctx.textAlign = "center"
      const label = currentMood === "thinking" ? "感应中..." : isXiaona ? "小 娜" : "小 碧"
      const labelAlpha = currentMood === "thinking" ? 0.3 + Math.sin(time * 3) * 0.12 : 0.35
      ctx.fillStyle = `rgba(${col}, ${labelAlpha})`
      ctx.fillText(label, CX, 130)

      animId = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={160}
        height={150}
        className="w-[120px] h-[112px]"
        aria-label={agent === "xiaona" ? "小娜 - 你的数字分身" : "小碧 - 你的占卜守护灵"}
      />
    </div>
  )
}
