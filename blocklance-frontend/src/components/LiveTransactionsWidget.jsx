import { useEffect, useState } from 'react'
import socket from '../lib/socket'
import api from '../lib/api'

export default function LiveTransactionsWidget({ projectId = null }){
  const [items, setItems] = useState([])

  // Optional initial fetch by project
  useEffect(() => {
    let ignore = false
    ;(async () => {
      if (!projectId) return
      try {
        const res = await api.get(`/transactions/project/${projectId}`)
        if (!ignore) setItems(Array.isArray(res.data) ? res.data.slice(0, 5) : (res.data?.slice?.(0,5) || []))
      } catch {}
    })()
    return () => { ignore = true }
  }, [projectId])

  useEffect(() => {
    const onTx = (tx) => {
      if (projectId && tx.projectId !== projectId) return
      setItems((prev) => [tx, ...prev].slice(0, 5))
    }
    socket.on('transaction:update', onTx)
    return () => socket.off('transaction:update', onTx)
  }, [projectId])

  if (!items.length) return (
    <div className="glass-card p-4"><p className="text-sm text-white/70">No live transactions yet.</p></div>
  )

  return (
    <div className="glass-card p-4">
      <h3 className="font-semibold mb-2">Live Transactions</h3>
      <div className="space-y-2">
        {items.map((tx) => (
          <div key={tx._id || tx.id || Math.random()} className="flex items-center justify-between text-sm">
            <span className="text-white/80">{new Date(tx.createdAt || Date.now()).toLocaleTimeString()}</span>
            <span className="text-white/90">{tx.status || 'update'}</span>
            <span className="text-white/70">{tx.amount}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
