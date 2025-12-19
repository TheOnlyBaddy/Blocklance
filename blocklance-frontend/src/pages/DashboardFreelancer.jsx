import GlassCard from '../components/GlassCard.jsx'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useEffect, useState, useCallback } from 'react'
import api, { withdrawEscrow } from '../lib/api'
import DashboardLayout from '../layouts/DashboardLayout'
import { useBlockchainUpdates } from '../context/BlockchainContext'

const data = [
  { name: 'Jan', amt: 400 },
  { name: 'Feb', amt: 800 },
  { name: 'Mar', amt: 650 },
  { name: 'Apr', amt: 1200 },
]

export default function DashboardFreelancer(){
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [balance, setBalance] = useState(0)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [isWithdrawing, setIsWithdrawing] = useState(false)

  // Handle WebSocket updates
  const handleEscrowUpdate = useCallback((data) => {
    // Handle any specific UI updates for the freelancer dashboard
    if (data.event === 'Released') {
      // Refresh balance if needed
      // fetchBalance();
    }
  }, []);

  // Initialize WebSocket connection
  useBlockchainUpdates(handleEscrowUpdate);

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const res = await api.get('/projects/available')
        setProjects(Array.isArray(res.data) ? res.data : (res.data?.projects || []))
      } catch {
        setProjects([])
      } finally {
        setLoading(false)
      }
    })()
  }, [])
  
  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawAmount || isNaN(withdrawAmount) || withdrawAmount <= 0) {
      alert('Please enter a valid amount to withdraw');
      return;
    }
    
    try {
      setIsWithdrawing(true);
      const res = await withdrawEscrow(parseFloat(withdrawAmount));
      alert(`Success! Transaction Hash: ${res.data.txHash}`);
      setWithdrawAmount('');
      // Refresh balance after successful withdrawal
      // You might want to fetch the updated balance here
    } catch (err) {
      console.error('Withdrawal failed:', err);
      alert(`Withdrawal failed: ${err.response?.data?.message || 'Unknown error'}`);
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <GlassCard className="p-5">
          <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
            <div>
              <h2 className="text-xl font-semibold">Welcome back, Freelancer</h2>
              <p className="text-white/80">Here are your stats</p>
            </div>
            <div className="glass-card p-4 w-full md:w-auto">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-white/70">Available Balance</p>
                  <p className="text-xl font-semibold">{balance} ETH</p>
                </div>
                <form onSubmit={handleWithdraw} className="flex items-end gap-2">
                  <div>
                    <input
                      type="number"
                      step="0.0001"
                      min="0.0001"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full p-2 border rounded-lg bg-white/10 border-white/20 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.1"
                      disabled={isWithdrawing}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isWithdrawing}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isWithdrawing ? 'Processing...' : 'Withdraw'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-5">
          <h3 className="font-semibold mb-2">Available Projects</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(projects || []).map((p) => (
              <GlassCard key={p._id} className="p-4">
                <p className="font-semibold">{p.title || 'Untitled Project'}</p>
                <p className="text-sm text-white/70 line-clamp-2">{p.description || ''}</p>
                <a href={`/project/${p._id}`} className="mt-3 inline-block glass-button px-3 py-1 text-sm">View & Bid</a>
              </GlassCard>
            ))}
            {!loading && (projects?.length || 0) === 0 && (
              <p className="text-sm text-white/70">No open projects right now.</p>
            )}
          </div>
        </GlassCard>
        <div className="grid sm:grid-cols-3 gap-4">
          {['Active Gigs', 'Messages', 'Earnings'].map((t, i) => (
            <GlassCard key={i} className="p-4">
              <p className="text-sm text-white/70">{t}</p>
              <p className="text-2xl font-bold mt-1">{[3, 12, '$1.2k'][i]}</p>
            </GlassCard>
          ))}
        </div>
        <GlassCard className="p-5">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="name" stroke="#BFD9FF" />
                <YAxis stroke="#BFD9FF" />
                <Tooltip />
                <Bar dataKey="amt" fill="#59f3c3" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
        <GlassCard className="p-5">
          <h3 className="font-semibold mb-2">Recent Activity</h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li>• New proposal received</li>
            <li>• Payout processed</li>
            <li>• Message from client</li>
          </ul>
        </GlassCard>
      </div>
    </DashboardLayout>
  )
}
