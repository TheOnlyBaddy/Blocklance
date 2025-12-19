import { useEffect, useState } from 'react'
import GlassCard from '../components/GlassCard.jsx'
import api from '../lib/api'

export default function Reviews(){
  const [targetUserId, setTargetUserId] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchReviews = async () => {
    if (!targetUserId) return
    setLoading(true)
    try {
      const res = await api.get(`/reviews/user/${targetUserId}`)
      setItems(Array.isArray(res.data) ? res.data : (res.data?.reviews || []))
    } catch {
      setItems([])
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchReviews() }, [targetUserId])

  const submitReview = async () => {
    if (!targetUserId || !rating) return alert('Enter target user and rating')
    try {
      await api.post('/reviews', { userId: targetUserId, rating: Number(rating), comment })
      setComment('')
      alert('✅ Review submitted')
      fetchReviews()
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to submit review')
    }
  }

  return (
    <div className="space-y-6">
      <GlassCard className="p-5 space-y-3">
        <h3 className="font-semibold">Write a Review</h3>
        <div className="grid sm:grid-cols-3 gap-2">
          <input value={targetUserId} onChange={(e)=>setTargetUserId(e.target.value)} className="glass-input px-3 py-2" placeholder="Target User ID" />
          <input type="number" min="1" max="5" value={rating} onChange={(e)=>setRating(e.target.value)} className="glass-input px-3 py-2" placeholder="Rating (1-5)" />
          <input value={comment} onChange={(e)=>setComment(e.target.value)} className="glass-input px-3 py-2 sm:col-span-2" placeholder="Comment" />
        </div>
        <button onClick={submitReview} className="glass-button px-4 py-2">Submit Review</button>
      </GlassCard>

      <GlassCard className="p-5">
        <h3 className="font-semibold mb-2">Reviews for User</h3>
        <div className="space-y-2">
          {(items || []).map((r) => (
            <div key={r._id} className="glass-card p-3">
              <p className="font-medium">Rating: {r.rating}</p>
              <p className="text-sm text-white/70">{r.comment}</p>
              <p className="text-xs text-white/60">By: {r.reviewer?.name || r.reviewer?.username || 'User'}</p>
            </div>
          ))}
          {!loading && targetUserId && (items?.length || 0) === 0 && (
            <p className="text-sm text-white/70">No reviews yet.</p>
          )}
        </div>
      </GlassCard>
    </div>
  )
}
