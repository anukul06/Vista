import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, ChevronDown } from 'lucide-react'
import { api } from '../lib/api'
import PixelBackground from './PixelBackground'
import MountainDivider from './MountainDivider'

const rankColors = {
  1: 'text-vista-gold',
  2: 'text-vista-cream',
  3: 'text-vista-red-2',
}

const PREVIEW_COUNT = 5

function avatarFor(entry) {
  if (entry.githubUsername) return `https://github.com/${entry.githubUsername}.png`
  return `https://api.dicebear.com/9.x/pixel-art/svg?seed=${encodeURIComponent(entry.email)}`
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const data = await api.get('/leaderboard')
        setLeaderboard(data)
      } catch (err) {
        console.error('Error fetching leaderboard:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchLeaderboard()
  }, [])

  const visible = showAll ? leaderboard : leaderboard.slice(0, PREVIEW_COUNT)

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center font-mono-pixel text-vista-gold bg-vista-night-2">
        Loading leaderboard...
      </div>
    )
  }

  return (
    <section id="leaderboard" className="relative overflow-hidden bg-vista-night-2 px-6 py-28">
      <PixelBackground starCount={120} cloudCount={0} seed={33} />
      <MountainDivider
        baseColor="#2e1a47"
        ridgeColor="#9c7fc2"
        backColor="#1d2a6b"
        fadeClass="from-vista-night"
        showMoon
        moonSide="right"
        moonPalette="earth"
        moonSize={16}
      />
      <div className="relative z-10 mx-auto max-w-2xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-4 text-center font-pixel text-lg text-vista-gold sm:text-2xl"
        >
          Hall of Fame
        </motion.h2>
        <p className="mx-auto mb-14 max-w-xl text-center text-vista-cream/70">
          Top adventurers of the season.
        </p>

        {leaderboard.length === 0 ? (
          <p className="text-center text-vista-cream/50 font-mono-pixel">No active adventurers yet.</p>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="pixel-corners overflow-hidden border-2 border-vista-gold/30 bg-vista-night"
            >
              <AnimatePresence initial={false}>
                {visible.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    whileHover={{ x: 4 }}
                    className={`flex items-center gap-4 overflow-hidden px-5 py-4 ${
                      i !== visible.length - 1 ? 'border-b border-vista-cream/10' : ''
                    } ${entry.rank === 1 ? 'bg-vista-gold/10' : ''}`}
                  >
                    <div className={`w-8 shrink-0 text-center font-pixel text-sm ${rankColors[entry.rank] || 'text-vista-cream/60'}`}>
                      {entry.rank === 1 ? <Crown className="mx-auto" size={20} /> : `#${entry.rank}`}
                    </div>
                    <img
                      src={avatarFor(entry)}
                      alt={entry.name}
                      className="h-10 w-10 border-2 border-vista-cream/20 bg-vista-purple"
                    />
                    <div className="flex-1">
                      <p className="font-mono-pixel text-xl text-vista-cream">{entry.name}</p>
                    </div>
                    <div className="font-pixel text-xs text-vista-gold">{entry.xp.toLocaleString()} XP</div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {leaderboard.length > PREVIEW_COUNT && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setShowAll((v) => !v)}
                  className="flex items-center gap-2 pixel-corners border-2 border-vista-gold/40 px-5 py-2.5 font-pixel text-[10px] text-vista-gold transition-colors hover:border-vista-gold hover:bg-vista-gold/10"
                >
                  {showAll ? 'Show Less' : 'View All Members'}
                  <ChevronDown size={14} className={`transition-transform ${showAll ? 'rotate-180' : ''}`} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
