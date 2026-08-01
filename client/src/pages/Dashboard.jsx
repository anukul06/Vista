import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  User,
  Calendar,
  Trophy,
  LogOut,
  Users,
  BookOpen,
  Wrench,
  Plus,
  Edit,
  Trash,
  Award,
  Search,
  CheckCircle,
  XCircle,
  Bell,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Clock,
  Briefcase
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { xpIntoCurrentLevel, xpForNextLevel } from '../../../shared/constants.js'
import PixelBackground from '../components/PixelBackground'
import MountainDivider from '../components/MountainDivider'

function avatarFor(email, githubUsername) {
  if (githubUsername) return `https://github.com/${githubUsername}.png`
  return `https://api.dicebear.com/9.x/pixel-art/svg?seed=${encodeURIComponent(email || 'avatar')}`
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleExit = async () => {
    await logout()
    navigate('/')
  }

  if (user?.role === 'ADMIN') {
    return <AdminDashboard user={user} onExit={handleExit} />
  }
  return <StudentDashboard user={user} onExit={handleExit} />
}

/* ==========================================================================
   ADMIN DASHBOARD COMPONENT
   ========================================================================== */
function AdminDashboard({ user, onExit }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [students, setStudents] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  // Modals & Sub-states
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [studentDetails, setStudentDetails] = useState(null)
  const [xpAmount, setXpAmount] = useState('')
  const [xpReason, setXpReason] = useState('')
  const [xpSubmitting, setXpSubmitting] = useState(false)

  // Event modal states
  const [eventModalOpen, setEventModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    venue: '',
    capacity: '50',
    xpReward: '20',
    registrationDeadline: '',
    type: 'EVENT',
    status: 'PUBLISHED',
  })

  // Attendance states
  const [attendanceViewEvent, setAttendanceViewEvent] = useState(null)

  // Search filter states
  const [studentSearch, setStudentSearch] = useState('')
  const [sessionSearch, setSessionSearch] = useState('')

  const fetchData = async () => {
    try {
      setLoading(true)
      const [studentsData, eventsData] = await Promise.all([
        api.get('/students'),
        api.get('/events'),
      ])
      setStudents(studentsData)
      setEvents(eventsData)
    } catch (err) {
      console.error('Error fetching admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleStudentClick = async (student) => {
    setSelectedStudent(student)
    try {
      const details = await api.get(`/students/${student.id}`)
      setStudentDetails(details)
    } catch (err) {
      alert('Error fetching student details: ' + err.message)
    }
  }

  const handleXpAdjustment = async (e) => {
    e.preventDefault()
    if (!selectedStudent || !xpAmount) return
    try {
      setXpSubmitting(true)
      const amt = parseInt(xpAmount, 10)
      await api.post(`/students/${selectedStudent.id}/xp`, {
        amount: amt,
        reason: xpReason,
      })
      alert(`Successfully adjusted XP by ${amt} for ${selectedStudent.name}`)
      setXpAmount('')
      setXpReason('')
      // Refresh details and student list
      const details = await api.get(`/students/${selectedStudent.id}`)
      setStudentDetails(details)
      fetchData()
    } catch (err) {
      alert(err.message || 'Failed to adjust XP')
    } finally {
      setXpSubmitting(false)
    }
  }

  const handleEventFormSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingEvent) {
        await api.patch(`/events/${editingEvent.id}`, eventForm)
        alert('Event updated successfully')
      } else {
        await api.post('/events', eventForm)
        alert('Event created successfully')
      }
      setEventModalOpen(false)
      setEditingEvent(null)
      fetchData()
    } catch (err) {
      alert(err.message || 'Failed to save event')
    }
  }

  const openEditEvent = (event) => {
    setEditingEvent(event)
    setEventForm({
      title: event.title,
      description: event.description,
      date: new Date(event.date).toISOString().slice(0, 16),
      venue: event.venue,
      capacity: String(event.capacity),
      xpReward: String(event.xpReward),
      registrationDeadline: new Date(event.registrationDeadline).toISOString().slice(0, 16),
      type: event.type,
      status: event.status,
    })
    setEventModalOpen(true)
  }

  const openCreateEvent = () => {
    setEditingEvent(null)
    setEventForm({
      title: '',
      description: '',
      date: '',
      venue: '',
      capacity: '50',
      xpReward: '20',
      registrationDeadline: '',
      type: 'EVENT',
      status: 'PUBLISHED',
    })
    setEventModalOpen(true)
  }

  const handleDeleteEvent = async (id) => {
    if (!confirm('Are you sure you want to delete this event? This will remove all registrations.')) return
    try {
      await api.del(`/events/${id}`)
      alert('Event deleted')
      fetchData()
    } catch (err) {
      alert(err.message || 'Delete failed')
    }
  }

  const handleRegistrationStatusChange = async (eventId, regId, newStatus) => {
    try {
      await api.patch(`/events/${eventId}/registrations/${regId}`, { status: newStatus })
      alert(`Registration status updated to ${newStatus}`)
      // Reload details if active
      if (attendanceViewEvent?.id === eventId) {
        const updatedEvent = await api.get(`/events/${eventId}`)
        setAttendanceViewEvent(updatedEvent)
      }
      fetchData()
    } catch (err) {
      alert(err.message || 'Status update failed')
    }
  }

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(studentSearch.toLowerCase())
  )

  const filteredSessions = events.filter((e) =>
    e.title.toLowerCase().includes(sessionSearch.toLowerCase())
  )

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
        <div className="mb-10 font-pixel text-sm text-vista-gold">VISTA ADMIN</div>

        <nav className="flex flex-1 flex-col gap-2">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'students', label: 'Students', icon: Users },
            { id: 'sessions', label: 'Manage Sessions', icon: BookOpen },
          ].map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setAttendanceViewEvent(null)
                }}
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

        <button
          onClick={onExit}
          className="flex items-center gap-3 pixel-corners border-2 border-vista-cream/20 px-4 py-3 font-mono-pixel text-lg text-vista-cream/60 hover:text-vista-cream"
        >
          <LogOut size={18} />
          Exit Panel
        </button>
      </aside>

      <main className="relative z-10 flex-1 px-6 py-10 sm:px-10 overflow-y-auto max-h-screen">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-pixel text-lg text-vista-gold">Admin Command Center</h1>
              <p className="text-vista-cream/60">Manage students, adjust XP, and schedule courses/workshops/events.</p>
            </div>
            <div className="pixel-corners border-2 border-vista-gold px-3 py-1 font-pixel text-xs text-vista-gold bg-vista-gold/10">
              Admin Mode
            </div>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center font-mono-pixel text-vista-gold">
              Loading data...
            </div>
          ) : (
            <>
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && !attendanceViewEvent && (
                <div className="grid gap-6">
                  <div className="grid gap-6 sm:grid-cols-3">
                    <div className="pixel-corners border-2 border-vista-cream/15 bg-vista-night-2/70 p-6">
                      <div className="flex items-center justify-between">
                        <span className="font-pixel text-[10px] text-vista-cream/60">TOTAL STUDENTS</span>
                        <Users size={18} className="text-vista-gold" />
                      </div>
                      <p className="mt-2 font-mono-pixel text-3xl text-vista-cream">{students.length}</p>
                    </div>
                    <div className="pixel-corners border-2 border-vista-cream/15 bg-vista-night-2/70 p-6">
                      <div className="flex items-center justify-between">
                        <span className="font-pixel text-[10px] text-vista-cream/60">ACTIVE SESSIONS</span>
                        <BookOpen size={18} className="text-vista-blue" />
                      </div>
                      <p className="mt-2 font-mono-pixel text-3xl text-vista-cream">{events.length}</p>
                    </div>
                    <div className="pixel-corners border-2 border-vista-cream/15 bg-vista-night-2/70 p-6">
                      <div className="flex items-center justify-between">
                        <span className="font-pixel text-[10px] text-vista-cream/60">PLATFORM XP TRADED</span>
                        <Award size={18} className="text-vista-gold" />
                      </div>
                      <p className="mt-2 font-mono-pixel text-3xl text-vista-cream">
                        {students.reduce((acc, s) => acc + s.xp, 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <section className="pixel-corners border-2 border-vista-cream/15 bg-vista-night-2/70 p-6">
                    <h2 className="mb-4 font-pixel text-sm text-vista-gold">Recent Sessions Summary</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-mono-pixel text-sm">
                        <thead>
                          <tr className="border-b border-vista-cream/10 text-vista-cream/50">
                            <th className="py-2">Session Title</th>
                            <th className="py-2">Type</th>
                            <th className="py-2">Registrations</th>
                            <th className="py-2">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {events.slice(-5).map((e) => (
                            <tr key={e.id} className="border-b border-vista-cream/5 hover:bg-white/5">
                              <td className="py-3 pr-2">{e.title}</td>
                              <td className="py-3">{e.type}</td>
                              <td className="py-3">{e.registrations?.length || 0} enrolled</td>
                              <td className="py-3">
                                <span className={`px-2 py-0.5 pixel-corners text-[10px] ${
                                  e.status === 'PUBLISHED' ? 'bg-vista-green/20 text-vista-green' : 'bg-vista-cream/20 text-vista-cream/60'
                                }`}>
                                  {e.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>
              )}

              {/* STUDENTS TAB */}
              {activeTab === 'students' && (
                <section className="pixel-corners border-2 border-vista-cream/15 bg-vista-night-2/70 p-6">
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <h2 className="font-pixel text-sm text-vista-gold">Student Directory</h2>
                    <div className="relative w-64">
                      <Search className="absolute top-2.5 left-3 text-vista-cream/40" size={16} />
                      <input
                        type="text"
                        placeholder="Search student or roll no..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="w-full pixel-corners border-2 border-vista-cream/20 bg-vista-night py-2 pr-4 pl-10 text-sm outline-none focus:border-vista-gold"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono-pixel text-sm">
                      <thead>
                        <tr className="border-b border-vista-cream/10 text-vista-cream/50">
                          <th className="py-2">Name</th>
                          <th className="py-2">Roll Number</th>
                          <th className="py-2">Department & Year</th>
                          <th className="py-2">XP Progress</th>
                          <th className="py-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map((student) => (
                          <tr key={student.id} className="border-b border-vista-cream/5 hover:bg-white/5">
                            <td className="py-3 flex items-center gap-3">
                              <img
                                src={avatarFor(student.email, student.githubUsername)}
                                className="h-8 w-8 border border-vista-gold bg-vista-purple"
                                alt=""
                              />
                              <div>
                                <p className="font-bold text-vista-cream">{student.name}</p>
                                <p className="text-xs text-vista-cream/50">{student.email}</p>
                              </div>
                            </td>
                            <td className="py-3">{student.rollNumber}</td>
                            <td className="py-3">{student.department} · Year {student.year}</td>
                            <td className="py-3">
                              <div className="flex flex-col">
                                <span>{student.xp} XP (Lvl {student.level})</span>
                                <div className="h-2 w-32 bg-vista-night overflow-hidden mt-1 border border-vista-cream/10">
                                  <div
                                    className="h-full bg-vista-gold"
                                    style={{ width: `${Math.min(100, Math.round((xpIntoCurrentLevel(student.xp) / xpForNextLevel()) * 100))}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => handleStudentClick(student)}
                                className="pixel-corners border-2 border-vista-gold bg-vista-gold/10 px-3 py-1 text-[11px] text-vista-gold hover:bg-vista-gold hover:text-vista-night"
                              >
                                View Details & XP
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* SESSIONS TAB */}
              {activeTab === 'sessions' && !attendanceViewEvent && (
                <section className="pixel-corners border-2 border-vista-cream/15 bg-vista-night-2/70 p-6">
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="font-pixel text-sm text-vista-gold">Manage Notice Board, Courses & Workshops</h2>
                      <p className="text-xs text-vista-cream/60 mt-1">Publish new training sessions, change status, and mark student checklists.</p>
                    </div>
                    <button
                      onClick={openCreateEvent}
                      className="flex items-center gap-2 pixel-corners border-2 border-vista-gold bg-vista-gold px-4 py-2 font-pixel text-[11px] text-vista-night hover:bg-vista-purple hover:text-vista-cream hover:border-vista-purple transition-all"
                    >
                      <Plus size={14} />
                      Add Session
                    </button>
                  </div>

                  <div className="mb-6 relative max-w-md">
                    <Search className="absolute top-2.5 left-3 text-vista-cream/40" size={16} />
                    <input
                      type="text"
                      placeholder="Search title..."
                      value={sessionSearch}
                      onChange={(e) => setSessionSearch(e.target.value)}
                      className="w-full pixel-corners border-2 border-vista-cream/20 bg-vista-night py-2 pr-4 pl-10 text-sm outline-none focus:border-vista-gold"
                    />
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono-pixel text-sm">
                      <thead>
                        <tr className="border-b border-vista-cream/10 text-vista-cream/50">
                          <th className="py-2">Session</th>
                          <th className="py-2">Type</th>
                          <th className="py-2">XP Reward</th>
                          <th className="py-2">Status</th>
                          <th className="py-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSessions.map((e) => (
                          <tr key={e.id} className="border-b border-vista-cream/5 hover:bg-white/5">
                            <td className="py-3">
                              <p className="font-bold text-vista-cream">{e.title}</p>
                              <p className="text-xs text-vista-cream/50">{e.venue} · {new Date(e.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 pixel-corners text-[10px] ${
                                e.type === 'COURSE' ? 'bg-vista-purple/20 text-vista-purple' : e.type === 'WORKSHOP' ? 'bg-vista-blue/20 text-vista-blue' : 'bg-vista-gold/20 text-vista-gold'
                              }`}>
                                {e.type}
                              </span>
                            </td>
                            <td className="py-3">+{e.xpReward} XP</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 pixel-corners text-[10px] ${
                                e.status === 'PUBLISHED' ? 'bg-vista-green/20 text-vista-green' : e.status === 'DRAFT' ? 'bg-white/10 text-white/50' : 'bg-vista-red/20 text-vista-red'
                              }`}>
                                {e.status}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => {
                                    api.get(`/events/${e.id}`).then(setAttendanceViewEvent)
                                  }}
                                  className="pixel-corners border-2 border-vista-blue/40 bg-vista-blue/10 px-2 py-1 text-[11px] text-vista-blue hover:bg-vista-blue hover:text-vista-cream"
                                >
                                  Register/Attendance ({e.registrations?.length || 0})
                                </button>
                                <button
                                  onClick={() => openEditEvent(e)}
                                  className="pixel-corners border-2 border-vista-cream/20 bg-white/5 p-1 text-vista-cream/70 hover:text-vista-gold"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteEvent(e.id)}
                                  className="pixel-corners border-2 border-vista-red/40 bg-vista-red/10 p-1 text-vista-red hover:bg-vista-red hover:text-vista-cream"
                                >
                                  <Trash size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* ATTENDANCE / REGISTRATIONS DETAIL VIEW */}
              {attendanceViewEvent && (
                <section className="pixel-corners border-2 border-vista-cream/15 bg-vista-night-2/70 p-6">
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <button
                        onClick={() => setAttendanceViewEvent(null)}
                        className="text-xs text-vista-gold hover:underline mb-2 block"
                      >
                        &larr; Back to Sessions
                      </button>
                      <h2 className="font-pixel text-sm text-vista-gold">{attendanceViewEvent.title}</h2>
                      <p className="text-xs text-vista-cream/60 mt-1">Mark attendance or set winners. Any status update will automatically adjust student XP.</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono-pixel text-sm">
                      <thead>
                        <tr className="border-b border-vista-cream/10 text-vista-cream/50">
                          <th className="py-2">Student</th>
                          <th className="py-2">Roll Number</th>
                          <th className="py-2">Registered On</th>
                          <th className="py-2">Status</th>
                          <th className="py-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceViewEvent.registrations?.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-4 text-center text-vista-cream/40">
                              No students registered for this session yet.
                            </td>
                          </tr>
                        ) : (
                          attendanceViewEvent.registrations.map((reg) => (
                            <tr key={reg.id} className="border-b border-vista-cream/5">
                              <td className="py-3 flex items-center gap-3">
                                <img
                                  src={avatarFor(reg.user.email, reg.user.githubUsername)}
                                  className="h-8 w-8 border border-vista-gold bg-vista-purple"
                                  alt=""
                                />
                                <div>
                                  <p className="font-bold text-vista-cream">{reg.user.name}</p>
                                  <p className="text-xs text-vista-cream/50">{reg.user.email}</p>
                                </div>
                              </td>
                              <td className="py-3">{reg.user.rollNumber}</td>
                              <td className="py-3">{new Date(reg.registeredAt).toLocaleDateString()}</td>
                              <td className="py-3">
                                <span className={`px-2 py-0.5 pixel-corners text-[10px] ${
                                  reg.status === 'ATTENDED' ? 'bg-vista-blue/20 text-vista-blue' : reg.status === 'WINNER' ? 'bg-vista-gold/20 text-vista-gold font-bold' : reg.status === 'CANCELLED' ? 'bg-vista-red/20 text-vista-red' : 'bg-vista-cream/20 text-vista-cream'
                                }`}>
                                  {reg.status}
                                </span>
                              </td>
                              <td className="py-3 text-right">
                                <select
                                  value={reg.status}
                                  onChange={(e) => handleRegistrationStatusChange(attendanceViewEvent.id, reg.id, e.target.value)}
                                  className="pixel-corners border-2 border-vista-cream/20 bg-vista-night py-1 px-2 text-xs text-vista-cream focus:border-vista-gold outline-none"
                                >
                                  <option value="REGISTERED">Registered</option>
                                  <option value="ATTENDED">Attended (+40 XP)</option>
                                  <option value="WINNER">Winner (+340 XP)</option>
                                  <option value="CANCELLED">Cancelled</option>
                                </select>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>

      {/* STUDENT DETAIL MODAL & XP CONTROL */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-2xl pixel-corners border-2 border-vista-gold bg-vista-night p-6 text-vista-cream max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => {
                  setSelectedStudent(null)
                  setStudentDetails(null)
                }}
                className="absolute top-4 right-4 text-vista-cream/60 hover:text-vista-cream font-mono-pixel text-lg"
              >
                [x]
              </button>

              <div className="mb-6 flex items-center gap-4">
                <img
                  src={avatarFor(selectedStudent.email, selectedStudent.githubUsername)}
                  className="h-16 w-16 border-2 border-vista-gold bg-vista-purple"
                  alt=""
                />
                <div>
                  <h3 className="font-pixel text-sm text-vista-gold">{selectedStudent.name}</h3>
                  <p className="text-vista-cream/60 text-sm mt-1">
                    {selectedStudent.rollNumber} · {selectedStudent.department} · Year {selectedStudent.year}
                  </p>
                </div>
              </div>

              {studentDetails ? (
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="font-pixel text-[10px] text-vista-cream/60 mb-2">XP MODIFICATION</h4>
                    <form onSubmit={handleXpAdjustment} className="flex flex-col gap-3">
                      <div>
                        <label className="block text-xs text-vista-cream/50 mb-1">XP Delta (use negative to subtract)</label>
                        <input
                          type="number"
                          placeholder="e.g. 50 or -50"
                          value={xpAmount}
                          onChange={(e) => setXpAmount(e.target.value)}
                          className="w-full pixel-corners border-2 border-vista-cream/20 bg-vista-night p-2 text-sm outline-none focus:border-vista-gold"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-vista-cream/50 mb-1">Reason</label>
                        <input
                          type="text"
                          placeholder="Why this adjustment?"
                          value={xpReason}
                          onChange={(e) => setXpReason(e.target.value)}
                          className="w-full pixel-corners border-2 border-vista-cream/20 bg-vista-night p-2 text-sm outline-none focus:border-vista-gold"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={xpSubmitting}
                        className="pixel-corners border-2 border-vista-gold bg-vista-gold text-vista-night py-2 font-pixel text-[10px] hover:bg-vista-purple hover:text-vista-cream hover:border-vista-purple transition-all"
                      >
                        {xpSubmitting ? 'Adjusting...' : 'Apply XP Delta'}
                      </button>
                    </form>

                    <h4 className="font-pixel text-[10px] text-vista-cream/60 mt-6 mb-2">EARNED BADGES</h4>
                    <div className="flex flex-wrap gap-2">
                      {studentDetails.badges?.length === 0 ? (
                        <p className="text-xs text-vista-cream/40">No badges earned yet.</p>
                      ) : (
                        studentDetails.badges.map((b) => (
                          <span
                            key={b.id}
                            className="pixel-corners border border-vista-gold/40 bg-vista-gold/5 px-2.5 py-1 text-xs text-vista-gold flex items-center gap-1.5"
                          >
                            <span>{b.badge.icon}</span>
                            <span>{b.badge.name}</span>
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col max-h-[350px]">
                    <h4 className="font-pixel text-[10px] text-vista-cream/60 mb-2">XP HISTORY LOG</h4>
                    <div className="overflow-y-auto flex-1 pr-1 border border-vista-cream/10 p-2 bg-vista-night-2/40">
                      {studentDetails.xpAdjustments?.length === 0 ? (
                        <p className="text-xs text-vista-cream/40">No adjustments logged yet.</p>
                      ) : (
                        studentDetails.xpAdjustments.map((log) => (
                          <div key={log.id} className="mb-3 border-b border-vista-cream/5 pb-2 text-xs">
                            <div className="flex justify-between items-center">
                              <span className={`font-bold ${log.amount > 0 ? 'text-vista-green' : 'text-vista-red'}`}>
                                {log.amount > 0 ? `+${log.amount}` : log.amount} XP
                              </span>
                              <span className="text-vista-cream/40 text-[10px]">
                                {new Date(log.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-vista-cream/80 mt-1">{log.reason}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center font-mono-pixel text-vista-gold py-6">Loading logs...</div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EVENT FORM MODAL */}
      <AnimatePresence>
        {eventModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-lg pixel-corners border-2 border-vista-gold bg-vista-night p-6 text-vista-cream"
            >
              <button
                onClick={() => {
                  setEventModalOpen(false)
                  setEditingEvent(null)
                }}
                className="absolute top-4 right-4 text-vista-cream/60 hover:text-vista-cream font-mono-pixel text-lg"
              >
                [x]
              </button>

              <h3 className="font-pixel text-sm text-vista-gold mb-6">
                {editingEvent ? 'Edit Session details' : 'Add New training Session'}
              </h3>

              <form onSubmit={handleEventFormSubmit} className="flex flex-col gap-4 font-mono-pixel text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-vista-cream/50 mb-1">Session Type</label>
                    <select
                      value={eventForm.type}
                      onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                      className="w-full pixel-corners border-2 border-vista-cream/20 bg-vista-night p-2 text-sm outline-none focus:border-vista-gold"
                    >
                      <option value="EVENT">Event</option>
                      <option value="COURSE">Course</option>
                      <option value="WORKSHOP">Workshop</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-vista-cream/50 mb-1">Status</label>
                    <select
                      value={eventForm.status}
                      onChange={(e) => setEventForm({ ...eventForm, status: e.target.value })}
                      className="w-full pixel-corners border-2 border-vista-cream/20 bg-vista-night p-2 text-sm outline-none focus:border-vista-gold"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-vista-cream/50 mb-1">Title</label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    className="w-full pixel-corners border-2 border-vista-cream/20 bg-vista-night p-2 text-sm outline-none focus:border-vista-gold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-vista-cream/50 mb-1">Description</label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    className="w-full h-20 pixel-corners border-2 border-vista-cream/20 bg-vista-night p-2 text-sm outline-none focus:border-vista-gold resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-vista-cream/50 mb-1">Date & Time</label>
                    <input
                      type="datetime-local"
                      value={eventForm.date}
                      onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                      className="w-full pixel-corners border-2 border-vista-cream/20 bg-vista-night p-2 text-sm outline-none focus:border-vista-gold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-vista-cream/50 mb-1">Reg Deadline</label>
                    <input
                      type="datetime-local"
                      value={eventForm.registrationDeadline}
                      onChange={(e) => setEventForm({ ...eventForm, registrationDeadline: e.target.value })}
                      className="w-full pixel-corners border-2 border-vista-cream/20 bg-vista-night p-2 text-sm outline-none focus:border-vista-gold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs text-vista-cream/50 mb-1">Venue</label>
                    <input
                      type="text"
                      value={eventForm.venue}
                      onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                      className="w-full pixel-corners border-2 border-vista-cream/20 bg-vista-night p-2 text-sm outline-none focus:border-vista-gold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-vista-cream/50 mb-1">Capacity</label>
                    <input
                      type="number"
                      value={eventForm.capacity}
                      onChange={(e) => setEventForm({ ...eventForm, capacity: e.target.value })}
                      className="w-full pixel-corners border-2 border-vista-cream/20 bg-vista-night p-2 text-sm outline-none focus:border-vista-gold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-vista-cream/50 mb-1">XP Reward (award on join)</label>
                  <input
                    type="number"
                    value={eventForm.xpReward}
                    onChange={(e) => setEventForm({ ...eventForm, xpReward: e.target.value })}
                    className="w-full pixel-corners border-2 border-vista-cream/20 bg-vista-night p-2 text-sm outline-none focus:border-vista-gold"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="pixel-corners border-2 border-vista-gold bg-vista-gold text-vista-night py-2 font-pixel text-[10px] hover:bg-vista-purple hover:text-vista-cream hover:border-vista-purple transition-all"
                >
                  {editingEvent ? 'Save Changes' : 'Create Session'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ==========================================================================
   STUDENT DASHBOARD COMPONENT
   ========================================================================== */
function StudentDashboard({ user, onExit }) {
  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  // API calls
  const fetchStudentData = async () => {
    try {
      setLoading(true)
      const [profileData, eventsData] = await Promise.all([
        api.get('/users/profile'),
        api.get('/events'),
      ])
      setProfile(profileData)
      setEvents(eventsData)
    } catch (err) {
      console.error('Error fetching student data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudentData()
  }, [])

  const handleRegister = async (eventId) => {
    try {
      await api.post(`/events/${eventId}/register`)
      alert('Registered successfully! XP progress bar updated.')
      fetchStudentData()
    } catch (err) {
      alert(err.message || 'Registration failed')
    }
  }

  const handleUnregister = async (eventId) => {
    try {
      await api.post(`/events/${eventId}/unregister`)
      alert('Registration cancelled.')
      fetchStudentData()
    } catch (err) {
      alert(err.message || 'Unregister failed')
    }
  }

  // Filter lists from events array
  const courseList = events.filter((e) => e.type === 'COURSE')
  const workshopList = events.filter((e) => e.type === 'WORKSHOP')
  const eventList = events.filter((e) => e.type === 'EVENT')

  const studentNavItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'workshops', label: 'Workshops', icon: Wrench },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-vista-night text-vista-gold">
        <PixelBackground starCount={40} seed={2} />
        <div className="font-mono-pixel text-lg">Syncing with database...</div>
      </div>
    )
  }

  const xpInLevel = xpIntoCurrentLevel(profile.xp)
  const xpTarget = xpForNextLevel()
  const xpPct = Math.min(100, Math.round((xpInLevel / xpTarget) * 100))

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
          {studentNavItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 pixel-corners px-4 py-3 text-left font-mono-pixel text-lg transition-colors ${
                  isActive
                    ? 'border-2 border-vista-gold bg-vista-gold/10 text-vista-gold'
                    : 'border-2 border-transparent text-vista-cream/70 hover:text-vista-cream'
                }`}
              >
                <Icon size={18} />
                {item.label}
                {item.id === 'notifications' && profile.notifications?.some(n => !n.read) && (
                  <span className="ml-auto h-2.5 w-2.5 rounded-full bg-vista-red animate-pulse" />
                )}
              </button>
            )
          })}
        </nav>

        <button
          onClick={onExit}
          className="flex items-center gap-3 pixel-corners border-2 border-vista-cream/20 px-4 py-3 font-mono-pixel text-lg text-vista-cream/60 hover:text-vista-cream"
        >
          <LogOut size={18} />
          Exit
        </button>
      </aside>

      <main className="relative z-10 flex-1 px-6 py-10 sm:px-10 overflow-y-auto max-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-4xl"
        >
          {/* Top profile stats summary */}
          <div className="mb-8 flex flex-wrap items-center gap-5">
            <img
              src={avatarFor(profile.email, profile.githubUsername)}
              alt={profile.name}
              className="h-16 w-16 border-2 border-vista-gold bg-vista-purple object-cover"
            />
            <div>
              <h1 className="font-pixel text-lg text-vista-gold">Welcome back, {profile.name}</h1>
              <p className="mt-1 text-vista-cream/60">
                {profile.rollNumber} · {profile.department} · Year {profile.year}
                {profile.githubUsername && <> · github.com/{profile.githubUsername}</>}
              </p>
            </div>
            <span className="ml-auto pixel-corners border-2 border-vista-gold px-3 py-1 font-pixel text-xs text-vista-gold">
              Level {profile.level}
            </span>
          </div>

          {/* XP Progress bar */}
          <section className="mb-8 pixel-corners border-2 border-vista-cream/15 bg-vista-night-2/70 p-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-pixel text-[10px] text-vista-cream/70">XP PROGRESS</span>
              <span className="font-mono-pixel text-lg text-vista-gold">
                {xpInLevel} / {xpTarget} <span className="text-vista-cream/40">({profile.xp} total)</span>
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

          {/* TAB VIEW RENDERS */}

          {/* PROFILE VIEW */}
          {activeTab === 'profile' && (
            <div className="grid gap-6">
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Badges Panel */}
                <section className="pixel-corners border-2 border-vista-cream/15 bg-vista-night-2/70 p-6">
                  <h2 className="mb-4 font-pixel text-[10px] text-vista-cream/70">UNLOCKED BADGES</h2>
                  <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                    {profile.badges?.length === 0 ? (
                      <p className="text-xs text-vista-cream/40 col-span-2 text-center py-6 font-mono-pixel">
                        Join events to unlock badges!
                      </p>
                    ) : (
                      profile.badges.map((b) => (
                        <div
                          key={b.id}
                          className="flex flex-col items-center gap-2 pixel-corners border-2 border-vista-cream/10 bg-vista-night py-4 px-2"
                        >
                          <span className="text-2xl">{b.badge.icon}</span>
                          <span className="text-center text-xs text-vista-cream/90 font-mono-pixel">{b.badge.name}</span>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                {/* Enrolled/Registered Sessions Summary */}
                <section className="pixel-corners border-2 border-vista-cream/15 bg-vista-night-2/70 p-6">
                  <h2 className="mb-4 font-pixel text-[10px] text-vista-cream/70">MY REGISTERED QUESTS</h2>
                  <div className="max-h-[300px] overflow-y-auto pr-1 flex flex-col gap-3 font-mono-pixel text-sm">
                    {profile.registrations?.filter(r => r.status !== 'CANCELLED').length === 0 ? (
                      <p className="text-xs text-vista-cream/40 text-center py-6">
                        No active course or event registrations.
                      </p>
                    ) : (
                      profile.registrations
                        .filter((r) => r.status !== 'CANCELLED')
                        .map((reg) => (
                          <div
                            key={reg.id}
                            className="pixel-corners border-2 border-vista-cream/10 bg-vista-night px-4 py-3 flex justify-between items-center"
                          >
                            <div>
                              <p className="font-bold text-vista-cream">{reg.event.title}</p>
                              <span className={`text-[10px] uppercase font-pixel tracking-wider ${
                                reg.event.type === 'COURSE' ? 'text-vista-purple' : reg.event.type === 'WORKSHOP' ? 'text-vista-blue' : 'text-vista-gold'
                              }`}>
                                {reg.event.type}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className={`text-xs px-2 py-0.5 pixel-corners ${
                                reg.status === 'ATTENDED' ? 'bg-vista-green/15 text-vista-green' : reg.status === 'WINNER' ? 'bg-vista-gold/15 text-vista-gold' : 'bg-vista-cream/10 text-vista-cream/60'
                              }`}>
                                {reg.status}
                              </span>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </section>
              </div>

              {/* XP logs adjustments */}
              <section className="pixel-corners border-2 border-vista-cream/15 bg-vista-night-2/70 p-6 font-mono-pixel text-sm">
                <h2 className="mb-4 font-pixel text-[10px] text-vista-cream/70">XP TRANSACTION HISTORY</h2>
                <div className="flex flex-col gap-3 max-h-[250px] overflow-y-auto pr-1">
                  {profile.xpAdjustments?.length === 0 ? (
                    <p className="text-xs text-vista-cream/40 py-2">No transaction logs available.</p>
                  ) : (
                    profile.xpAdjustments.map((log) => (
                      <div
                        key={log.id}
                        className="flex justify-between items-center border-b border-vista-cream/5 pb-2"
                      >
                        <div>
                          <p className="text-vista-cream/90 font-bold">{log.reason}</p>
                          <p className="text-xs text-vista-cream/40">{new Date(log.createdAt).toLocaleString()}</p>
                        </div>
                        <span className={`font-bold ${log.amount > 0 ? 'text-vista-green' : 'text-vista-red'}`}>
                          {log.amount > 0 ? `+${log.amount}` : log.amount} XP
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          )}

          {/* COURSES TAB */}
          {activeTab === 'courses' && (
            <div className="grid gap-6">
              <h2 className="font-pixel text-sm text-vista-gold mb-2">My Academic Courses</h2>
              {courseList.length === 0 ? (
                <p className="font-mono-pixel text-vista-cream/50">No courses scheduled yet.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {courseList.map((course) => {
                    const registeredReg = profile.registrations?.find(
                      (r) => r.eventId === course.id && r.status !== 'CANCELLED'
                    )
                    const isEnrolled = !!registeredReg

                    return (
                      <div
                        key={course.id}
                        className="pixel-corners border-2 border-vista-cream/15 bg-vista-night-2/70 p-5 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="font-pixel text-[9px] text-vista-purple bg-vista-purple/10 px-2 py-0.5 pixel-corners">Course</span>
                            <span className="font-pixel text-[9px] text-vista-gold">+{course.xpReward} XP</span>
                          </div>
                          <h3 className="font-pixel text-xs leading-relaxed text-vista-cream">{course.title}</h3>
                          <p className="text-sm text-vista-cream/70 mt-2 line-clamp-3">{course.description}</p>

                          <div className="mt-4 flex flex-col gap-1 font-mono-pixel text-xs text-vista-cream/50">
                            <p>📅 {new Date(course.date).toLocaleDateString()}</p>
                            <p>📍 {course.venue}</p>
                          </div>
                        </div>

                        <div className="mt-5">
                          {isEnrolled ? (
                            <button
                              onClick={() => handleUnregister(course.id)}
                              className="w-full pixel-corners border-2 border-vista-red bg-vista-red/10 px-3 py-1.5 font-pixel text-[10px] text-vista-red hover:bg-vista-red hover:text-vista-cream transition-colors"
                            >
                              Leave Course
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRegister(course.id)}
                              className="w-full pixel-corners border-2 border-vista-gold bg-vista-gold text-vista-night px-3 py-1.5 font-pixel text-[10px] hover:bg-vista-purple hover:text-vista-cream hover:border-vista-purple transition-all"
                            >
                              Enroll Now
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* WORKSHOPS TAB */}
          {activeTab === 'workshops' && (
            <div className="grid gap-6">
              <h2 className="font-pixel text-sm text-vista-gold mb-2">My Applied Workshops</h2>
              {workshopList.length === 0 ? (
                <p className="font-mono-pixel text-vista-cream/50">No workshops scheduled yet.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {workshopList.map((workshop) => {
                    const registeredReg = profile.registrations?.find(
                      (r) => r.eventId === workshop.id && r.status !== 'CANCELLED'
                    )
                    const isEnrolled = !!registeredReg

                    return (
                      <div
                        key={workshop.id}
                        className="pixel-corners border-2 border-vista-cream/15 bg-vista-night-2/70 p-5 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="font-pixel text-[9px] text-vista-blue bg-vista-blue/10 px-2 py-0.5 pixel-corners">Workshop</span>
                            <span className="font-pixel text-[9px] text-vista-gold">+{workshop.xpReward} XP</span>
                          </div>
                          <h3 className="font-pixel text-xs leading-relaxed text-vista-cream">{workshop.title}</h3>
                          <p className="text-sm text-vista-cream/70 mt-2 line-clamp-3">{workshop.description}</p>

                          <div className="mt-4 flex flex-col gap-1 font-mono-pixel text-xs text-vista-cream/50">
                            <p>📅 {new Date(workshop.date).toLocaleDateString()}</p>
                            <p>📍 {workshop.venue}</p>
                          </div>
                        </div>

                        <div className="mt-5">
                          {isEnrolled ? (
                            <button
                              onClick={() => handleUnregister(workshop.id)}
                              className="w-full pixel-corners border-2 border-vista-red bg-vista-red/10 px-3 py-1.5 font-pixel text-[10px] text-vista-red hover:bg-vista-red hover:text-vista-cream transition-colors"
                            >
                              Leave Workshop
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRegister(workshop.id)}
                              className="w-full pixel-corners border-2 border-vista-gold bg-vista-gold text-vista-night px-3 py-1.5 font-pixel text-[10px] hover:bg-vista-purple hover:text-vista-cream hover:border-vista-purple transition-all"
                            >
                              Claim Seat
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* EVENTS TAB */}
          {activeTab === 'events' && (
            <div className="grid gap-6">
              <h2 className="font-pixel text-sm text-vista-gold mb-2">Upcoming Events & Seminars</h2>
              {eventList.length === 0 ? (
                <p className="font-mono-pixel text-vista-cream/50">No events scheduled yet.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {eventList.map((event) => {
                    const registeredReg = profile.registrations?.find(
                      (r) => r.eventId === event.id && r.status !== 'CANCELLED'
                    )
                    const isEnrolled = !!registeredReg

                    return (
                      <div
                        key={event.id}
                        className="pixel-corners border-2 border-vista-cream/15 bg-vista-night-2/70 p-5 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="font-pixel text-[9px] text-vista-gold bg-vista-gold/10 px-2 py-0.5 pixel-corners">Event</span>
                            <span className="font-pixel text-[9px] text-vista-gold">+{event.xpReward} XP</span>
                          </div>
                          <h3 className="font-pixel text-xs leading-relaxed text-vista-cream">{event.title}</h3>
                          <p className="text-sm text-vista-cream/70 mt-2 line-clamp-3">{event.description}</p>

                          <div className="mt-4 flex flex-col gap-1 font-mono-pixel text-xs text-vista-cream/50">
                            <p>📅 {new Date(event.date).toLocaleDateString()}</p>
                            <p>📍 {event.venue}</p>
                          </div>
                        </div>

                        <div className="mt-5">
                          {isEnrolled ? (
                            <button
                              onClick={() => handleUnregister(event.id)}
                              className="w-full pixel-corners border-2 border-vista-red bg-vista-red/10 px-3 py-1.5 font-pixel text-[10px] text-vista-red hover:bg-vista-red hover:text-vista-cream transition-colors"
                            >
                              Leave Event
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRegister(event.id)}
                              className="w-full pixel-corners border-2 border-vista-gold bg-vista-gold text-vista-night px-3 py-1.5 font-pixel text-[10px] hover:bg-vista-purple hover:text-vista-cream hover:border-vista-purple transition-all"
                            >
                              Join Event
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="grid gap-6">
              <h2 className="font-pixel text-sm text-vista-gold mb-2">Inbox & Notifications</h2>
              <div className="flex flex-col gap-4 font-mono-pixel">
                {profile.notifications?.length === 0 ? (
                  <p className="text-vista-cream/50">You have no new messages in your inbox.</p>
                ) : (
                  profile.notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`pixel-corners border-2 p-5 ${
                        n.read ? 'border-vista-cream/10 bg-vista-night-2/30 opacity-60' : 'border-vista-gold bg-vista-gold/5'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-pixel text-xs text-vista-cream">{n.title}</h3>
                        <span className="text-[10px] text-vista-cream/40">{new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-vista-cream/80 mt-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
