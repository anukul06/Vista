import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const YEAR_OPTIONS = [
  { value: 'FIRST', label: '1st Year' },
  { value: 'SECOND', label: '2nd Year' },
  { value: 'THIRD', label: '3rd Year' },
  { value: 'FOURTH', label: '4th Year' },
]

const LOGIN_FIELDS = [
  { name: 'email', label: 'Email', type: 'email', placeholder: 'you@college.edu' },
  { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
]

const SIGNUP_FIELDS = [
  { name: 'name', label: 'Name', type: 'text', placeholder: 'Aarav Sen' },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'you@college.edu' },
  { name: 'rollNumber', label: 'Roll Number', type: 'text', placeholder: 'CSE21042' },
  { name: 'department', label: 'Department', type: 'text', placeholder: 'CSE' },
  { name: 'year', label: 'Year', type: 'select', options: YEAR_OPTIONS },
  { name: 'githubUsername', label: 'GitHub Username', type: 'text', placeholder: 'octocat', optional: true },
  { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
]

const EMPTY_FORM = {
  name: '',
  email: '',
  rollNumber: '',
  department: '',
  year: 'FIRST',
  githubUsername: '',
  password: '',
}

export default function LoginModal({ open, onClose }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { login, signup } = useAuth()

  useEffect(() => {
    if (open) {
      setMode('login')
      setForm(EMPTY_FORM)
      setError('')
      setSubmitting(false)
    }
  }, [open])

  const fields = mode === 'login' ? LOGIN_FIELDS : SIGNUP_FIELDS

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password })
      } else {
        await signup({
          name: form.name,
          email: form.email,
          rollNumber: form.rollNumber,
          department: form.department,
          year: form.year,
          githubUsername: form.githubUsername || undefined,
          password: form.password,
        })
      }
      onClose()
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const switchMode = (next) => {
    setMode(next)
    setForm(EMPTY_FORM)
    setError('')
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 px-4 py-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            className="pixel-corners relative max-h-[85vh] w-full max-w-md overflow-y-auto border-2 border-vista-gold bg-vista-night-2 p-8 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-vista-cream/60 hover:text-vista-cream"
              aria-label="Close login"
            >
              <X size={20} />
            </button>

            <h2 className="mb-1 font-pixel text-base text-vista-gold">
              {mode === 'login' ? 'Player Login' : 'Create Character'}
            </h2>
            <p className="mb-6 text-vista-cream/60">
              {mode === 'login' ? 'Enter the world of VISTA.' : 'Join the world of VISTA.'}
            </p>

            <div className="mb-6 flex pixel-corners border-2 border-vista-cream/20 bg-vista-night p-1">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`flex-1 py-2 font-pixel text-[10px] transition-colors ${
                  mode === 'login' ? 'bg-vista-gold text-vista-night' : 'text-vista-cream/60 hover:text-vista-cream'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className={`flex-1 py-2 font-pixel text-[10px] transition-colors ${
                  mode === 'signup' ? 'bg-vista-gold text-vista-night' : 'text-vista-cream/60 hover:text-vista-cream'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {fields.map((f) =>
                f.type === 'select' ? (
                  <label key={f.name} className="flex flex-col gap-1.5">
                    <span className="font-pixel text-[10px] tracking-wide text-vista-cream/70">{f.label}</span>
                    <select
                      required
                      value={form[f.name]}
                      onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                      className="pixel-corners border-2 border-vista-cream/20 bg-vista-night px-3 py-2 text-lg text-vista-cream outline-none focus:border-vista-gold"
                    >
                      {f.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <label key={f.name} className="flex flex-col gap-1.5">
                    <span className="font-pixel text-[10px] tracking-wide text-vista-cream/70">
                      {f.label}
                      {f.optional && <span className="text-vista-cream/40"> (optional)</span>}
                    </span>
                    <input
                      required={!f.optional}
                      type={f.type}
                      placeholder={f.placeholder}
                      value={form[f.name]}
                      onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                      className="pixel-corners border-2 border-vista-cream/20 bg-vista-night px-3 py-2 text-lg text-vista-cream outline-none placeholder:text-vista-cream/30 focus:border-vista-gold"
                    />
                  </label>
                ),
              )}

              {error && (
                <p className="pixel-corners border-2 border-vista-red bg-vista-red/10 px-3 py-2 text-sm text-vista-red-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 flex items-center justify-center gap-2 pixel-corners border-2 border-vista-gold bg-vista-gold px-4 py-3 font-pixel text-xs text-vista-night transition-transform hover:-translate-y-0.5 hover:bg-vista-gold-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {submitting ? 'Please wait...' : mode === 'login' ? 'Enter VISTA' : 'Create & Enter'}
              </button>

              <p className="text-center text-sm text-vista-cream/50">
                {mode === 'login' ? (
                  <>
                    New here?{' '}
                    <button type="button" onClick={() => switchMode('signup')} className="text-vista-gold underline">
                      Create an account
                    </button>
                  </>
                ) : (
                  <>
                    Already a member?{' '}
                    <button type="button" onClick={() => switchMode('login')} className="text-vista-gold underline">
                      Log in
                    </button>
                  </>
                )}
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
