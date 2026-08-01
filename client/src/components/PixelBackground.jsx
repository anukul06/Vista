import { useMemo } from 'react'

function seededRandom(seed) {
  let value = seed
  return () => {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }
}

export default function PixelBackground({ starCount = 90, cloudCount = 4, seed = 1, bottomBoost = 0.35 }) {
  const stars = useMemo(() => {
    const rand = seededRandom(seed)
    const extra = Math.round(starCount * bottomBoost)
    const total = starCount + extra
    return Array.from({ length: total }, (_, i) => {
      const isLight = rand() > 0.5
      const isBottomExtra = i >= starCount
      // extra stars are weighted toward the bottom third for denser ground-level sky
      const top = isBottomExtra ? 65 + rand() * 35 : rand() * 100
      return {
        id: i,
        top,
        left: rand() * 100,
        size: isLight ? (rand() > 0.8 ? 3 : 2) : 1,
        isLight,
        delay: rand() * 3,
        duration: 2 + rand() * 3,
      }
    })
  }, [starCount, seed, bottomBoost])

  const clouds = useMemo(() => {
    const rand = seededRandom(seed + 100)
    return Array.from({ length: cloudCount }, (_, i) => ({
      id: i,
      top: 8 + rand() * 30,
      scale: 0.6 + rand() * 0.8,
      duration: 50 + rand() * 60,
      delay: -rand() * 60,
    }))
  }, [cloudCount, seed])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((s) => (
        <span
          key={s.id}
          className={`absolute animate-twinkle ${s.isLight ? 'bg-vista-cream' : 'bg-[#7f8fd4]'}`}
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            opacity: s.isLight ? 1 : 0.6,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
      {clouds.map((c) => (
        <div
          key={c.id}
          className="absolute animate-drift-slow opacity-30"
          style={{
            top: `${c.top}%`,
            animationDuration: `${c.duration}s`,
            animationDelay: `${c.delay}s`,
            transform: `scale(${c.scale})`,
          }}
        >
          <PixelCloud />
        </div>
      ))}
    </div>
  )
}

function PixelCloud() {
  return (
    <svg width="120" height="48" viewBox="0 0 120 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g fill="#ede6d6">
        <rect x="16" y="16" width="16" height="8" />
        <rect x="24" y="8" width="24" height="8" />
        <rect x="8" y="24" width="56" height="8" />
        <rect x="16" y="32" width="72" height="8" />
        <rect x="48" y="16" width="32" height="8" />
        <rect x="64" y="8" width="24" height="8" />
        <rect x="80" y="24" width="24" height="8" />
      </g>
    </svg>
  )
}
