export default function Reviews(){
  return <div className="glass-card p-5 grid sm:grid-cols-2 gap-3">{[1,2,3].map(i=> <div key={i} className="glass-card p-3 text-sm">Great job!</div>)}</div>
}
