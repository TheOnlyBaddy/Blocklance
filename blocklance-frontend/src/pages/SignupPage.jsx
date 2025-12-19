import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Chrome, Wallet, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * SignupPage Component
 * Enhanced full-page signup experience with liquid-glass design
 */
export default function SignupPage() {
  const [step, setStep] = useState(1); // 1: Role, 2: Basic info, 3: Onboarding (freelancer only)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: null, // 'freelancer' or 'client'
    skills: [],
    categories: [],
    bio: '',
  });
  const [loading, setLoading] = useState(false);
  const { emailSignup, googleLogin, metamaskLogin } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.role) {
        alert('Please select a role');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Validate basic info
      if (!formData.name || !formData.email || !formData.password) {
        alert('Please fill in all fields');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      // If freelancer, go to onboarding; otherwise, submit
      if (formData.role === 'freelancer') {
        setStep(3);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { user } = await emailPasswordSignup({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role,
      });
      navigate(user?.role === 'freelancer' ? '/dashboard/freelancer' : '/dashboard/client');
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      if (!formData.role) {
        alert('Please select a role');
        return;
      }
      const res = await loginWithGoogle(formData.role);
      if (res?.pendingRedirect) return; // Redirect flow will resume after Firebase returns
      const { user } = res || {};
      if (user) {
        const role = user?.role || formData.role;
        navigate(role === 'freelancer' ? '/dashboard/freelancer' : '/dashboard/client');
      }
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Google signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMetaMaskSignup = async () => {
    setLoading(true);
    try {
      const { user } = await metamaskLogin();
      navigate(user?.role === 'freelancer' ? '/dashboard/freelancer' : '/dashboard/client');
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'MetaMask signup failed');
    } finally {
      setLoading(false);
    }
  };

  const availableSkills = ['React', 'Node.js', 'Python', 'Design', 'Writing', 'Marketing'];
  const availableCategories = ['Web Development', 'Design', 'Writing', 'Marketing', 'Blockchain'];

  // Calculate progress bar width
  const totalSteps = formData.role === 'freelancer' ? 3 : 2;
  const progressWidth = (step / totalSteps) * 100;

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
          {/* Brand Text - At Top */}
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-3 leading-tight">
              Join{' '}
              <Link to="/" className="bg-gradient-to-r from-[#007aff] to-[#9b59b6] bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                Blocklance
              </Link>
            </h1>
            <p className="text-lg md:text-xl text-[#3a3a3a] mb-4">
              Start your freelancing journey or find the perfect talent for your projects.
            </p>
            <p className="text-sm text-[#6b6b6b] italic">
              Your gateway to decentralized freelancing.
            </p>
          </div>

          {/* Floating Glass Card for Illustration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass p-6 rounded-[26px]"
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
            }}
          >
            {/* Animated Illustration Placeholder */}
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="aspect-square bg-gradient-to-br from-[#007aff]/10 via-[#9b59b6]/10 to-[#007aff]/5 rounded-2xl flex items-center justify-center border border-gray-200/50"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">✨</div>
                <p className="text-[#3a3a3a] text-sm font-medium">Illustration Placeholder</p>
                <p className="text-[#6b6b6b] text-xs mt-2">Replace with vector artwork or Lottie animation</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Right Column - Signup Form (55%) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full flex justify-center"
        >
          {/* Glass Form Card */}
          <div
            className="w-full max-w-[420px] p-6 md:p-10 rounded-[26px]"
            style={{
              background: 'rgba(255, 255, 255, 0.65)',
              backdropFilter: 'blur(18px) saturate(180%)',
              WebkitBackdropFilter: 'blur(18px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
            }}
          >
            {/* Mobile Brand */}
            <div className="md:hidden mb-8 text-center">
              <Link to="/" className="inline-block mb-4">
                <span className="text-3xl font-bold bg-gradient-to-r from-[#007aff] to-[#9b59b6] bg-clip-text text-transparent">
                  Blocklance
                </span>
              </Link>
              <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">
                Create Account
              </h1>
              <p className="text-[#4a4a4a] text-sm">
                Join Blocklance today
              </p>
            </div>

            {/* Desktop Title */}
            <div className="hidden md:block mb-4">
              <h2 className="text-[1.75rem] font-bold text-[#1a1a1a] mb-2">
                Sign Up
              </h2>
              <p className="text-[#4a4a4a] text-sm">
                Step {step} of {totalSteps}
              </p>
            </div>

            {/* Enhanced Progress Bar */}
            <div className="mb-6">
              <div className="h-[6px] bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressWidth}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #007aff, #9b59b6)',
                  }}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {/* Step 1: Role Selection */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-semibold text-[#1a1a1a] mb-4">I want to...</h3>

                  <div className="space-y-3">
                    <motion.button
                      type="button"
                      onClick={() => handleInputChange('role', 'freelancer')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full p-6 text-left rounded-[26px] transition-all ${
                        formData.role === 'freelancer'
                          ? 'bg-[#007aff]/20 border-2 border-[#007aff]/40'
                          : 'hover:bg-white/30'
                      }`}
                      style={{
                        background: formData.role === 'freelancer'
                          ? 'rgba(0, 122, 255, 0.2)'
                          : 'rgba(255, 255, 255, 0.6)',
                        backdropFilter: 'blur(18px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(18px) saturate(180%)',
                        border: formData.role === 'freelancer'
                          ? '2px solid rgba(0, 122, 255, 0.4)'
                          : '1px solid rgba(255, 255, 255, 0.4)',
                        boxShadow: formData.role === 'freelancer'
                          ? '0 0 16px rgba(0, 122, 255, 0.3), 0 8px 24px rgba(0, 0, 0, 0.05)'
                          : '0 8px 24px rgba(0, 0, 0, 0.05)',
                      }}
                    >
                      <h4 className="text-lg font-semibold text-[#1a1a1a] mb-2">Offer Services</h4>
                      <p className="text-[#4a4a4a] text-sm">
                        I'm a freelancer looking to offer my skills and services
                      </p>
                    </motion.button>

                    <motion.button
                      type="button"
                      onClick={() => handleInputChange('role', 'client')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full p-6 text-left rounded-[26px] transition-all ${
                        formData.role === 'client'
                          ? 'bg-[#007aff]/20 border-2 border-[#007aff]/40'
                          : 'hover:bg-white/30'
                      }`}
                      style={{
                        background: formData.role === 'client'
                          ? 'rgba(0, 122, 255, 0.2)'
                          : 'rgba(255, 255, 255, 0.6)',
                        backdropFilter: 'blur(18px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(18px) saturate(180%)',
                        border: formData.role === 'client'
                          ? '2px solid rgba(0, 122, 255, 0.4)'
                          : '1px solid rgba(255, 255, 255, 0.4)',
                        boxShadow: formData.role === 'client'
                          ? '0 0 16px rgba(0, 122, 255, 0.3), 0 8px 24px rgba(0, 0, 0, 0.05)'
                          : '0 8px 24px rgba(0, 0, 0, 0.05)',
                      }}
                    >
                      <h4 className="text-lg font-semibold text-[#1a1a1a] mb-2">Hire Talent</h4>
                      <p className="text-[#4a4a4a] text-sm">
                        I'm a client looking to hire freelancers for my projects
                      </p>
                    </motion.button>
                  </div>

                  {formData.role && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <motion.button
                        type="button"
                        onClick={handleNext}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 rounded-full text-white font-medium flex items-center justify-center space-x-2 transition-all"
                        style={{
                          background: 'linear-gradient(90deg, #007aff, #5b9aff)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.filter = 'brightness(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.filter = 'brightness(1)';
                        }}
                      >
                        <span>Continue</span>
                        <ArrowRight size={20} />
                      </motion.button>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Step 2: Basic Information */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-[#3a3a3a] mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a4a4a] opacity-75" size={20} />
                      <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/80 border border-gray-200/50 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#007aff] focus:border-[#007aff] transition-all"
                        style={{
                          boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.02)',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.boxShadow = '0 0 8px rgba(0, 122, 255, 0.4), inset 0 2px 4px rgba(0, 0, 0, 0.02)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.02)';
                        }}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email-signup" className="block text-sm font-medium text-[#3a3a3a] mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a4a4a] opacity-75" size={20} />
                      <input
                        id="email-signup"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/80 border border-gray-200/50 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#007aff] focus:border-[#007aff] transition-all"
                        style={{
                          boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.02)',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.boxShadow = '0 0 8px rgba(0, 122, 255, 0.4), inset 0 2px 4px rgba(0, 0, 0, 0.02)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.02)';
                        }}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password-signup" className="block text-sm font-medium text-[#3a3a3a] mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a4a4a] opacity-75" size={20} />
                      <input
                        id="password-signup"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/80 border border-gray-200/50 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#007aff] focus:border-[#007aff] transition-all"
                        style={{
                          boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.02)',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.boxShadow = '0 0 8px rgba(0, 122, 255, 0.4), inset 0 2px 4px rgba(0, 0, 0, 0.02)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.02)';
                        }}
                        placeholder="Create a password"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-[#3a3a3a] mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a4a4a] opacity-75" size={20} />
                      <input
                        id="confirm-password"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/80 border border-gray-200/50 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#007aff] focus:border-[#007aff] transition-all"
                        style={{
                          boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.02)',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.boxShadow = '0 0 8px rgba(0, 122, 255, 0.4), inset 0 2px 4px rgba(0, 0, 0, 0.02)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.02)';
                        }}
                        placeholder="Confirm your password"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <motion.button
                      type="button"
                      onClick={handlePrevious}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg bg-white/80 border border-black/10 shadow-sm hover:shadow-md transition-all"
                    >
                      <ArrowLeft size={20} />
                      <span className="text-[#333] font-medium">Back</span>
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={handleNext}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-3 rounded-full text-white font-medium flex items-center justify-center space-x-2 transition-all"
                      style={{
                        background: 'linear-gradient(90deg, #007aff, #5b9aff)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.filter = 'brightness(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.filter = 'brightness(1)';
                      }}
                    >
                      <span>{formData.role === 'freelancer' ? 'Continue' : 'Create Account'}</span>
                      <ArrowRight size={20} />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Freelancer Onboarding */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-semibold text-[#1a1a1a] mb-4">Complete Your Profile</h3>

                  {/* Skills */}
                  <div>
                    <label className="block text-sm font-medium text-[#3a3a3a] mb-2">
                      Skills
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableSkills.map((skill) => (
                        <motion.button
                          key={skill}
                          type="button"
                          onClick={() => {
                            const newSkills = formData.skills.includes(skill)
                              ? formData.skills.filter((s) => s !== skill)
                              : [...formData.skills, skill];
                            handleInputChange('skills', newSkills);
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-4 py-2 rounded-full text-sm transition-all ${
                            formData.skills.includes(skill)
                              ? 'bg-[#007aff]/20 text-[#007aff]'
                              : 'text-[#4a4a4a] hover:text-[#1a1a1a]'
                          }`}
                          style={{
                            background: formData.skills.includes(skill)
                              ? 'rgba(0, 122, 255, 0.2)'
                              : 'rgba(255, 255, 255, 0.6)',
                            backdropFilter: 'blur(18px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(18px) saturate(180%)',
                            border: '1px solid rgba(255, 255, 255, 0.4)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                          }}
                        >
                          {skill}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Categories */}
                  <div>
                    <label className="block text-sm font-medium text-[#3a3a3a] mb-2">
                      Categories
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableCategories.map((category) => (
                        <motion.button
                          key={category}
                          type="button"
                          onClick={() => {
                            const newCategories = formData.categories.includes(category)
                              ? formData.categories.filter((c) => c !== category)
                              : [...formData.categories, category];
                            handleInputChange('categories', newCategories);
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-4 py-2 rounded-full text-sm transition-all ${
                            formData.categories.includes(category)
                              ? 'bg-[#007aff]/20 text-[#007aff]'
                              : 'text-[#4a4a4a] hover:text-[#1a1a1a]'
                          }`}
                          style={{
                            background: formData.categories.includes(category)
                              ? 'rgba(0, 122, 255, 0.2)'
                              : 'rgba(255, 255, 255, 0.6)',
                            backdropFilter: 'blur(18px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(18px) saturate(180%)',
                            border: '1px solid rgba(255, 255, 255, 0.4)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                          }}
                        >
                          {category}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-[#3a3a3a] mb-2">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      className="w-full min-h-[100px] resize-none pl-4 pr-4 py-3 rounded-lg bg-white/80 border border-gray-200/50 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#007aff] focus:border-[#007aff] transition-all"
                      style={{
                        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.02)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.boxShadow = '0 0 8px rgba(0, 122, 255, 0.4), inset 0 2px 4px rgba(0, 0, 0, 0.02)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.02)';
                      }}
                      placeholder="Tell us about yourself and your expertise..."
                    />
                  </div>

                  <div className="flex space-x-3">
                    <motion.button
                      type="button"
                      onClick={handlePrevious}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg bg-white/80 border border-black/10 shadow-sm hover:shadow-md transition-all"
                    >
                      <ArrowLeft size={20} />
                      <span className="text-[#333] font-medium">Back</span>
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                      className="flex-1 py-3 rounded-full text-white font-medium disabled:opacity-50 transition-all"
                      style={{
                        background: 'linear-gradient(90deg, #007aff, #5b9aff)',
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) {
                          e.currentTarget.style.filter = 'brightness(1.05)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.filter = 'brightness(1)';
                      }}
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Signup Options (only show on step 1 and after role selected) */}
            {step === 1 && formData.role && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="relative flex items-center my-6">
                  <div className="flex-1 border-t border-gray-200"></div>
                  <span className="px-4 text-sm bg-gradient-to-r from-[#007aff] to-[#9b59b6] bg-clip-text text-transparent font-medium">or</span>
                  <div className="flex-1 border-t border-gray-200"></div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.button
                    type="button"
                    onClick={handleGoogleSignup}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 flex items-center justify-center space-x-3 py-3 rounded-lg bg-white border border-black/10 shadow-sm hover:shadow-md transition-all"
                  >
                    <Chrome size={20} className="text-[#4285F4]" />
                    <span className="text-[#333] font-medium text-sm">Google</span>
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={handleMetaMaskSignup}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 flex items-center justify-center space-x-3 py-3 rounded-lg bg-white border border-black/10 shadow-sm hover:shadow-md transition-all"
                  >
                    <Wallet size={20} className="text-[#F6851B]" />
                    <span className="text-[#333] font-medium text-sm">MetaMask</span>
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Login Link */}
            <div className="text-center pt-4">
              <p className="text-sm text-[#6b6b6b]">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-[#007aff] font-semibold hover:text-[#005bbb] hover:underline transition-colors"
                >
                  Login
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
