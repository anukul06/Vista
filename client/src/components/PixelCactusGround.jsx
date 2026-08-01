import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { CACTUS_VARIANTS, CACTUS_WIDTH, CACTUS_HEIGHT } from './PixelCactus'

const SEQUENCE = [
  { variant: 0, gap: 34 },
  { variant: 1, gap: 96 },
  { variant: 2, gap: 58 },
  { variant: 0, gap: 130 },
  { variant: 1, gap: 70 },
  { variant: 2, gap: 108 },
  { variant: 0, gap: 60 },
  { variant: 1, gap: 90 },
]

// Rasterizes one tile of the cactus sequence onto a canvas and repeats it as
// a CSS background-image. A finite duplicated-DOM marquee only stays seamless
// while the viewport is narrower than ~2 tile-widths — on a wide/fullscreen
// window you'd see a gap before it wraps. `background-repeat: repeat-x`
// tiles infinitely regardless of viewport width, so there's no seam ever.
function buildGroundTile(color) {
  const tileWidth = SEQUENCE.reduce((w, c) => w + CACTUS_WIDTH + c.gap, 0)
  const canvas = document.createElement('canvas')
  canvas.width = tileWidth
  canvas.height = CACTUS_HEIGHT
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = color

  let x = 0
  for (const { variant, gap } of SEQUENCE) {
    for (const r of CACTUS_VARIANTS[variant]) {
      ctx.fillRect(x + r.x, r.y, r.w, r.h)
    }
    x += CACTUS_WIDTH + gap
  }

  return { dataUrl: canvas.toDataURL('image/png'), tileWidth }
}

export default function PixelCactusGround({ color = '#3f7a5f', speedPxPerSec = 24, className = '' }) {
  const { dataUrl, tileWidth } = useMemo(() => buildGroundTile(color), [color])
  const duration = tileWidth / speedPxPerSec

  return (
    <motion.div
      className={`absolute bottom-0 left-0 h-10 w-full ${className}`}
      style={{
        backgroundImage: `url(${dataUrl})`,
        backgroundRepeat: 'repeat-x',
        backgroundPosition: 'left bottom',
        imageRendering: 'pixelated',
      }}
      animate={{ backgroundPositionX: [0, -tileWidth] }}
      transition={{ duration, repeat: Infinity, ease: 'linear' }}
    />
  )
}
