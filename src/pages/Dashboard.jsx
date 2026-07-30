import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { User, Calendar, LayoutGrid, Trophy, LogOut } from 'lucide-react'
import { dummyUser } from '../data/dummyData'
import PixelBackground from '../components/PixelBackground'
import MountainDivider from '../components/MountainDivider'

const navItems = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'domains', label: 'Domains', icon: LayoutGrid },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
]

export default function Dashboard() {
  const [active, setActive] = useState('profile')
  const xpPct = Math.min(100, Math.round((dummyUser.xp / dummyUser.xpToNext) * 100))

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-vista-night text-vista-cream">
      <div className="absolute inset-0">
        <PixelBackground starCount={100} cloudCount={2} seed={42} />
      </div>
      <MountainDivider
        baseColor="#2e1a47"
        ridgeColor="#9c7fc2"
        backColor="#1d2a6b"
        fadeClass="from-vista-night"
        height={180}
        className="opacity-70"
      />

      <aside className="relative z-10 hidden w-64 shrink-0 flex-col border-r-2 border-vista-cream/10 bg-vista-night-2/80 p-6 sm:flex">
        <Link to="/" className="mb-10 font-pixel text-sm text-vista-gold">
          VISTA
        </Link>

        <nav className="flex flex-1 flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = active === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`flex items-center gap-3 pixel-corners px-4 py-3 text-left font-mono-pixel text-lg transition-colors ${
                  isActive
                    ? 'border-2 border-vista-gold bg-vista-gold/10 text-vista-gold'
                    : 'border-2 border-transparent text-vista-cream/70 hover:text-vista-cream'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            )
          })}
        </nav>

        <Link
          to="/"
          className="flex items-center gap-3 pixel-corners border-2 border-vista-cream/20 px-4 py-3 font-mono-pixel text-lg text-vista-cream/60 hover:text-vista-cream"
        >
          <LogOut size={18} />
          Exit
        </Link>
      </aside>

      <main className="relative z-10 flex-1 px-6 py-10 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-4xl"
        >
          <div className="mb-8 flex flex-wrap items-center gap-5">
            <img src={dummyUser.avatar} alt={dummyUser.name} className="h-16 w-16 border-2 border-vista-gold bg-vista-purple" />
            <div>
              <h1 className="font-pixel text-lg text-vista-gold">Welcome back, {dummyUser.name}</h1>
              <p className="mt-1 text-vista-cream/60">
                {dummyUser.roll} · github.com/{dummyUser.github}
              </p>
            </div>
            <span className="ml-auto pixel-corners border-2 border-vista-gold px-3 py-1 font-pixel text-xs text-vista-gold">
              Level {dummyUser.level}
            </span>
          </div>

          <section className="mb-8 pixel-corners border-2 border-vista-cream/15 bg-vista-night-2/70 p-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-pixel text-[10px] text-vista-cream/70">XP PROGRESS</span>
              <span className="font-mono-pixel text-lg text-vista-gold">
                {dummyUser.xp} / {dummyUser.xpToNext}
              </span>
            </div>
            <div className="h-5 w-full overflow-hidden border-2 border-vista-cream/20 bg-vista-night">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPct}%` }}
                transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-vista-gold to-vista-gold-2"
              />
            </div>
          </section>

          <div className="mb-8 grid gap-6 sm:grid-cols-2">
            <section className="pixel-corners border-2 border-vista-cream/15 bg-vista-night-2/70 p-6">
              <h2 className="mb-4 font-pixel text-[10px] text-vista-cream/70">BADGES</h2>
              <div className="grid grid-cols-2 gap-3">
                {dummyUser.badges.map((b) => (
                  <div
                    key={b.id}
                    className="flex flex-col items-center gap-2 pixel-corners border-2 border-vista-cream/10 bg-vista-night py-4"
                  >
                    <span className="text-2xl">{b.emoji}</span>
                    <span className="text-center text-sm text-vista-cream/70">{b.label}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="pixel-corners border-2 border-vista-cream/15 bg-vista-night-2/70 p-6">
              <h2 className="mb-4 font-pixel text-[10px] text-vista-cream/70">JOINED DOMAINS</h2>
              <ul className="flex flex-col gap-3">
                {dummyUser.joinedDomains.map((d) => (
                  <li
                    key={d}
                    className="pixel-corners border-2 border-vista-cream/10 bg-vista-night px-4 py-3 text-vista-cream/85"
                  >
                    {d}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <section className="pixel-corners border-2 border-vista-cream/15 bg-vista-night-2/70 p-6">
              <h2 className="mb-4 font-pixel text-[10px] text-vista-cream/70">RECENT EVENTS</h2>
              <ul className="flex flex-col gap-3">
                {dummyUser.recentEvents.map((e) => (
                  <li key={e} className="flex items-center gap-3 text-vista-cream/85">
                    <span className="h-2 w-2 bg-vista-green" />
                    {e}
                  </li>
                ))}
              </ul>
            </section>

            <section className="pixel-corners border-2 border-vista-cream/15 bg-vista-night-2/70 p-6">
              <h2 className="mb-4 font-pixel text-[10px] text-vista-cream/70">UPCOMING SESSIONS</h2>
              <ul className="flex flex-col gap-3">
                {dummyUser.upcomingSessions.map((s) => (
                  <li key={s.title} className="flex items-center justify-between text-vista-cream/85">
                    <span>{s.title}</span>
                    <span className="text-sm text-vista-gold">{s.date}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
