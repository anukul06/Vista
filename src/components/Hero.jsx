import { motion } from 'framer-motion'
import PixelBackground from './PixelBackground'
import PixelPlanet from './PixelPlanet'
import MountainDivider from './MountainDivider'

function PixelTrees() {
  const positions = [6, 16, 27, 72, 84, 93]
  return (
    <div className="absolute bottom-0 left-0 flex w-full justify-between px-4">
      {positions.map((p, i) => (
        <svg
          key={i}
          width="28"
          height="40"
          viewBox="0 0 28 40"
          className="text-vista-green"
          fill="currentColor"
          style={{ marginLeft: `${p === positions[0] ? 0 : 0}px` }}
        >
          <rect x="12" y="30" width="4" height="10" fill="#5c3a21" />
          <rect x="8" y="20" width="12" height="8" />
          <rect x="4" y="10" width="20" height="10" />
          <rect x="8" y="2" width="12" height="8" />
        </svg>
      ))}
    </div>
  )
}

export default function Hero({ onExploreClick, onLoginClick }) {
  return (
    <section id="top" className="relative flex h-screen min-h-[640px] w-full items-center justify-center overflow-hidden bg-vista-night">
      <div className="absolute inset-0 bg-gradient-to-b from-vista-night via-vista-night-2 to-vista-purple/60" />
      <PixelBackground starCount={440} cloudCount={4} seed={7} />

      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.3 }}
        className="animate-float-slow absolute right-[6%] top-[12%] z-[1] hidden sm:block"
      >
        <PixelPlanet size={24} pixelSize={9} seed={4.2} palette="earth" type="moon" lightAngle={-2.3} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="animate-float absolute left-[10%] top-[20%] z-[1] hidden md:block"
      >
        <PixelPlanet size={10} pixelSize={5} seed={1.1} palette="violet" lightAngle={-2.0} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="animate-float absolute right-[20%] top-[38%] z-[1] hidden lg:block"
      >
        <PixelPlanet size={7} pixelSize={4} seed={2.6} palette="rust" lightAngle={-1.6} />
      </motion.div>

      <MountainDivider
        baseColor="#3d2a5c"
        ridgeColor="#b09bd6"
        backColor="#28376e"
        backOpacity={0.7}
        fadeClass="from-vista-night-2"
        height="60%"
      />
      <PixelTrees />

      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-vista-purple/40 to-transparent blur-md" />

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-4"
        >
          <h1 className="font-pixel text-4xl text-vista-gold drop-shadow-[3px_3px_0_rgba(0,0,0,0.5)] sm:text-6xl">
            VISTA
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-mono-pixel text-2xl text-vista-cream/90 sm:text-3xl"
        >
          Build. Learn. Create. Inspire.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="mt-2 text-base text-vista-gold-2/90 sm:text-lg"
        >
          Vision, Innovation, Skills, Talent, Arts
        </motion.p>

        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-2 inline-block h-6 w-3 animate-blink bg-vista-gold"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-10 flex gap-5"
        >
          <button
            onClick={onExploreClick}
            className="pixel-corners border-2 border-vista-gold bg-vista-gold px-6 py-3 font-pixel text-xs text-vista-night transition-transform hover:-translate-y-0.5 hover:bg-vista-gold-2"
          >
            Explore
          </button>
          <button
            onClick={onLoginClick}
            className="pixel-corners border-2 border-vista-cream/60 px-6 py-3 font-pixel text-xs text-vista-cream transition-transform hover:-translate-y-0.5 hover:border-vista-cream"
          >
            Login
          </button>
        </motion.div>
      </div>
    </section>
  )
}
