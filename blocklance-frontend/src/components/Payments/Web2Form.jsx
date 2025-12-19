export default function Web2Form(){
  return (
    <div className="space-y-2">
      <input className="glass-input px-3 py-2" placeholder="Card Number" />
      <div className="grid grid-cols-2 gap-2">
        <input className="glass-input px-3 py-2" placeholder="MM/YY" />
        <input className="glass-input px-3 py-2" placeholder="CVV" />
      </div>
    </div>
  )
}
