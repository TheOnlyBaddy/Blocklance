import DashboardLayout from "../layouts/DashboardLayout";
import { useEffect, useState } from "react";
import api from "../lib/api";

export default function Proposals() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProposals() {
      try {
        // TODO: Replace with actual API call once backend is ready
        // const res = await api.get("/api/proposals");
        // setProposals(res.data || []);
        
        // Mock data for development
        const mockProposals = [
          {
            _id: '1',
            title: 'Website Development',
            description: 'Need a modern website built with React and Node.js',
            budget: 1000,
            status: 'pending',
            createdAt: new Date().toISOString()
          },
          {
            _id: '2',
            title: 'Mobile App UI/UX Design',
            description: 'Looking for a designer to create a sleek UI/UX for our mobile app',
            budget: 1500,
            status: 'in-progress',
            createdAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            _id: '3',
            title: 'Blockchain Smart Contract',
            description: 'Need help developing an ERC-20 token smart contract',
            budget: 2500,
            status: 'completed',
            createdAt: new Date(Date.now() - 172800000).toISOString()
          }
        ];
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setProposals(mockProposals);
      } catch (err) {
        console.error("[Proposals] Fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProposals();
  }, []);

  console.log("[Proposals] Page loaded ✅");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Proposals</h1>

        {loading ? (
          <p className="text-gray-500">Loading proposals...</p>
        ) : proposals.length === 0 ? (
          <div className="bg-white/50 backdrop-blur-lg p-8 rounded-2xl border shadow text-center text-gray-600">
            You haven't submitted any proposals yet.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {proposals.map((p) => (
              <div
                key={p._id}
                className="bg-white/60 backdrop-blur-xl p-5 rounded-2xl shadow border hover:shadow-lg transition"
              >
                <h2 className="font-semibold text-lg text-gray-800">{p.title}</h2>
                <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                  {p.description}
                </p>
                <p className="text-blue-600 mt-2 font-medium">
                  ${p.budget || "N/A"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
