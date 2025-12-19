import { useState } from 'react'

export default function ConnectedAccounts(){
  const [google, setGoogle] = useState(false)
  const [mm, setMm] = useState(false)
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between glass-card p-3">
        <div>
          <p className="font-medium text-sm">Google</p>
          <p className="text-xs text-white/70">{google ? 'Connected' : 'Not connected'}</p>
        </div>
        <button onClick={()=>setGoogle(v=>!v)} className="glass-button px-3 py-1 text-sm">{google ? 'Disconnect' : 'Connect'}</button>
      </div>
      <div className="flex items-center justify-between glass-card p-3">
        <div>
          <p className="font-medium text-sm">MetaMask</p>
          <p className="text-xs text-white/70">{mm ? 'Connected' : 'Not connected'}</p>
        </div>
        <button onClick={()=>setMm(v=>!v)} className="glass-button px-3 py-1 text-sm">{mm ? 'Disconnect' : 'Connect'}</button>
      </div>
    </div>
  )
}
