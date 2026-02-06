// Web Audio API synthesized sound effects — no external files needed

let audioCtx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext()
  if (audioCtx.state === "suspended") audioCtx.resume()
  return audioCtx
}

/**
 * Bamboo sticks rattling in a fortune jar.
 * Layered short noise bursts with band-pass filter to simulate
 * wooden / bamboo collision clusters.
 */
export function playShakeSound() {
  try {
    const ctx = getCtx()
    const duration = 1.1
    const now = ctx.currentTime

    // Master gain
    const master = ctx.createGain()
    master.gain.setValueAtTime(0.35, now)
    master.connect(ctx.destination)

    // Create 14 rapid "clack" bursts at random offsets
    for (let i = 0; i < 14; i++) {
      const t = now + (i / 14) * duration + (Math.random() * 0.04)
      const len = 0.03 + Math.random() * 0.04

      // Noise source
      const bufferSize = Math.ceil(ctx.sampleRate * len)
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let j = 0; j < bufferSize; j++) {
        data[j] = (Math.random() * 2 - 1) * 0.8
      }
      const src = ctx.createBufferSource()
      src.buffer = buffer

      // Band-pass to make it sound woody
      const bp = ctx.createBiquadFilter()
      bp.type = "bandpass"
      bp.frequency.setValueAtTime(1800 + Math.random() * 1200, t)
      bp.Q.setValueAtTime(2 + Math.random() * 3, t)

      // Envelope
      const env = ctx.createGain()
      env.gain.setValueAtTime(0, t)
      env.gain.linearRampToValueAtTime(0.6 + Math.random() * 0.4, t + 0.003)
      env.gain.exponentialRampToValueAtTime(0.001, t + len)

      src.connect(bp).connect(env).connect(master)
      src.start(t)
      src.stop(t + len)
    }

    // Low rumble undertone (the jar body resonance)
    const rumbleLen = duration * 0.9
    const rumbleBuf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * rumbleLen), ctx.sampleRate)
    const rumbleData = rumbleBuf.getChannelData(0)
    for (let j = 0; j < rumbleData.length; j++) {
      rumbleData[j] = (Math.random() * 2 - 1)
    }
    const rumbleSrc = ctx.createBufferSource()
    rumbleSrc.buffer = rumbleBuf
    const lp = ctx.createBiquadFilter()
    lp.type = "lowpass"
    lp.frequency.setValueAtTime(300, now)
    const rumbleEnv = ctx.createGain()
    rumbleEnv.gain.setValueAtTime(0, now)
    rumbleEnv.gain.linearRampToValueAtTime(0.12, now + 0.1)
    rumbleEnv.gain.setValueAtTime(0.1, now + rumbleLen * 0.7)
    rumbleEnv.gain.exponentialRampToValueAtTime(0.001, now + rumbleLen)
    rumbleSrc.connect(lp).connect(rumbleEnv).connect(master)
    rumbleSrc.start(now)
    rumbleSrc.stop(now + rumbleLen)
  } catch {
    // Audio not available — silent fallback
  }
}

/**
 * A clear, bright "ding" — a fortune stick emerging and being revealed.
 * Combines a metallic chime (sine + overtone) with a soft wind sweep.
 */
export function playRevealSound() {
  try {
    const ctx = getCtx()
    const now = ctx.currentTime

    const master = ctx.createGain()
    master.gain.setValueAtTime(0.3, now)
    master.connect(ctx.destination)

    // Main chime tone (C6 ≈ 1047 Hz)
    const osc1 = ctx.createOscillator()
    osc1.type = "sine"
    osc1.frequency.setValueAtTime(1047, now)
    const g1 = ctx.createGain()
    g1.gain.setValueAtTime(0, now)
    g1.gain.linearRampToValueAtTime(0.5, now + 0.01)
    g1.gain.exponentialRampToValueAtTime(0.001, now + 1.2)
    osc1.connect(g1).connect(master)
    osc1.start(now)
    osc1.stop(now + 1.3)

    // Overtone (E6 ≈ 1319 Hz) — slight shimmer
    const osc2 = ctx.createOscillator()
    osc2.type = "sine"
    osc2.frequency.setValueAtTime(1319, now)
    const g2 = ctx.createGain()
    g2.gain.setValueAtTime(0, now)
    g2.gain.linearRampToValueAtTime(0.2, now + 0.01)
    g2.gain.exponentialRampToValueAtTime(0.001, now + 0.9)
    osc2.connect(g2).connect(master)
    osc2.start(now)
    osc2.stop(now + 1.0)

    // Second overtone (G6 ≈ 1568 Hz) — sparkle
    const osc3 = ctx.createOscillator()
    osc3.type = "sine"
    osc3.frequency.setValueAtTime(1568, now + 0.05)
    const g3 = ctx.createGain()
    g3.gain.setValueAtTime(0, now + 0.05)
    g3.gain.linearRampToValueAtTime(0.12, now + 0.06)
    g3.gain.exponentialRampToValueAtTime(0.001, now + 0.7)
    osc3.connect(g3).connect(master)
    osc3.start(now + 0.05)
    osc3.stop(now + 0.8)

    // Soft wind sweep (filtered noise rising)
    const windLen = 0.6
    const windBuf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * windLen), ctx.sampleRate)
    const windData = windBuf.getChannelData(0)
    for (let j = 0; j < windData.length; j++) {
      windData[j] = (Math.random() * 2 - 1)
    }
    const windSrc = ctx.createBufferSource()
    windSrc.buffer = windBuf
    const hp = ctx.createBiquadFilter()
    hp.type = "highpass"
    hp.frequency.setValueAtTime(3000, now)
    hp.frequency.linearRampToValueAtTime(6000, now + windLen)
    const windG = ctx.createGain()
    windG.gain.setValueAtTime(0, now)
    windG.gain.linearRampToValueAtTime(0.06, now + 0.15)
    windG.gain.exponentialRampToValueAtTime(0.001, now + windLen)
    windSrc.connect(hp).connect(windG).connect(master)
    windSrc.start(now)
    windSrc.stop(now + windLen)
  } catch {
    // Audio not available — silent fallback
  }
}
