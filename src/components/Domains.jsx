import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { domains } from '../data/dummyData'
import PixelBackground from './PixelBackground'
import MountainDivider from './MountainDivider'

const colorMap = {
  blue: { fill: '#25348c', side: '#182463', roof: '#3d4fb8', roofSide: '#2a3684', glow: '#8fa4ff', door: '#101a4a' },
  purple: { fill: '#4a3272', side: '#31204d', roof: '#6b4d9e', roofSide: '#4a3572', glow: '#d1a8f5', door: '#241536' },
  red: { fill: '#b8483f', side: '#832e28', roof: '#d66a56', roofSide: '#a24a3a', glow: '#ffb199', door: '#4a1a16' },
  gold: { fill: '#a3822b', side: '#6e5518', roof: '#e8b64c', roofSide: '#b98d33', glow: '#ffe08a', door: '#3d2e0d' },
}

function Building({ domain, index }) {
  const [hover, setHover] = useState(false)
  const c = colorMap[domain.color]
  const bodyH = 96 + (index % 2 === 0 ? 20 : 0)
  const roofH = 34
  const topPad = 26
  const W = 148
  const groundY = topPad + roofH + bodyH
  const frontX0 = 14
  const frontX1 = 104
  const depth = 18
  const shear = 12

  return (
    <div
      className="group relative flex flex-col items-center"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <AnimatePresence>
        {hover && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="pixel-corners absolute -top-16 z-20 w-48 border-2 bg-vista-night px-3 py-2 text-center text-sm"
            style={{ borderColor: c.glow, color: '#ede6d6' }}
          >
            {domain.description}
          </motion.div>
        )}
      </AnimatePresence>

      {hover && (
        <div className="pointer-events-none absolute -top-4 z-10 h-6 w-full">
          {[...Array(6)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute bottom-0 left-1/2 h-1.5 w-1.5"
              style={{ background: c.glow }}
              initial={{ opacity: 1, x: 0, y: 0 }}
              animate={{
                opacity: 0,
                x: (i - 3) * 14,
                y: -30 - (i % 3) * 8,
              }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.1 }}
            />
          ))}
        </div>
      )}

      <motion.div
        animate={{ scale: hover ? 1.06 : 1, y: hover ? -6 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 16 }}
        className="cursor-pointer select-none"
      >
        <svg width={W} height={groundY + 12} viewBox={`0 0 ${W} ${groundY + 12}`}>
          {/* ground shadow */}
          <ellipse cx={(frontX0 + frontX1) / 2 + 6} cy={groundY + 6} rx="46" ry="7" fill="#000" opacity="0.35" />

          {/* side wall (depth) */}
          <polygon
            points={`${frontX1},${topPad + roofH} ${frontX1 + depth},${topPad + roofH - shear} ${frontX1 + depth},${groundY - shear} ${frontX1},${groundY}`}
            fill={c.side}
            stroke="#0b0e21"
            strokeWidth="1.5"
          />

          {/* front wall */}
          <rect
            x={frontX0}
            y={topPad + roofH}
            width={frontX1 - frontX0}
            height={bodyH}
            fill={c.fill}
            stroke="#0b0e21"
            strokeWidth="2"
          />

          {/* roof side face */}
          <polygon
            points={`${frontX1},${topPad + roofH} ${frontX1 + depth},${topPad + roofH - shear} ${(frontX0 + frontX1) / 2 + depth / 2 + 4},${topPad - shear / 2} ${(frontX0 + frontX1) / 2},${topPad}`}
            fill={c.roofSide}
            stroke="#0b0e21"
            strokeWidth="1.5"
          />

          {/* roof front */}
          <polygon
            points={`${frontX0 - 6},${topPad + roofH} ${(frontX0 + frontX1) / 2},${topPad} ${frontX1 + 6},${topPad + roofH}`}
            fill={c.roof}
            stroke="#0b0e21"
            strokeWidth="2"
          />
          {/* roof ridge highlight */}
          <polygon
            points={`${frontX0 + 10},${topPad + roofH - 3} ${(frontX0 + frontX1) / 2},${topPad + 8} ${frontX1 - 10},${topPad + roofH - 3}`}
            fill="#000"
            opacity="0.12"
          />

          {/* chimney */}
          <rect x={frontX1 - 16} y={topPad - 10} width="10" height="20" fill={c.roofSide} stroke="#0b0e21" strokeWidth="1.5" />
          {[0, 1, 2].map((i) => (
            <circle
              key={i}
              cx={frontX1 - 11}
              cy={topPad - 16 - i * 8}
              r={2.6 - i * 0.4}
              fill="#ede6d6"
              opacity={hover ? 0.5 - i * 0.12 : 0.25 - i * 0.07}
            />
          ))}

          {/* windows */}
          {[0, 1].map((col) => (
            <g key={col}>
              <rect
                x={frontX0 + 14 + col * 44}
                y={topPad + roofH + 16}
                width="22"
                height="22"
                fill={c.door}
                stroke="#0b0e21"
                strokeWidth="1.5"
              />
              <rect
                x={frontX0 + 16 + col * 44}
                y={topPad + roofH + 18}
                width="18"
                height="18"
                fill={hover ? c.glow : '#ede6d6'}
                opacity={hover ? 0.95 : 0.5}
              />
              <rect x={frontX0 + 14 + col * 44} y={topPad + roofH + 25} width="22" height="2" fill="#0b0e21" opacity="0.5" />
              <rect x={frontX0 + 24 + col * 44} y={topPad + roofH + 16} width="2" height="22" fill="#0b0e21" opacity="0.5" />
            </g>
          ))}

          {bodyH > 110 && (
            <g>
              <rect
                x={frontX0 + 14}
                y={topPad + roofH + 46}
                width="22"
                height="18"
                fill={c.door}
                stroke="#0b0e21"
                strokeWidth="1.5"
              />
              <rect
                x={frontX0 + 16}
                y={topPad + roofH + 48}
                width="18"
                height="14"
                fill={hover ? c.glow : '#ede6d6'}
                opacity={hover ? 0.9 : 0.4}
              />
            </g>
          )}

          {/* door */}
          <rect
            x={(frontX0 + frontX1) / 2 - 12}
            y={groundY - 30}
            width="24"
            height="30"
            fill={c.door}
            stroke="#0b0e21"
            strokeWidth="2"
          />
          <rect
            x={(frontX0 + frontX1) / 2 - 12}
            y={groundY - 30}
            width="24"
            height="6"
            fill={c.roof}
          />
          <circle cx={(frontX0 + frontX1) / 2 + 7} cy={groundY - 14} r="1.6" fill={hover ? c.glow : '#8a7a5a'} />

          {/* sign lantern */}
          <line
            x1={(frontX0 + frontX1) / 2 + 24}
            y1={topPad + roofH}
            x2={(frontX0 + frontX1) / 2 + 24}
            y2={topPad + roofH + 12}
            stroke="#0b0e21"
            strokeWidth="1.5"
          />
          <circle
            cx={(frontX0 + frontX1) / 2 + 24}
            cy={topPad + roofH + 16}
            r={hover ? 6 : 4.5}
            fill={c.glow}
            opacity={hover ? 0.95 : 0.6}
          />
        </svg>
      </motion.div>

      <div className="mt-3 flex flex-col items-center gap-1 text-center">
        <span className="text-2xl">{domain.emoji}</span>
        <span className="font-pixel text-[10px] leading-tight text-vista-cream sm:text-xs">{domain.name}</span>
      </div>
    </div>
  )
}

export default function Domains() {
  return (
    <section id="domains" className="relative overflow-hidden bg-vista-night px-6 py-28">
      <PixelBackground starCount={160} cloudCount={0} seed={44} />
      <MountainDivider
        baseColor="#3d2a5c"
        ridgeColor="#a888c9"
        backColor="#2e1a47"
        fadeClass="from-vista-night-2"
        showMoon
        moonSide="left"
        moonPalette="rust"
        moonSize={16}
      />
      <div className="relative z-10 mx-auto max-w-5xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-4 font-pixel text-lg text-vista-gold sm:text-2xl"
        >
          Explore the Domains
        </motion.h2>
        <p className="mx-auto mb-16 max-w-xl text-vista-cream/70">
          Four buildings. Four paths. Wander through VISTA's town square and find where you belong.
        </p>

        <div className="relative flex flex-wrap items-end justify-center gap-10 rounded-lg py-10 sm:gap-16">
          <div className="absolute inset-x-0 bottom-8 h-px bg-vista-cream/10" />
          {domains.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Building domain={d} index={i} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
