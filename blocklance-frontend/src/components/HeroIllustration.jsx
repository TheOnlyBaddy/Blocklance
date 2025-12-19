export default function HeroIllustration(){
  return (
    <div className="w-full h-72 md:h-96 glass-card flex items-center justify-center animate-floaty shadow-[0_8px_24px_rgba(0,0,0,0.05)]">
      <div className="rounded-2xl border border-white/60 bg-gradient-to-br from-primary/10 to-accent/10 p-6">
      <svg width="220" height="120" viewBox="0 0 220 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-90">
        <rect x="10" y="20" width="200" height="80" rx="16" fill="url(#g)" stroke="white" strokeOpacity="0.25"/>
        <circle cx="40" cy="60" r="18" fill="white" fillOpacity="0.15"/>
        <rect x="70" y="48" width="90" height="12" rx="6" fill="white" fillOpacity="0.25"/>
        <rect x="70" y="66" width="60" height="10" rx="5" fill="white" fillOpacity="0.18"/>
        <defs>
          <linearGradient id="g" x1="10" y1="20" x2="210" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--color-mint)" stopOpacity="0.5"/>
            <stop offset="1" stopColor="var(--color-blue)" stopOpacity="0.4"/>
          </linearGradient>
        </defs>
      </svg>
      </div>
    </div>
  )
}
