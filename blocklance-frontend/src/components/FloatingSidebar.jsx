import { NavLink } from 'react-router-dom'

export default function FloatingSidebar({ items = [] }) {
  return (
    <aside className="glass-card p-3 md:p-5 h-fit sticky top-24 md:top-28">
      <nav className="flex flex-col gap-2">
        {items.map((it, idx) => (
          <NavLink key={`${it.to}-${idx}`} to={it.to} className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition ${isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-200 hover:text-blue-300 hover:bg-white/5'}`}>
            {it.icon}
            <span className="text-sm">{it.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
