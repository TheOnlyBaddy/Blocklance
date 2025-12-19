import { useEffect, useState } from 'react'
import GlassCard from '../components/GlassCard.jsx'
import api from '../lib/api'

export default function Disputes(){
  const [projectId, setProjectId] = useState('')
  const [reason, setReason] = useState('')
  const [file, setFile] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    if (!projectId) return
    setLoading(true)
    try {
      const res = await api.get(`/disputes/project/${projectId}`)
      setItems(Array.isArray(res.data) ? res.data : (res.data?.disputes || []))
    } catch {
      setItems([])
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [projectId])

  const raiseDispute = async () => {
    if (!projectId || !reason) return alert('Enter project ID and reason')
    try {
      const form = new FormData()
      form.append('projectId', projectId)
      form.append('reason', reason)
      if (file) form.append('evidence', file)
      await api.post('/disputes', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      alert('✅ Dispute raised')
      setReason('')
      setFile(null)
      load()
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to raise dispute')
    }
  }

  const resolveDispute = async (id) => {
    try {
      await api.post(`/disputes/${id}/resolve`)
      alert('✅ Dispute resolved')
      load()
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to resolve')
    }
  }

  return (
    <div className="space-y-6">
      <GlassCard className="p-5 space-y-3">
        <h3 className="font-semibold">Raise a Dispute</h3>
        <div className="grid sm:grid-cols-3 gap-2">
          <input value={projectId} onChange={(e)=>setProjectId(e.target.value)} className="glass-input px-3 py-2" placeholder="Project ID" />
          <input value={reason} onChange={(e)=>setReason(e.target.value)} className="glass-input px-3 py-2 sm:col-span-2" placeholder="Reason" />
          <input type="file" accept="image/*,application/pdf" onChange={(e)=>setFile(e.target.files?.[0]||null)} className="glass-input px-3 py-2" />
        </div>
        <button onClick={raiseDispute} className="glass-button px-4 py-2">Submit Dispute</button>
      </GlassCard>

      <GlassCard className="p-5">
        <h3 className="font-semibold mb-2">Disputes for Project</h3>
        <div className="space-y-2">
          {(items || []).map((d) => (
            <div key={d._id} className="glass-card p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{d.reason}</p>
                  <p className="text-sm text-white/70">Status: {d.status}</p>
                </div>
                <div className="flex items-center gap-2">
                  {d.status !== 'resolved' && (
                    <button onClick={()=>resolveDispute(d._id)} className="glass-button px-3 py-1">Resolve</button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {!loading && projectId && (items?.length || 0) === 0 && (
            <p className="text-sm text-white/70">No disputes.</p>
          )}
        </div>
      </GlassCard>
    </div>
  )
}
