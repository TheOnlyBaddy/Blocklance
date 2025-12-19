import { useState } from 'react'

export default function Web3Wallet(){
  const [connected, setConnected] = useState(false)
  return (
    <div className="space-y-2">
      <button onClick={()=>setConnected(v=>!v)} className="glass-button px-4 py-2">{connected ? 'Disconnect' : 'Connect MetaMask'}</button>
      {connected && (
        <div className="text-sm text-white/80">
          <p>Address: 0x1234...ABCD</p>
          <p>Balance: 1.23 ETH</p>
        </div>
      )}
    </div>
  )
}
