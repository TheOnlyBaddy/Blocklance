export default function Composer(){
  return (
    <form className="flex gap-2 pt-2" onSubmit={e=>e.preventDefault()}>
      <input className="flex-1 glass-input px-3 py-2" placeholder="Type a message" />
      <button className="glass-button px-4">Send</button>
    </form>
  )
}
