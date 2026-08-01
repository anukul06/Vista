import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Wrench, Calendar, MapPin, Users, Award } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function Workshops({ onLoginClick }) {
  const [workshops, setWorkshops] = useState([])
  const [loading, setLoading] = useState(true)
  const { user, isAuthenticated } = useAuth()

  const fetchWorkshops = async () => {
    try {
      setLoading(true)
      const data = await api.get('/events?type=WORKSHOP')
      setWorkshops(data)
    } catch (err) {
      console.error('Error fetching workshops:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkshops()
  }, [])

  const handleRegister = async (workshopId) => {
    if (!isAuthenticated) {
      onLoginClick?.()
      return
    }
    try {
      await api.post(`/events/${workshopId}/register`)
      alert('Registered successfully! +XP progress updated on your dashboard.')
      fetchWorkshops()
    } catch (err) {
      alert(err.message || 'Registration failed')
    }
  }

  const handleCancelRegistration = async (workshopId) => {
    try {
      await api.post(`/events/${workshopId}/unregister`)
      alert('Unregistered successfully. XP has been adjusted.')
      fetchWorkshops()
    } catch (err) {
      alert(err.message || 'Unregister failed')
    }
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center font-mono-pixel text-vista-gold">
        Loading workshops...
      </div>
    )
  }

  if (workshops.length === 0) {
    return null // Don't show the section if no workshops are published
  }

  return (
    <section id="workshops" className="relative bg-vista-night-2 px-6 py-20">
      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-4 text-center font-pixel text-lg text-vista-gold sm:text-2xl"
        >
          Practical Workshops
        </motion.h2>
        <p className="mx-auto mb-12 max-w-xl text-center text-vista-cream/70">
          Hands-on technical workshops. Build projects, break code, and level up.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {workshops.map((workshop, index) => {
            const registeredReg = workshop.registrations?.find(
              (r) => r.userId === user?.id && r.status !== 'CANCELLED'
            )
            const isRegistered = !!registeredReg
            const activeRegCount = workshop.registrations?.filter(r => r.status !== 'CANCELLED').length || 0

            return (
              <motion.div
                key={workshop.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative flex flex-col justify-between pixel-corners border-2 border-vista-cream/20 bg-[#e2ebf3] p-6 text-vista-night shadow-lg"
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 pixel-corners bg-vista-blue text-vista-cream px-2 py-0.5 font-pixel text-[9px]">
                      <Wrench size={10} />
                      Workshop
                    </span>
                    <span className="flex items-center gap-1 font-pixel text-[10px] text-vista-blue">
                      <Award size={12} />
                      +{workshop.xpReward} XP
                    </span>
                  </div>

                  <h3 className="mb-2 font-pixel text-xs leading-relaxed text-vista-night">
                    {workshop.title}
                  </h3>
                  <p className="mb-4 text-sm text-vista-night/75 line-clamp-3">
                    {workshop.description}
                  </p>

                  <div className="mb-4 flex flex-col gap-2 font-mono-pixel text-xs text-vista-night/70">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      <span>{new Date(workshop.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} />
                      <span>{workshop.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={14} />
                      <span>
                        {activeRegCount} / {workshop.capacity} Registered
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  {isRegistered ? (
                    <button
                      onClick={() => handleCancelRegistration(workshop.id)}
                      className="w-full pixel-corners border-2 border-vista-red bg-vista-red px-3 py-2 font-pixel text-[10px] text-vista-cream transition-colors hover:bg-vista-red-2"
                    >
                      Cancel Seat
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRegister(workshop.id)}
                      disabled={activeRegCount >= workshop.capacity}
                      className={`w-full pixel-corners border-2 border-vista-night bg-vista-night px-3 py-2 font-pixel text-[10px] text-vista-gold transition-colors hover:bg-vista-purple disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {activeRegCount >= workshop.capacity ? 'Full' : 'Claim Seat'}
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
