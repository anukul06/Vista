import PixelBackground from './PixelBackground'
import MountainDivider from './MountainDivider'

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t-2 border-vista-cream/10 bg-vista-night px-6 py-10 text-center">
      <PixelBackground starCount={80} cloudCount={0} seed={55} />
      <MountainDivider
        baseColor="#2e1a47"
        ridgeColor="#9c7fc2"
        backColor="#1d2a6b"
        fadeClass="from-vista-night"
        height={90}
        className="opacity-60"
      />
      <div className="relative z-10">
        <p className="font-pixel text-xs text-vista-gold">VISTA</p>
        <p className="mt-3 text-vista-cream/50">Build. Learn. Create. Inspire.</p>
        <p className="mt-4 text-sm text-vista-cream/30">© {new Date().getFullYear()} VISTA Technical Club. All quests reserved.</p>
      </div>
    </footer>
  )
}
