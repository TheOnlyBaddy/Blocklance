export default function Header(){
  return (
    <div className="p-5 glass-card flex items-center gap-4">
      <div className="h-16 w-16 rounded-2xl bg-white/20" />
      <div>
        <p className="text-lg font-semibold">Profile Header</p>
        <p className="text-sm text-white/70">Role • ⭐ 4.9</p>
      </div>
      <button className="ml-auto glass-button px-4 py-2">Hire</button>
    </div>
  )
}
