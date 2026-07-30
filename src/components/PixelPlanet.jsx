import { useMemo } from 'react'

const PALETTES = {
  earth: {
    ocean: '#1d3fae',
    ocean2: '#163388',
    land: ['#3f7a3f', '#a6672f', '#8a3a2a'],
    cloud: '#eef1fb',
    cloud2: '#c7cdec',
    rim: '#7fa3ff',
    moonBase: '#9a9aa8',
    moonDark: '#65657a',
  },
  rust: {
    ocean: '#7a2e1d',
    ocean2: '#5c2115',
    land: ['#c96f2e', '#e8b64c', '#8a3a2a'],
    cloud: '#f4e3c8',
    cloud2: '#d9b98f',
    rim: '#ffb066',
    moonBase: '#c98a5f',
    moonDark: '#8a5638',
  },
  violet: {
    ocean: '#2e1a5c',
    ocean2: '#221244',
    land: ['#5a3f82', '#3f7a5f', '#a63d40'],
    cloud: '#e8ddf4',
    cloud2: '#c7a9e0',
    rim: '#b98be0',
    moonBase: '#8f7fae',
    moonDark: '#5c4f7a',
  },
}

function generateMoon({ size, seed, palette, lightAngle }) {
  const cx = (size - 1) / 2
  const cy = (size - 1) / 2
  const R = size / 2 - 0.5
  const pixels = []

  const craters = [
    { x: cx - R * 0.35, y: cy - R * 0.3, r: R * 0.3 },
    { x: cx + R * 0.3, y: cy + R * 0.15, r: R * 0.22 },
    { x: cx + R * 0.05, y: cy - R * 0.45, r: R * 0.16 },
  ]

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx
      const dy = y - cy
      const r = Math.sqrt(dx * dx + dy * dy)
      if (r > R) continue

      let color = palette.moonBase
      for (const c of craters) {
        const cd = Math.sqrt((x - c.x) ** 2 + (y - c.y) ** 2)
        if (cd < c.r) {
          color = palette.moonDark
          break
        }
      }

      const lightDx = Math.cos(lightAngle)
      const lightDy = Math.sin(lightAngle)
      const lightAmount = (dx * lightDx + dy * lightDy) / R
      const shade = 0.5 + 0.55 * Math.max(-1, Math.min(1, lightAmount))
      const isRim = r > R - 1
      pixels.push({ x, y, color, shade: isRim ? Math.min(1, shade + 0.1) : shade })
    }
  }

  return pixels
}

function generatePlanet({ size, seed, palette, lightAngle }) {
  const cx = (size - 1) / 2
  const cy = (size - 1) / 2
  const R = size / 2 - 0.5
  const pixels = []

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx
      const dy = y - cy
      const r = Math.sqrt(dx * dx + dy * dy)
      if (r > R) continue

      const theta = Math.atan2(dy, dx)
      const spiral = Math.sin(theta * 2.2 - r * 0.5 + seed)
      const landNoise =
        Math.sin(x * 0.6 + seed) * Math.cos(y * 0.55 + seed * 0.6) +
        Math.sin((x + y) * 0.32 + seed * 2) * 0.6

      let color
      if (landNoise > 1.15) {
        color = palette.land[0]
      } else if (landNoise > 0.95) {
        color = palette.land[1]
      } else if (landNoise > 0.8) {
        color = palette.land[2]
      } else {
        color = r > R * 0.72 ? palette.ocean2 : palette.ocean
      }

      if (spiral > 0.82) {
        color = spiral > 0.93 ? palette.cloud : palette.cloud2
      }

      const lightDx = Math.cos(lightAngle)
      const lightDy = Math.sin(lightAngle)
      const lightAmount = (dx * lightDx + dy * lightDy) / R
      const shade = 0.55 + 0.5 * Math.max(-1, Math.min(1, lightAmount))

      const isRim = r > R - 1.1
      pixels.push({ x, y, color, shade: isRim ? Math.min(1, shade + 0.15) : shade, isRim })
    }
  }

  return pixels
}

function shadeColor(hex, factor) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.min(255, Math.max(0, Math.round(((n >> 16) & 0xff) * factor)))
  const g = Math.min(255, Math.max(0, Math.round(((n >> 8) & 0xff) * factor)))
  const b = Math.min(255, Math.max(0, Math.round((n & 0xff) * factor)))
  return `rgb(${r},${g},${b})`
}

export default function PixelPlanet({
  size = 22,
  pixelSize = 6,
  seed = 3,
  palette = 'earth',
  lightAngle = -2.4,
  type,
  className = '',
  style = {},
}) {
  const resolvedType = type || (size <= 14 ? 'moon' : 'planet')
  const pixels = useMemo(() => {
    const p = PALETTES[palette]
    return resolvedType === 'moon'
      ? generateMoon({ size, seed, palette: p, lightAngle })
      : generatePlanet({ size, seed, palette: p, lightAngle })
  }, [size, seed, palette, lightAngle, resolvedType])
  const dim = size * pixelSize

  return (
    <svg
      width={dim}
      height={dim}
      viewBox={`0 0 ${dim} ${dim}`}
      className={className}
      style={style}
    >
      {pixels.map((p, i) => (
        <rect
          key={i}
          x={p.x * pixelSize}
          y={p.y * pixelSize}
          width={pixelSize}
          height={pixelSize}
          fill={shadeColor(p.color, p.shade)}
        />
      ))}
    </svg>
  )
}
