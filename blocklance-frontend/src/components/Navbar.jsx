import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, LogIn, LogOut, User as UserIcon, LayoutDashboard, Settings as SettingsIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useContext } from 'react'
import { NotificationContext } from '../context/NotificationContext.jsx'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { notifications } = useContext(NotificationContext) || { notifications: [] }
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()
  const displayName = (user?.name || user?.username || user?.email || '').trim()
  const initials = displayName.split(' ').map((n) => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
  const notifCount = Array.isArray(notifications) ? notifications.filter(n=>!n.read).length : 0

  useEffect(() => {
    function onDocClick(e){
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    function onEsc(e){ if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [])

  const dashboardPath = user?.role === 'client' ? '/dashboard/client' : '/dashboard/freelancer'
  const profileId = user?.uid || user?._id || user?.id

  const handleProfileClick = () => {
    setMenuOpen(false)
    if (user) navigate('/my-profile')
    else navigate('/login')
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/60 backdrop-blur-xl border-b border-white/40 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-10 py-3">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 font-semibold text-[#1a1a1a]">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-brand-mint to-brand-blue" />
            <span>Blocklance</span>
          </Link>

          <div className="flex-1 hidden md:flex">
            <div className="w-full relative">
              <input aria-label="Search" placeholder="Search talent, gigs, projects..." className="w-full pl-10 pr-4 py-2 glass-input placeholder:text-[#333]/80" />
              <Search className="h-5 w-5 absolute left-3 top-2.5 text-[#333]/80" />
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 justify-center">
            <a href="#about" className="text-sm text-[#4a4a4a] hover:text-[#1a1a1a]">About</a>
            <a href="#how" className="text-sm text-[#4a4a4a] hover:text-[#1a1a1a]">How It Works</a>
            <a href="#contact" className="text-sm text-[#4a4a4a] hover:text-[#1a1a1a]">Contact</a>
          </nav>

          {!user ? (
            <Link to="/login" className="glass-button px-4 py-2 flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              <span>Login / Signup</span>
            </Link>
          ) : (
            <div className="flex items-center gap-3" ref={menuRef}>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-haspopup="true"
                  aria-expanded={menuOpen}
                  className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all hover:scale-[1.05] shadow-sm ${menuOpen ? 'border-[#007aff] shadow-md' : 'border-transparent hover:border-[#007aff]'}`}
                >
                  {user?.photoURL ? (
                    // eslint-disable-next-line jsx-a11y/alt-text
                    <img src={user.photoURL} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-sm">
                      {initials || 'U'}
                    </div>
                  )}
                </button>
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] px-1 rounded-full bg-red-500 text-white text-[10px] leading-5 text-center font-semibold shadow">
                    {notifCount > 9 ? '9+' : notifCount}
                  </span>
                )}

                {menuOpen && (
                  <div
                    className="absolute right-0 md:right-0 md:left-auto mt-3 z-50 md:w-52 left-0 w-[calc(100vw-2rem)] rounded-2xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-lg p-2 animate-fadeIn transition-all duration-200"
                    role="menu"
                  >
                    <ul className="flex flex-col text-[#1a1a1a]">
                      <li>
                        <button
                          onClick={handleProfileClick}
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-[0.95rem] font-medium rounded-xl text-left text-gray-700 hover:bg-white/80 hover:shadow-sm transition"
                        >
                          <UserIcon size={16} /> Profile
                        </button>
                      </li>
                      <li>
                        <Link
                          to={dashboardPath}
                          className="flex items-center gap-2 px-3 py-2.5 text-[0.95rem] font-medium rounded-xl text-gray-700 hover:bg-white/80 hover:shadow-sm transition"
                          onClick={() => setMenuOpen(false)}
                        >
                          <LayoutDashboard size={16} /> Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/settings"
                          className="flex items-center gap-2 px-3 py-2.5 text-[0.95rem] font-medium rounded-xl text-gray-700 hover:bg-white/80 hover:shadow-sm transition"
                          onClick={() => setMenuOpen(false)}
                        >
                          <SettingsIcon size={16} /> Account Settings
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={() => { setMenuOpen(false); logout() }}
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-[0.95rem] font-medium rounded-xl text-left text-gray-700 hover:bg-white/80 hover:shadow-sm transition"
                        >
                          <LogOut size={16} /> Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
