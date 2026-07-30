import { motion } from 'framer-motion'
import { events } from '../data/dummyData'
import PixelBackground from './PixelBackground'
import MountainDivider from './MountainDivider'

const categoryColors = {
  Technical: 'bg-vista-blue text-vista-cream',
  'Non-Technical': 'bg-vista-red text-vista-cream',
}

function EventCard({ event, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: 0 }}
      whileInView={{ opacity: 1, y: 0, rotate: event.rotation }}
      viewport={{ once: true }}
      whileHover={{ rotate: 0, scale: 1.04, y: -4 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="relative w-64 shrink-0"
    >
      <div
        className="absolute -top-3 left-1/2 z-10 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-vista-night"
        style={{ background: 'radial-gradient(circle at 35% 35%, #f4d06f, #a63d40)' }}
      />
      <div className="pixel-corners border-2 border-vista-cream/20 bg-[#f3ecd8] p-5 text-vista-night shadow-lg">
        <span className={`inline-block pixel-corners px-2 py-1 font-pixel text-[9px] ${categoryColors[event.category] || 'bg-vista-blue text-vista-cream'}`}>
          {event.category}
        </span>
        <h3 className="mt-3 font-pixel text-xs leading-relaxed">{event.title}</h3>
        {event.subtitle && (
          <p className="mt-1 text-sm italic text-vista-night/60">{event.subtitle}</p>
        )}
        {event.duration && (
          <p className="mt-2 font-mono-pixel text-lg text-vista-night/70">{event.duration}</p>
        )}
        <button className="mt-4 w-full pixel-corners border-2 border-vista-night bg-vista-night px-3 py-2 font-pixel text-[10px] text-vista-gold transition-colors hover:bg-vista-purple">
          Join
        </button>
      </div>
    </motion.div>
  )
}

export default function Events() {
  return (
    <section id="events" className="relative overflow-hidden bg-vista-night-2 px-6 py-28">
      <PixelBackground starCount={140} cloudCount={0} seed={22} />
      <MountainDivider
        baseColor="#33224f"
        ridgeColor="#9c86c9"
        backColor="#1d2a6b"
        fadeClass="from-vista-night-2"
      />
      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-4 text-center font-pixel text-lg text-vista-gold sm:text-2xl"
        >
          Notice Board
        </motion.h2>
        <p className="mx-auto mb-16 max-w-xl text-center text-vista-cream/70">
          Pinned up for everyone to see. New quests posted weekly.
        </p>

        <div
          className="pixel-corners border-2 border-vista-cream/10 p-8 sm:p-12"
          style={{
            background:
              'repeating-linear-gradient(45deg, #4a3524 0px, #4a3524 2px, #3d2b1c 2px, #3d2b1c 4px)',
          }}
        >
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-14">
            {events.map((e, i) => (
              <EventCard key={e.id} event={e} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
