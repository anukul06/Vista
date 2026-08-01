import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import PixelBackground from './PixelBackground'
import MountainDivider from './MountainDivider'

const categoryColors = {
  Technical: 'bg-vista-blue text-vista-cream',
  'Non-Technical': 'bg-vista-red text-vista-cream',
}

function EventCard({ event, index, currentUser, onRegister, onUnregister }) {
  const registeredReg = event.registrations?.find(
    (r) => r.userId === currentUser?.id && r.status !== 'CANCELLED'
  )
  const isEnrolled = !!registeredReg
  const activeRegCount = event.registrations?.filter((r) => r.status !== 'CANCELLED').length || 0
  const isFull = activeRegCount >= event.capacity

  // Deterministic rotation based on ID
  const rotation = (event.id.charCodeAt(0) % 7) - 3

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: 0 }}
      whileInView={{ opacity: 1, y: 0, rotate: rotation }}
      viewport={{ once: true }}
      whileHover={{ rotate: 0, scale: 1.04, y: -4 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="relative w-64 shrink-0"
    >
      <div
        className="absolute -top-3 left-1/2 z-10 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-vista-night"
        style={{ background: 'radial-gradient(circle at 35% 35%, #f4d06f, #a63d40)' }}
      />
      <div className="pixel-corners border-2 border-vista-cream/20 bg-[#f3ecd8] p-5 text-vista-night shadow-lg flex flex-col justify-between h-full min-h-[220px]">
        <div>
          <div className="flex justify-between items-start gap-1">
            <span className="inline-block pixel-corners px-2 py-0.5 font-pixel text-[8px] bg-vista-blue text-vista-cream">
              Event
            </span>
            <span className="font-pixel text-[8px] text-vista-purple/80">
              +{event.xpReward} XP
            </span>
          </div>
          <h3 className="mt-3 font-pixel text-xs leading-relaxed line-clamp-2">{event.title}</h3>
          <p className="mt-1 text-sm italic text-vista-night/60">{event.venue}</p>
          <p className="mt-2 font-mono-pixel text-lg text-vista-night/70">
            {new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
          </p>
          <p className="mt-1 font-mono-pixel text-xs text-vista-night/60">
            {activeRegCount} / {event.capacity} registered
          </p>
        </div>
        <div>
          {isEnrolled ? (
            <button
              onClick={() => onUnregister(event.id)}
              className="mt-4 w-full pixel-corners border-2 border-vista-red bg-vista-red px-3 py-2 font-pixel text-[10px] text-vista-cream transition-colors hover:bg-vista-red-2"
            >
              Cancel
            </button>
          ) : (
            <button
              onClick={() => onRegister(event.id)}
              disabled={isFull}
              className="mt-4 w-full pixel-corners border-2 border-vista-night bg-vista-night px-3 py-2 font-pixel text-[10px] text-vista-gold transition-colors hover:bg-vista-purple disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFull ? 'Full' : 'Join'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function Events({ onLoginClick }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const { user, isAuthenticated } = useAuth()

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const data = await api.get('/events?type=EVENT')
      setEvents(data)
    } catch (err) {
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const handleRegister = async (eventId) => {
    if (!isAuthenticated) {
      onLoginClick?.()
      return
    }
    try {
      await api.post(`/events/${eventId}/register`)
      alert('Registered successfully! +XP progress updated on your dashboard.')
      fetchEvents()
    } catch (err) {
      alert(err.message || 'Registration failed')
    }
  }

  const handleUnregister = async (eventId) => {
    try {
      await api.post(`/events/${eventId}/unregister`)
      alert('Unregistered successfully. XP has been adjusted.')
      fetchEvents()
    } catch (err) {
      alert(err.message || 'Unregister failed')
    }
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center font-mono-pixel text-vista-gold bg-vista-night-2">
        Loading events...
      </div>
    )
  }

  if (events.length === 0) {
    return null
  }

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
              <EventCard
                key={e.id}
                event={e}
                index={i}
                currentUser={user}
                onRegister={handleRegister}
                onUnregister={handleUnregister}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
