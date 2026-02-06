"use client"

import { useEffect, useState } from "react"

const BIRTH_DATE = new Date("2001-02-03T00:00:00")

function calculateDays() {
  const now = new Date()
  const diff = now.getTime() - BIRTH_DATE.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function TimeCounter() {
  const [days, setDays] = useState(calculateDays)

  useEffect(() => {
    const interval = setInterval(() => {
      setDays(calculateDays())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const digits = days.toLocaleString().split("")

  return (
    <header className="relative z-10 flex flex-col items-center gap-3 pt-6 pb-4">
      <p
        className="text-xs tracking-[0.5em] font-sans animate-breathe"
        style={{ color: "rgba(74, 120, 98, 0.45)" }}
      >
        {"碧娜来到这个世界的"}
      </p>
      <div className="flex items-baseline gap-0.5">
        {digits.map((d, i) => (
          <span
            key={i}
            className={`font-serif tabular-nums ${d === "," ? "text-lg mx-0.5" : "text-4xl md:text-5xl"}`}
            style={{
              color: d === "," ? "rgba(212, 175, 55, 0.4)" : "#2c3e36",
              fontWeight: 300,
              letterSpacing: "0.05em",
            }}
          >
            {d}
          </span>
        ))}
        <span
          className="text-base font-light ml-2 tracking-widest"
          style={{ color: "rgba(74, 120, 98, 0.4)" }}
        >
          天
        </span>
      </div>
      <div
        className="w-24 h-px mt-1"
        style={{ background: "linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.2), transparent)" }}
      />
    </header>
  )
}
