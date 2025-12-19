export default function Skills(){
  return (
    <div className="glass-card p-5">
      <p className="font-semibold mb-2">Skills & Categories</p>
      <div className="flex gap-2 flex-wrap">{['Solidity','React','Node'].map(s=> <span key={s} className="px-3 py-1 rounded-full bg-white/10 text-sm">{s}</span>)}</div>
    </div>
  )
}
