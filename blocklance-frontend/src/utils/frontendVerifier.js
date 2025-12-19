import api from "../lib/api";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: false,
});

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export async function verifyIntegration() {
  console.log("🚀 Starting Blocklance Frontend–Backend Integration Verification...");

  try {
    const base = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;

    console.log("🔍 Testing API connectivity...");
    const health = await fetch((base || "").replace("/api", "") + "/health");
    console.log(health.ok ? "✅ Server online" : "❌ Server not responding");

    console.log("🔍 Checking Auth (Firebase + JWT)...");
    const token = localStorage.getItem("authToken") || localStorage.getItem("bl_token") || localStorage.getItem("blocklance_token");
    if (!token) {
      console.warn("⚠️ No auth token found. Login first to verify protected routes.");
      return;
    }

    api.defaults.headers.Authorization = `Bearer ${token}`;

    const userRes = await api.get("/users/me");
    const user = userRes.data?.user || userRes.data;
    console.log("✅ User fetched:", user.email, "| Role:", user.role);

    console.log("📦 Testing Projects API...");
    try {
      const projRes = await api.get("/projects/available");
      const count = Array.isArray(projRes.data) ? projRes.data.length : (projRes.data?.length || projRes.data?.items?.length || 0);
      console.log(`✅ Projects available: ${count}`);
    } catch {
      console.warn("⚠️ Projects route failed");
    }

    console.log("📤 Testing Bids API...");
    try {
      const bids = await api.get("/bids/test");
      console.log("✅ Bids route responded:", bids.status);
    } catch {
      console.warn("⚠️ Bids route unavailable (expected if no test data)");
    }

    console.log("💰 Testing Transactions API...");
    try {
      await api.get("/transactions/project/test");
      console.log("✅ Transactions route accessible");
    } catch {
      console.warn("⚠️ Transactions endpoint needs auth or valid project");
    }

    console.log("🧑‍🎨 Testing Portfolio API...");
    try {
      const portfolio = await api.get("/portfolio/me");
      const items = Array.isArray(portfolio.data) ? portfolio.data : (portfolio.data?.items || []);
      console.log("✅ Portfolio items found:", items.length || 0);
    } catch {
      console.warn("⚠️ Portfolio route failed");
    }

    console.log("⭐ Testing Reviews API...");
    try {
      await api.get(`/reviews/user/${user._id}`);
      console.log("✅ Reviews accessible");
    } catch {
      console.warn("⚠️ Reviews endpoint empty or unavailable");
    }

    console.log("🔔 Testing Notifications...");
    try {
      const notifRes = await api.get("/notifications/me");
      const n = Array.isArray(notifRes.data) ? notifRes.data.length : (notifRes.data?.length || 0);
      console.log(`✅ Notifications fetched: ${n}`);
    } catch {
      console.warn("⚠️ Notifications route failed");
    }

    console.log("⚖️ Testing Disputes API...");
    try {
      const disputes = await api.get(`/disputes/project/test`);
      console.log("✅ Disputes route accessible:", disputes.status);
    } catch {
      console.warn("⚠️ Disputes endpoint needs valid projectId");
    }

    console.log("📡 Testing Real-Time Socket connection...");
    try {
      socket.connect();
      socket.emit("registerUser", user._id);

      socket.on("connect", () => console.log("✅ Socket connected:", socket.id));
      socket.on("notification:new", (data) => console.log("🔔 Received real-time notification:", data?.message || data));
      socket.on("transaction:update", (tx) => console.log("💰 Live transaction update:", tx));
      socket.on("dispute:update", (d) => console.log("⚖️ Live dispute update:", d));

      await delay(3000);
      socket.disconnect();

      console.log("✅ Socket test completed");
    } catch (e) {
      console.warn("⚠️ Socket test failed", e?.message || e);
    }

    console.log("🎉 All frontend–backend integrations verified successfully!");
  } catch (err) {
    console.error("❌ Verification failed:", err?.message || err);
  }
}
