import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import PixelBackground from './PixelBackground'
import MountainDivider from './MountainDivider'

const LINES = [
  { text: '> whoami', className: 'text-vista-gold' },
  { text: '', className: '' },
  { text: 'VISTA', className: 'font-pixel text-sm text-vista-cream' },
  { text: '', className: '' },
  { text: 'Vision, Innovation, Skills, Talent, Arts', className: 'text-vista-gold-2' },
  { text: '', className: '' },
  { text: 'A student-driven community focused on technology,', className: 'text-vista-cream/85' },
  { text: 'innovation, creativity, collaboration,', className: 'text-vista-cream/85' },
  { text: 'and building impactful projects.', className: 'text-vista-cream/85' },
  { text: '', className: '' },
  { text: '> _', className: 'text-vista-gold' },
]

function useTypewriter(active) {
  const [output, setOutput] = useState([])

  useEffect(() => {
    if (!active) return
    let lineIdx = 0
    let charIdx = 0
    let cancelled = false
    const result = LINES.map((l) => ({ ...l, text: '' }))
    setOutput(result)

    function tick() {
      if (cancelled) return
      if (lineIdx >= LINES.length) return
      const currentLine = LINES[lineIdx]
      if (charIdx <= currentLine.text.length) {
        setOutput((prev) => {
          const next = [...prev]
          next[lineIdx] = { ...currentLine, text: currentLine.text.slice(0, charIdx) }
          return next
        })
        charIdx += 1
        setTimeout(tick, currentLine.text.length === 0 ? 120 : 14)
      } else {
        lineIdx += 1
        charIdx = 0
        setTimeout(tick, 150)
      }
    }
    const start = setTimeout(tick, 400)
    return () => {
      cancelled = true
      clearTimeout(start)
    }
  }, [active])

  return output
}

export default function About() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const lines = useTypewriter(inView)

  return (
    <section id="about" className="relative overflow-hidden bg-vista-night-2 px-6 py-28">
      <PixelBackground starCount={140} cloudCount={0} seed={11} />
      <MountainDivider
        baseColor="#2e1a47"
        ridgeColor="#9c7fc2"
        backColor="#1d2a6b"
        fadeClass="from-vista-night"
      />
      <div className="relative z-10 mx-auto max-w-3xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center font-pixel text-lg text-vista-gold sm:text-2xl"
        >
          About VISTA
        </motion.h2>

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="pixel-corners overflow-hidden border-2 border-vista-cream/20 bg-black/60 shadow-2xl"
        >
          <div className="flex items-center gap-2 border-b-2 border-vista-cream/20 bg-vista-night px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-vista-red" />
            <span className="h-3 w-3 rounded-full bg-vista-gold" />
            <span className="h-3 w-3 rounded-full bg-vista-green" />
            <span className="ml-3 font-mono-pixel text-sm text-vista-cream/50">vista@terminal:~</span>
          </div>
          <div className="min-h-[280px] px-6 py-6 text-xl leading-relaxed">
            {lines.map((l, i) => (
              <div key={i} className={l.className || 'text-vista-cream/85'}>
                {l.text || ' '}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
