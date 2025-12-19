import { useState } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import axios from 'axios'

export default function LoginForm({ onSuccess, onSwitch }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  const googleLogin = useGoogleLogin({
    onSuccess: tokenResponse => {
      setStatus('Google connected (stub).')
      onSuccess?.()
    },
    onError: () => setStatus('Google login failed (stub).')
  })

  async function submit(e){
    e.preventDefault()
    setLoading(true)
    try {
      // Stubbed API login
      await new Promise(r=>setTimeout(r, 700))
      setStatus('Logged in (mock).')
      onSuccess?.()
    } catch (e) {
      setStatus('Login failed (mock).')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <h3 className="text-lg font-semibold">Welcome back</h3>
      <input className="w-full glass-input px-3 py-2" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
      <input className="w-full glass-input px-3 py-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
      <button className="w-full glass-button py-2" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
      <button type="button" onClick={()=>googleLogin()} className="w-full glass-button py-2">Sign in with Google</button>
      <button type="button" onClick={()=>setStatus('MetaMask connected (stub).')} className="w-full glass-button py-2">Connect MetaMask</button>
      {status && <p className="text-sm text-white/80">{status}</p>}
      <p className="text-sm text-center text-white/70">No account? <button type="button" onClick={onSwitch} className="underline">Sign up</button></p>
    </form>
  )
}
