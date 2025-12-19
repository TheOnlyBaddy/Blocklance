import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LoginForm from './LoginForm.jsx'
import SignupForm from './SignupForm.jsx'

export default function AuthModal({ open, onClose }) {
  const [mode, setMode] = useState('login')

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose?.() }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          aria-modal="true" role="dialog" aria-label="Authentication modal">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <motion.div className="relative glass-modal w-full max-w-md p-6" layout
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}>
            <div className="flex justify-center gap-2 mb-4">
              <button onClick={() => setMode('login')} className={`px-3 py-1 rounded-full text-sm ${mode==='login' ? 'bg-white/15' : 'bg-white/5'}`}>Login</button>
              <button onClick={() => setMode('signup')} className={`px-3 py-1 rounded-full text-sm ${mode==='signup' ? 'bg-white/15' : 'bg-white/5'}`}>Signup</button>
            </div>
            <AnimatePresence mode="wait">
              {mode === 'login' ? (
                <motion.div key="login" initial={{ x: 40, opacity:0 }} animate={{ x:0, opacity:1 }} exit={{ x:-40, opacity:0 }}>
                  <LoginForm onSuccess={onClose} onSwitch={() => setMode('signup')} />
                </motion.div>
              ) : (
                <motion.div key="signup" initial={{ x: -40, opacity:0 }} animate={{ x:0, opacity:1 }} exit={{ x:40, opacity:0 }}>
                  <SignupForm onSuccess={onClose} onSwitch={() => setMode('login')} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
