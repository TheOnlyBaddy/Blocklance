import { useState } from 'react'
import RoleSelector from './RoleSelector.jsx'

export default function SignupForm({ onSuccess, onSwitch }) {
  const [step, setStep] = useState(0)
  const [role, setRole] = useState('freelancer')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [skills, setSkills] = useState('')
  const [bio, setBio] = useState('')

  function next(){ setStep(s => s + 1) }
  function back(){ setStep(s => Math.max(0, s - 1)) }

  async function complete(){
    await new Promise(r=>setTimeout(r, 700))
    onSuccess?.()
  }

  return (
    <div>
      {step === 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Create your account</h3>
          <RoleSelector value={role} onChange={setRole} />
          <input className="w-full glass-input px-3 py-2" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <input className="w-full glass-input px-3 py-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
          <div className="flex gap-2">
            <button onClick={onSwitch} className="px-4 py-2 glass-button">Back</button>
            <button onClick={next} className="px-4 py-2 glass-button">Continue</button>
          </div>
        </div>
      )}
      {step === 1 && role === 'freelancer' && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Freelancer onboarding</h3>
          <input className="w-full glass-input px-3 py-2" placeholder="Skills (comma separated)" value={skills} onChange={e=>setSkills(e.target.value)} />
          <textarea className="w-full glass-input px-3 py-2" placeholder="Short bio" rows={3} value={bio} onChange={e=>setBio(e.target.value)} />
          <div className="flex gap-2">
            <button onClick={back} className="px-4 py-2 glass-button">Back</button>
            <button onClick={complete} className="px-4 py-2 glass-button">Finish</button>
          </div>
        </div>
      )}
      {step === 1 && role === 'client' && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">You are all set</h3>
          <p className="text-sm text-white/80">Finish to continue to your dashboard.</p>
          <div className="flex gap-2">
            <button onClick={back} className="px-4 py-2 glass-button">Back</button>
            <button onClick={complete} className="px-4 py-2 glass-button">Finish</button>
          </div>
        </div>
      )}
    </div>
  )
}
