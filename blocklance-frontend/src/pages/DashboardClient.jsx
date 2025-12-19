import GlassCard from '../components/GlassCard.jsx'
import { useEffect, useState, useCallback, useContext } from 'react'
import api, { fundEscrow } from '../lib/api'
import DashboardLayout from '../layouts/DashboardLayout'
import { useBlockchainUpdates } from '../context/BlockchainContext'
import { useAuth } from '../context/AuthContext'

export default function DashboardClient(){
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [balance, setBalance] = useState(0)
  const { user } = useAuth()
  const clientAddress = user?.walletAddress || user?.metamaskAddress

  // Handle WebSocket updates
  const handleEscrowUpdate = useCallback((data) => {
    // Handle any specific UI updates for the client dashboard
    if (data.projectId) {
      // You might want to update specific project status
    }
  }, []);

  // Initialize WebSocket connection
  useBlockchainUpdates(handleEscrowUpdate);

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const res = await api.get('/projects/my-projects')
        setProjects(Array.isArray(res.data) ? res.data : (res.data?.projects || []))
      } catch {
        setProjects([])
      } finally {
        setLoading(false)
      }
    })()
  }, [])
  const fundEscrowHandler = async () => {
    try {
      if (projects.length === 0) {
        alert('No projects found. Please create a project first.');
        return;
      }
      
      // Use the first project by default
      const projectId = projects[0]._id || projects[0].id;
      const amount = '0.1'; // Fixed amount as string for consistency
      
      if (!clientAddress) {
        alert('No wallet address found. Please connect your wallet first.');
        return;
      }
      
      console.log('Sending fund request with:', { amount, projectId, clientAddress });
      const res = await fundEscrow(amount, projectId, clientAddress);
      
      if (res && res.data && res.data.txHash) {
        alert(`Transaction submitted successfully!\nTX Hash: ${res.data.txHash}`);
      } else {
        console.warn('Unexpected response format:', res);
        alert('Transaction submitted, but no transaction hash was returned.');
      }
    } catch (err) {
      console.error('Error funding escrow:', {
        error: err,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config
      });
      
      let errorMessage = 'Failed to fund escrow';
      if (err.response) {
        // Server responded with an error status (4xx, 5xx)
        errorMessage = err.response.data?.error || 
                      err.response.data?.message || 
                      `Server error (${err.response.status})`;
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your connection.';
      } else if (err.message) {
        // Something happened in setting up the request
        errorMessage = err.message;
      }
      
      alert(`Error: ${errorMessage}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <GlassCard className="p-5">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Welcome back, Client</h2>
              <p className="text-white/80">Manage projects and proposals</p>
            </div>
            <button 
              onClick={fundEscrowHandler}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Fund Escrow (0.1 ETH)
            </button>
          </div>
        </GlassCard>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(projects || []).map((p) => (
            <GlassCard key={p._id} className="p-4">
              <p className="font-semibold">{p.title || 'Untitled Project'}</p>
              <p className="text-sm text-white/70 line-clamp-2">{p.description || ''}</p>
              <a href={`/project/${p._id}`} className="mt-3 inline-block glass-button px-3 py-1 text-sm">Open</a>
            </GlassCard>
          ))}
          {!loading && (projects?.length || 0) === 0 && (
            <GlassCard className="p-4">No projects yet.</GlassCard>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
