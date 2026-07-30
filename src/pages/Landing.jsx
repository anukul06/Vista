import { useState } from 'react'
import Nav from '../components/Nav'
import Hero from '../components/Hero'
import About from '../components/About'
import Domains from '../components/Domains'
import Events from '../components/Events'
import Leaderboard from '../components/Leaderboard'
import Footer from '../components/Footer'
import LoginModal from '../components/LoginModal'

export default function Landing() {
  const [loginOpen, setLoginOpen] = useState(false)

  return (
    <div className="min-h-screen bg-vista-night">
      <Nav onLoginClick={() => setLoginOpen(true)} />
      <Hero
        onExploreClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
        onLoginClick={() => setLoginOpen(true)}
      />
      <About />
      <Domains />
      <Events />
      <Leaderboard />
      <Footer />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  )
}
