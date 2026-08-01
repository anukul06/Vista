import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Calendar, MapPin, Users, Award } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function Courses({ onLoginClick }) {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const { user, isAuthenticated } = useAuth()

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const data = await api.get('/events?type=COURSE')
      setCourses(data)
    } catch (err) {
      console.error('Error fetching courses:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const handleEnroll = async (courseId) => {
    if (!isAuthenticated) {
      onLoginClick?.()
      return
    }
    try {
      await api.post(`/events/${courseId}/register`)
      alert('Enrolled successfully! +XP progress updated on your dashboard.')
      fetchCourses()
    } catch (err) {
      alert(err.message || 'Enrollment failed')
    }
  }

  const handleCancelEnrollment = async (courseId) => {
    try {
      await api.post(`/events/${courseId}/unregister`)
      alert('Unenrolled successfully. XP has been adjusted.')
      fetchCourses()
    } catch (err) {
      alert(err.message || 'Cancel enrollment failed')
    }
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center font-mono-pixel text-vista-gold">
        Loading courses...
      </div>
    )
  }

  if (courses.length === 0) {
    return null // Don't show the section if no courses are published
  }

  return (
    <section id="courses" className="relative bg-vista-night px-6 py-20">
      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-4 text-center font-pixel text-lg text-vista-gold sm:text-2xl"
        >
          Featured Courses
        </motion.h2>
        <p className="mx-auto mb-12 max-w-xl text-center text-vista-cream/70">
          Long-term learning quests to master core skills and earn high XP rewards.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, index) => {
            const registeredReg = course.registrations?.find(
              (r) => r.userId === user?.id && r.status !== 'CANCELLED'
            )
            const isEnrolled = !!registeredReg
            const activeRegCount = course.registrations?.filter(r => r.status !== 'CANCELLED').length || 0

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative flex flex-col justify-between pixel-corners border-2 border-vista-cream/20 bg-[#f5ead2] p-6 text-vista-night shadow-lg"
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 pixel-corners bg-vista-purple text-vista-cream px-2 py-0.5 font-pixel text-[9px]">
                      <BookOpen size={10} />
                      Course
                    </span>
                    <span className="flex items-center gap-1 font-pixel text-[10px] text-vista-purple">
                      <Award size={12} />
                      +{course.xpReward} XP
                    </span>
                  </div>

                  <h3 className="mb-2 font-pixel text-xs leading-relaxed text-vista-night">
                    {course.title}
                  </h3>
                  <p className="mb-4 text-sm text-vista-night/75 line-clamp-3">
                    {course.description}
                  </p>

                  <div className="mb-4 flex flex-col gap-2 font-mono-pixel text-xs text-vista-night/70">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      <span>{new Date(course.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} />
                      <span>{course.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={14} />
                      <span>
                        {activeRegCount} / {course.capacity} Enrolled
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  {isEnrolled ? (
                    <button
                      onClick={() => handleCancelEnrollment(course.id)}
                      className="w-full pixel-corners border-2 border-vista-red bg-vista-red px-3 py-2 font-pixel text-[10px] text-vista-cream transition-colors hover:bg-vista-red-2"
                    >
                      Leave Course
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEnroll(course.id)}
                      disabled={activeRegCount >= course.capacity}
                      className={`w-full pixel-corners border-2 border-vista-night bg-vista-night px-3 py-2 font-pixel text-[10px] text-vista-gold transition-colors hover:bg-vista-purple disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {activeRegCount >= course.capacity ? 'Full' : 'Enroll Now'}
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
