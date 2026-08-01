// Thin spiky silhouettes modeled on the actual Chrome T-Rex game cactus
// sprites — a narrow main stem with small right-angle arm nubs, and a
// fused 3-spike cluster variant, instead of a thick saguaro shape.
// Shapes are plain rect data so they can be drawn either as SVG (this file)
// or rasterized onto a canvas (used by PixelCactusGround for tiling).
export const CACTUS_VARIANTS = [
  // 0: small single cactus with one arm
  [
    { x: 10, y: 8, w: 4, h: 32 },
    { x: 14, y: 16, w: 6, h: 4 },
    { x: 14, y: 8, w: 4, h: 12 },
  ],
  // 1: 3-spike cluster fused at a shared base — the classic "cactus group"
  [
    { x: 2, y: 34, w: 20, h: 6 },
    { x: 3, y: 18, w: 4, h: 20 },
    { x: 10, y: 6, w: 4, h: 32 },
    { x: 17, y: 14, w: 4, h: 24 },
  ],
  // 2: tall cactus with two opposing arms
  [
    { x: 10, y: 2, w: 4, h: 38 },
    { x: 4, y: 14, w: 6, h: 4 },
    { x: 4, y: 6, w: 4, h: 12 },
    { x: 14, y: 20, w: 6, h: 4 },
    { x: 16, y: 12, w: 4, h: 12 },
  ],
]

export const CACTUS_WIDTH = 24
export const CACTUS_HEIGHT = 40

export default function PixelCactus({ variant = 0, className = '' }) {
  const rects = CACTUS_VARIANTS[variant] ?? CACTUS_VARIANTS[0]
  return (
    <svg
      width={CACTUS_WIDTH}
      height={CACTUS_HEIGHT}
      viewBox={`0 0 ${CACTUS_WIDTH} ${CACTUS_HEIGHT}`}
      className={className}
      fill="currentColor"
      shapeRendering="crispEdges"
    >
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} />
      ))}
    </svg>
  )
}
