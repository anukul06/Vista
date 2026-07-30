import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

const links = [
  { label: 'About', href: '#about' },
  { label: 'Domains', href: '#domains' },
  { label: 'Events', href: '#events' },
  { label: 'Leaderboard', href: '#leaderboard' },
]

export default function Nav({ onLoginClick }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled ? 'bg-vista-night/70 backdrop-blur-sm' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <a href="#top" className="font-pixel text-sm text-vista-gold">
          VISTA
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-mono-pixel text-lg text-vista-cream/80 transition-colors hover:text-vista-gold"
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={onLoginClick}
            className="pixel-corners border-2 border-vista-gold bg-vista-gold/10 px-4 py-1.5 font-pixel text-[11px] text-vista-gold transition-colors hover:bg-vista-gold hover:text-vista-night"
          >
            Login
          </button>
        </div>

        <button className="text-vista-cream md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="flex flex-col items-center gap-4 bg-vista-night/95 px-5 pb-6 md:hidden">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="font-mono-pixel text-lg text-vista-cream/80 hover:text-vista-gold"
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={() => {
              setOpen(false)
              onLoginClick()
            }}
            className="pixel-corners border-2 border-vista-gold bg-vista-gold/10 px-4 py-1.5 font-pixel text-[11px] text-vista-gold"
          >
            Login
          </button>
        </div>
      )}
    </nav>
  )
}
