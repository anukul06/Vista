import { useMemo } from 'react'
import { motion } from 'framer-motion'
import PixelPlanet from './PixelPlanet'

function PixelCloud({ className = '' }) {
  return (
    <svg width="120" height="48" viewBox="0 0 120 48" fill="none" className={className}>
      <g fill="currentColor">
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

function mulberry32(seed) {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16)
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff }
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

// Generates a fractal (midpoint-displacement) ridgeline clamped to [minFrac, maxFrac]
// of the canvas height, then rasterizes a noisy, hand-painted pixel-art mountain
// texture (upscaled later via CSS image-rendering:pixelated for the chunky look).
// Both layers always render at 100% of their container — relative dominance is
// controlled purely by minFrac/maxFrac, never by mismatched CSS scaling.
function renderMountainTexture({ w, h, seed, baseHex, ridgeHex, minFrac, maxFrac }) {
  const rand = mulberry32(seed)
  const n = 128
  const lo = h * minFrac
  const hi = h * maxFrac
  const heights = new Array(n + 1)
  heights[0] = lerp(lo, hi, 0.3 + rand() * 0.3)
  heights[n] = lerp(lo, hi, 0.3 + rand() * 0.3)

  function subdivide(l, r, disp) {
    if (r - l < 2) return
    const mid = (l + r) >> 1
    heights[mid] = Math.max(lo, Math.min(hi, (heights[l] + heights[r]) / 2 + (rand() * 2 - 1) * disp))
    subdivide(l, mid, disp * 0.6)
    subdivide(mid, r, disp * 0.6)
  }
  subdivide(0, n, (hi - lo) * 0.6)

  // fine-grained rocky patches (small blocks so it reads as texture, not checkerboard tiles)
  const blockSize = 3
  const blockCols = Math.ceil(w / blockSize) + 1
  const blockRows = Math.ceil(h / blockSize) + 1
  const blockNoise = []
  for (let i = 0; i < blockCols * blockRows; i++) blockNoise.push((rand() * 2 - 1) * 12)

  const base = hexToRgb(baseHex)
  const ridge = hexToRgb(ridgeHex)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  const img = ctx.createImageData(w, h)

  for (let x = 0; x < w; x++) {
    const hx = (x / w) * n
    const i0 = Math.floor(hx)
    const t = hx - i0
    const peakHeight = lerp(heights[i0], heights[Math.min(i0 + 1, n)], t)
    const topY = h - peakHeight

    for (let y = 0; y < h; y++) {
      const idx = (y * w + x) * 4
      if (y < topY) {
        img.data[idx + 3] = 0
        continue
      }
      const depth = y - topY
      const bx = Math.floor(x / blockSize)
      const by = Math.floor(y / blockSize)
      const block = blockNoise[by * blockCols + bx] || 0
      const grain = (rand() * 2 - 1) * 12
      const rim = Math.max(0, 1 - depth / 3)
      const depthShade = 1 - Math.min(depth / h, 1) * 0.3

      let r = lerp(base.r, ridge.r, rim * 0.85) * depthShade + block + grain
      let g = lerp(base.g, ridge.g, rim * 0.85) * depthShade + block + grain
      let b = lerp(base.b, ridge.b, rim * 0.85) * depthShade + block + grain

      img.data[idx] = Math.max(0, Math.min(255, r))
      img.data[idx + 1] = Math.max(0, Math.min(255, g))
      img.data[idx + 2] = Math.max(0, Math.min(255, b))
      img.data[idx + 3] = 255
    }
  }

  ctx.putImageData(img, 0, 0)
  return canvas.toDataURL('image/png')
}

const textureCache = new Map()

function getMountainTexture(options) {
  const key = JSON.stringify(options)
  if (textureCache.has(key)) return textureCache.get(key)
  const dataUrl = renderMountainTexture(options)
  textureCache.set(key, dataUrl)
  return dataUrl
}

function MountainLayer({ w, h, seed, baseHex, ridgeHex, minFrac, maxFrac, opacity = 1 }) {
  const src = useMemo(
    () => getMountainTexture({ w, h, seed, baseHex, ridgeHex, minFrac, maxFrac }),
    [w, h, seed, baseHex, ridgeHex, minFrac, maxFrac],
  )
  return (
    <img
      src={src}
      alt=""
      className="absolute bottom-0 left-0 h-full w-full"
      style={{ imageRendering: 'pixelated', opacity }}
    />
  )
}

export default function MountainDivider({
  baseColor = '#3d2a5c',
  ridgeColor = '#a888c9',
  backColor = '#1d2a6b',
  backOpacity = 0.55,
  fadeClass = 'from-vista-night',
  height = 140,
  showMoon = false,
  moonSide = 'right',
  moonPalette = 'violet',
  moonSize = 15,
  className = '',
}) {
  return (
    <div className={`pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden ${className}`} style={{ height }}>
      {showMoon && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className={`animate-float absolute top-2 ${moonSide === 'right' ? 'right-[8%]' : 'left-[8%]'} opacity-90`}
        >
          <PixelPlanet size={moonSize} pixelSize={4} seed={5.4} palette={moonPalette} type="moon" lightAngle={-2.1} />
        </motion.div>
      )}

      {/* drifting fog clouds */}
      <div className="absolute inset-x-0 top-0 h-full text-vista-cream/10">
        <div className="animate-drift-slow absolute top-[10%]">
          <PixelCloud className="scale-125 blur-[1px]" />
        </div>
        <div className="animate-drift absolute top-[35%]" style={{ animationDelay: '-20s' }}>
          <PixelCloud className="scale-75 blur-[1px]" />
        </div>
      </div>

      {/* distant hazy ridge — always shorter than the main range */}
      <MountainLayer
        w={160}
        h={80}
        seed={11}
        baseHex={backColor}
        ridgeHex={backColor}
        minFrac={0.12}
        maxFrac={0.42}
        opacity={backOpacity}
      />

      {/* main textured mountain — always taller and closer */}
      <MountainLayer
        w={160}
        h={80}
        seed={27}
        baseHex={baseColor}
        ridgeHex={ridgeColor}
        minFrac={0.32}
        maxFrac={0.82}
      />

      {/* mist fade into section background below */}
      <div className={`absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t ${fadeClass} to-transparent`} />
    </div>
  )
}
