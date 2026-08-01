import { motion } from 'framer-motion'

// A little astronaut-helmeted bird — body + helmet stay fixed, wings swap
// between an "up" and "down" frame for a cheap 2-frame flap, dino-game style.
export default function PixelBird({ scale = 1, flip = false, flapSpeed = 0.22 }) {
  return (
    <svg
      width={34 * scale}
      height={24 * scale}
      viewBox="0 0 34 24"
      style={{ transform: flip ? 'scaleX(-1)' : undefined }}
    >
      {/* wing — animates between the two frames below */}
      <motion.g
        fill="#c9432f"
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: flapSpeed * 2, repeat: Infinity, ease: 'steps(1)' }}
      >
        <rect x="6" y="14" width="10" height="4" />
        <rect x="2" y="17" width="8" height="4" />
      </motion.g>
      <motion.g
        fill="#c9432f"
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: flapSpeed * 2, repeat: Infinity, ease: 'steps(1)' }}
      >
        <rect x="4" y="6" width="10" height="4" />
        <rect x="0" y="9" width="8" height="4" />
      </motion.g>

      {/* body */}
      <rect x="12" y="12" width="12" height="8" fill="#c9432f" />
      <rect x="22" y="14" width="6" height="4" fill="#e8b64c" />

      {/* astronaut helmet */}
      <rect x="14" y="2" width="14" height="12" fill="#ede6d6" />
      <rect x="12" y="4" width="2" height="8" fill="#ede6d6" />
      <rect x="28" y="4" width="2" height="8" fill="#ede6d6" />
      <rect x="17" y="5" width="8" height="7" fill="#3d4fb8" />
      <rect x="18" y="6" width="2" height="2" fill="#aebcff" />
      <rect x="14" y="9" width="14" height="2" fill="#b9b2a0" />
    </svg>
  )
}
