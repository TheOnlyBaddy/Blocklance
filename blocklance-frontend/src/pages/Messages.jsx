import DashboardLayout from "../layouts/DashboardLayout";
import { useEffect, useState } from "react";
import api from "../lib/api";

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConversations() {
      try {
        const res = await api.get("/messages/conversations");
        setConversations(res.data || []);
      } catch (err) {
        console.error("[Messages] Fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchConversations();
  }, []);

  console.log("[Messages] Page loaded ✅");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>

        {loading ? (
          <p className="text-gray-500">Loading conversations...</p>
        ) : conversations.length === 0 ? (
          <div className="bg-white/50 backdrop-blur-lg p-8 rounded-2xl border shadow text-center text-gray-600">
            No conversations yet.
          </div>
        ) : (
          <div className="grid gap-4">
            {conversations.map((chat) => (
              <div
                key={chat._id}
                className="bg-white/60 backdrop-blur-xl p-4 rounded-2xl shadow border hover:shadow-lg transition flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {chat.user?.name || "Unknown User"}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-1">
                    {chat.lastMessage || "No messages yet."}
                  </p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Open Chat
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
