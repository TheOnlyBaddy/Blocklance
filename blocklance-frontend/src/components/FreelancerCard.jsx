import GlassCard from './GlassCard.jsx'

export default function FreelancerCard({ f }){
  return (
    <GlassCard className="p-4 hover:translate-y-[-4px] transition-transform glass-strong">
      <div className="flex items-center gap-3">
        <img src={`https://i.pravatar.cc/64?u=${encodeURIComponent(f.name)}`} alt="avatar" className="h-12 w-12 rounded-xl" />
        <div>
          <p className="font-semibold text-[#1a1a1a]">{f.name}</p>
          <p className="text-sm text-[#4a4a4a]">{f.role}</p>
        </div>
        <div className="ml-auto text-sm"><span className="text-[#f4c430]">⭐</span> {f.rating.toFixed(1)}</div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-sm text-[#4a4a4a]">From ${f.price}/hr</p>
        <button className="glass-button px-3 py-1 text-sm">View Profile</button>
      </div>
    </GlassCard>
  )
}
