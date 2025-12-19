import GlassCard from './GlassCard.jsx'

export default function TestimonialCard({ t }){
  return (
    <GlassCard className="p-4 animate-floaty glass-strong">
      <p className="text-sm italic text-[#1a1a1a]">“{t.quote}”</p>
      <div className="mt-3 text-sm text-[#4a4a4a]"><span className="text-[#f4c430]">⭐</span> {t.rating.toFixed(1)} — {t.author}</div>
    </GlassCard>
  )
}
