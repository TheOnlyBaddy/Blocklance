export default function Portfolio(){
  return <div className="glass-card p-5 grid sm:grid-cols-2 gap-3">{[1,2,3,4].map(i=> <div key={i} className="glass-card h-24" />)}</div>
}
