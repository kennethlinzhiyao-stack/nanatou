"use client"

import { useEffect, useRef } from "react"

export function SmokeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    let particles: Particle[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    class Particle {
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      opacity: number
      color: string
      life: number
      maxLife: number

      constructor(canvasW: number, canvasH: number) {
        this.x = Math.random() * canvasW
        this.y = canvasH + Math.random() * 100
        this.vx = (Math.random() - 0.5) * 0.25
        this.vy = -(Math.random() * 0.35 + 0.1)
        this.radius = Math.random() * 200 + 100
        this.opacity = 0
        this.maxLife = Math.random() * 600 + 400
        this.life = 0
        const colors = [
          "200, 220, 210",
          "190, 215, 205",
          "180, 210, 195",
          "195, 225, 210",
          "210, 230, 218",
          "185, 205, 195",
        ]
        this.color = colors[Math.floor(Math.random() * colors.length)]
      }

      update() {
        this.x += this.vx
        this.y += this.vy
        this.life++
        const progress = this.life / this.maxLife
        if (progress < 0.2) {
          this.opacity = (progress / 0.2) * 0.04
        } else if (progress > 0.6) {
          this.opacity = ((1 - progress) / 0.4) * 0.04
        }
        this.radius += 0.08
      }

      draw(drawCtx: CanvasRenderingContext2D) {
        const gradient = drawCtx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.radius,
        )
        gradient.addColorStop(0, `rgba(${this.color}, ${this.opacity})`)
        gradient.addColorStop(0.5, `rgba(${this.color}, ${this.opacity * 0.5})`)
        gradient.addColorStop(1, `rgba(${this.color}, 0)`)
        drawCtx.fillStyle = gradient
        drawCtx.beginPath()
        drawCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        drawCtx.fill()
      }

      isDead() {
        return this.life >= this.maxLife
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (Math.random() < 0.04) {
        particles.push(new Particle(canvas.width, canvas.height))
      }
      for (const p of particles) {
        p.update()
        p.draw(ctx)
      }
      particles = particles.filter((p) => !p.isDead())
      animationId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  )
}
