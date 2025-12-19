import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Chrome, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * LoginPage Component
 * Enhanced full-page login experience with liquid-glass design
 */
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { emailLogin, googleLogin, metamaskLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('[Auth] Email/password login: starting');
      const user = await emailLogin(email, password);
      console.log('[Auth] Email/password login: success', { user });
      const role = user?.role || 'client';
      const dest = role === 'freelancer' ? '/dashboard/freelancer' : '/dashboard/client';
      console.log('[Auth] Navigating to', dest, 'for role:', role);
      window.location.href = dest;
    } catch (err) {
      console.error('[Auth] Email/password login: error', err);
      alert(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      console.log('[Auth] Google login: starting');
      const user = await googleLogin();
      console.log('[Auth] Google login: success', { user });
      const role = user?.role || 'client';
      const dest = role === 'freelancer' ? '/dashboard/freelancer' : '/dashboard/client';
      console.log('[Auth] Navigating to', dest, 'for role:', role);
      window.location.href = dest;
    } catch (err) {
      console.error('[Auth] Google login: error', err);
      alert(err?.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMetaMaskLogin = async () => {
    setLoading(true);
    try {
      console.log('[Auth] MetaMask login: starting');
      const { user } = await metamaskLogin();
      console.log('[Auth] MetaMask login: success', { user });
      
      // Get the redirect URL from the URL parameters or use default based on role
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get('redirect') || 
                        (user?.role === 'freelancer' ? '/dashboard/freelancer' : '/dashboard/client');
      
      console.log('[Auth] Navigating to', redirectTo, 'for role:', user?.role || 'client');
      window.location.href = redirectTo;
    } catch (err) {
      console.error('[Auth] MetaMask login: error', {
        name: err.name,
        message: err.message,
        code: err.code,
        status: err.status,
        response: err.response?.data
      });
      
      // More user-friendly error messages
      let errorMessage = 'Failed to connect with MetaMask. ';
      
      if (err.code === 'ACTION_REJECTED') {
        errorMessage = 'You rejected the signature request. Please try again and sign the message to continue.';
      } else if (err.code === 'METAMASK_NOT_INSTALLED') {
        errorMessage = 'MetaMask is not installed. Please install the MetaMask extension to continue.';
      } else if (err.status === 400) {
        errorMessage = 'Authentication failed. Please try again or use another login method.';
      } else if (err.message.includes('User denied account access')) {
        errorMessage = 'You need to connect your MetaMask account to continue.';
      } else {
        errorMessage = err.message || 'An unexpected error occurred. Please try again.';
      }
      
      // Show error toast or alert
      alert(errorMessage);
    } finally {
      if (!window.location.href.includes('/dashboard')) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="h-[100svh] overflow-hidden flex items-center justify-center auth-page-background px-4 md:px-8 py-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[45%_55%] gap-6 lg:gap-8 items-center">
        {/* Left Column - Brand & Artwork (45%) */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden md:flex flex-col"
        >
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-3 leading-tight">
              Welcome Back to{' '}
              <Link to="/" className="bg-gradient-to-r from-[#007aff] to-[#9b59b6] bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                Blocklance
              </Link>
            </h1>
            <p className="text-lg md:text-xl text-[#3a3a3a] mb-4">
              Connect with top talent and build amazing projects together.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-[26px] p-8"
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div className="flex items-center justify-center">
              <svg width="220" height="120" viewBox="0 0 220 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-90">
                <rect x="10" y="20" width="200" height="80" rx="16" fill="url(#g)" stroke="#fff" strokeOpacity="0.25"/>
                <circle cx="40" cy="60" r="18" fill="#fff" fillOpacity="0.15"/>
                <rect x="70" y="48" width="90" height="12" rx="6" fill="#fff" fillOpacity="0.25"/>
                <rect x="70" y="66" width="60" height="10" rx="5" fill="#fff" fillOpacity="0.18"/>
                <defs>
                  <linearGradient id="g" x1="10" y1="20" x2="210" y2="100" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#007aff" stopOpacity="0.15"/>
                    <stop offset="1" stopColor="#9b59b6" stopOpacity="0.15"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column - Form (55%) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <div className="glass-card p-6 md:p-8 max-w-md w-full">
            <div className="mb-6">
              <h2 className="text-[1.75rem] font-bold text-[#1a1a1a] mb-2">Sign In</h2>
              <p className="text-[#4a4a4a] text-sm">Enter your credentials to access your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#3a3a3a] mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a4a4a] opacity-75" size={20} />
                  <input id="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/80 border border-gray-200/50 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#007aff] focus:border-[#007aff] transition-all" placeholder="Enter your email" required />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#3a3a3a] mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a4a4a] opacity-75" size={20} />
                  <input id="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/80 border border-gray-200/50 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#007aff] focus:border-[#007aff] transition-all" placeholder="Enter your password" required />
                </div>
              </div>

              <div className="flex justify-end">
                <button type="button" className="text-sm text-[#4a4a4a] hover:text-[#007aff] hover:underline transition-colors">Forgot password?</button>
              </div>

              <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full py-3 rounded-full text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all" style={{ background: 'linear-gradient(90deg, #007aff, #5b9aff)' }}>
                {loading ? 'Signing in...' : 'Sign In'}
              </motion.button>

              <div className="relative flex items-center my-6">
                <div className="flex-1 border-t border-gray-200"></div>
                <span className="px-4 text-sm bg-gradient-to-r from-[#007aff] to-[#9b59b6] bg-clip-text text-transparent font-medium">or</span>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button type="button" onClick={handleGoogleLogin} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1 flex items-center justify-center space-x-3 py-3 rounded-lg bg-white border border-black/10 shadow-sm hover:shadow-md transition-all">
                  <Chrome size={20} className="text-[#4285F4]" />
                  <span className="text-[#333] font-medium text-sm">Google</span>
                </motion.button>
                <motion.button type="button" onClick={handleMetaMaskLogin} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1 flex items-center justify-center space-x-3 py-3 rounded-lg bg-white border border-black/10 shadow-sm hover:shadow-md transition-all">
                  <Wallet size={20} className="text-[#F6851B]" />
                  <span className="text-[#333] font-medium text-sm">MetaMask</span>
                </motion.button>
              </div>

              <div className="text-center pt-4">
                <p className="text-sm text-[#6b6b6b]">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-[#007aff] font-semibold hover:text-[#005bbb] hover:underline transition-colors">Sign up</Link>
                </p>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
