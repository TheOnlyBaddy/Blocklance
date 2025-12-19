export default function MessageBubble({ me, children }){
  return <div className={`max-w-[70%] glass-card p-2 ${me ? 'self-end' : 'self-start'}`}>{children}</div>
}
