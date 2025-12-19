import { useState } from "react";
import { Lock, Bell, Wallet, Link as LinkIcon } from "lucide-react";
import { verifyIntegration } from "../utils/frontendVerifier";
import DashboardLayout from "../layouts/DashboardLayout";
import GlassCard from "../components/GlassCard";
import WalletConnect from "../components/WalletConnect";

export default function AccountSettings() {
  const [notifications, setNotifications] = useState({
    messages: true,
    proposals: true,
    payments: false,
  });

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Wallet Connection Section */}
        <WalletConnect />
        <GlassCard className="p-5">
          <button onClick={verifyIntegration} className="p-2 bg-blue-600 text-white rounded">
            🔍 Run System Verification
          </button>
        </GlassCard>
      <GlassCard className="p-5">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Lock className="text-blue-500" size={18} /> Account Settings
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <input
            type="password"
            placeholder="Change password"
            className="w-full sm:w-1/2 border border-gray-300 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="px-5 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition">
            Update Password
          </button>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <LinkIcon className="text-blue-500" size={18} /> Connected Accounts
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span>Google</span>
            <button className="px-4 py-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition">
              Connect
            </button>
          </div>
          <div className="flex justify-between items-center">
            <span>MetaMask</span>
            <button className="px-4 py-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition">
              Connect
            </button>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Bell className="text-blue-500" size={18} /> Notifications
        </h2>
        <div className="space-y-3">
          {Object.keys(notifications).map((key) => (
            <label key={key} className="flex justify-between items-center">
              <span className="capitalize">{key}</span>
              <input
                type="checkbox"
                checked={notifications[key]}
                onChange={() => toggleNotification(key)}
                className="w-5 h-5 accent-blue-500"
              />
            </label>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Wallet className="text-blue-500" size={18} /> Payment & Wallet
        </h2>
        <div className="flex justify-between items-center">
          <span>MetaMask Wallet</span>
          <button className="px-4 py-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition">
            Connect
          </button>
        </div>
      </GlassCard>
    </div>
    </DashboardLayout>
  );
}
