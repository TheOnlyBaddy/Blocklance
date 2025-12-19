import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import GlassCard from '../components/GlassCard.jsx'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import socket from '../lib/socket'

export default function ProjectDetail(){
  const { id: projectId } = useParams()
  const { user } = useAuth()
  const role = user?.role
  const [project, setProject] = useState(null)
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [bidForm, setBidForm] = useState({ amount: '', message: '' })
  const [disputeAlerts, setDisputeAlerts] = useState([])

  const isClient = role === 'client'
  const isFreelancer = role === 'freelancer'

  const load = async () => {
    setLoading(true)
    try {
      try {
        const resProj = await api.get(`/projects/${projectId}`)
        setProject(resProj.data?.project || resProj.data)
      } catch {}
      if (isClient) {
        const resBids = await api.get(`/bids/${projectId}`)
        setBids(Array.isArray(resBids.data) ? resBids.data : (resBids.data?.bids || []))
      }
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [projectId, role])

  // Dispute alerts via socket
  useEffect(() => {
    const onDispute = (d) => {
      if (!d) return
      if (String(d.projectId) === String(projectId)) {
        setDisputeAlerts((prev) => [d, ...prev].slice(0, 3))
      }
    }
    socket.on('dispute:update', onDispute)
    return () => socket.off('dispute:update', onDispute)
  }, [projectId])

  const placeBid = async () => {
    if (!bidForm.amount) return alert('Enter bid amount')
    try {
      await api.post('/bids', { projectId, ...bidForm })
      alert('Bid submitted!')
      setBidForm({ amount: '', message: '' })
      if (isClient) load()
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to submit bid')
    }
  }

  const acceptBid = async (bidId) => {
    try {
      await api.post(`/bids/${bidId}/accept`)
      alert('Bid accepted')
      load()
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to accept bid')
    }
  }

  if (loading) return <p className="p-6">Loading...</p>
  if (error) return <p className="p-6">{error}</p>

  return (
    <div className="space-y-6">
      {disputeAlerts.length > 0 && (
        <div className="glass-card p-4 border border-amber-300/40 bg-amber-200/30">
          <p className="font-semibold mb-1">Dispute Alerts</p>
          <ul className="text-sm list-disc pl-5 space-y-1">
            {disputeAlerts.map((d, i) => (
              <li key={d._id || i}>Status: {d.status || 'update'} — {d.reason || 'Dispute updated'}</li>
            ))}
          </ul>
        </div>
      )}
      <GlassCard className="p-5">
        <h2 className="text-xl font-semibold">{project?.title || 'Project'}</h2>
        <p className="text-white/80">{project?.description || ''}</p>
      </GlassCard>

      {isFreelancer && (
        <GlassCard className="p-5 space-y-3">
          <h3 className="font-semibold">Place a Bid</h3>
          <div className="grid sm:grid-cols-3 gap-2">
            <input value={bidForm.amount} onChange={(e)=>setBidForm(v=>({ ...v, amount: e.target.value }))} className="glass-input px-3 py-2" placeholder="Amount" />
            <input value={bidForm.message} onChange={(e)=>setBidForm(v=>({ ...v, message: e.target.value }))} className="glass-input px-3 py-2 sm:col-span-2" placeholder="Message" />
          </div>
          <button onClick={placeBid} className="glass-button px-4 py-2">Submit Bid</button>
        </GlassCard>
      )}

      {isClient && (
        <GlassCard className="p-5">
          <h3 className="font-semibold mb-2">Bids</h3>
          <div className="space-y-2">
            {(bids || []).map((b) => (
              <div key={b._id} className="glass-card p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{b.freelancer?.name || b.freelancer?.username || 'Freelancer'}</p>
                  <p className="text-sm text-white/70">{b.message || ''}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm">{b.amount}</span>
                  {b.status !== 'accepted' && (
                    <button onClick={()=>acceptBid(b._id)} className="glass-button px-3 py-1">Accept</button>
                  )}
                </div>
              </div>
            ))}
            {(bids?.length || 0) === 0 && <p className="text-sm text-white/70">No bids yet.</p>}
          </div>
        </GlassCard>
      )}
    </div>
  )
}
