import mongoose from "mongoose";
import dotenv from "dotenv";
import { ethers } from "ethers";

import { connectToDatabase } from "../config/db.js";

dotenv.config();

// Note: Do not import or instantiate the Express app here to avoid loading the entire
// module graph (e.g., blockchain artifacts). We only call the live server via HTTP.

const PORT = process.env.PORT || 4000; // matches src/server.js default
const BASE_URL = `http://localhost:${PORT}`;
const API_URL = `${BASE_URL}/api`;

async function testEnv() {
  console.log("\n🔍 Checking environment variables...");
  const required = [
    "MONGO_URI",
    "JWT_SECRET",
    "CLOUDINARY_CLOUD_NAME",
    "FIREBASE_PROJECT_ID",
    "BLOCKCHAIN_RPC_URL",
    "ESCROW_CONTRACT_ADDRESS",
  ];
  const missing = required.filter((v) => !process.env[v]);
  if (missing.length) console.warn("⚠️ Missing:", missing);
  else console.log("✅ Environment variables OK");
}

async function testDatabase() {
  console.log("\n🔍 Testing MongoDB connection...");
  try {
    await connectToDatabase();
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(
      "✅ Mongo connected. Collections:",
      collections.map((c) => c.name)
    );
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
}

async function get(url, opts = {}) {
  try {
    const res = await fetch(url, { method: "GET", ...opts });
    return { ok: res.ok, status: res.status, data: await safeJson(res) };
  } catch (e) {
    return { ok: false, status: "NETWORK_ERROR", error: e.message };
  }
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function testRoutes() {
  console.log("\n🔍 Verifying API routes...");
  // Prefer mostly-public endpoints to avoid guaranteed 401s
  const endpoints = [
    { path: "/health", base: BASE_URL }, // public
    { path: "/auth/metamask/nonce?address=0x0000000000000000000000000000000000000000", base: API_URL }, // public
    { path: "/auth/metamask/nonce", base: API_URL }, // public (without address)
    { path: "/auth/firebase-login", base: API_URL }, // POST in real use; GET -> 404 expected
    { path: "/projects/available", base: API_URL }, // requires auth -> expect 401/403
    { path: "/users/me", base: API_URL }, // requires auth -> expect 401
    { path: "/notifications/me", base: API_URL }, // requires auth -> expect 401
    { path: "/transactions/project/dummy", base: API_URL }, // will 401/404 depending on validation
  ];

  for (const ep of endpoints) {
    const url = `${ep.base}${ep.path}`;
    const res = await get(url);
    if (res.ok) console.log(`✅ GET ${ep.path} →`, res.status);
    else console.warn(`⚠️ GET ${ep.path} returned`, res.status);
  }
}

async function testBlockchain() {
  console.log("\n🔍 Testing Blockchain connectivity...");
  try {
    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
    const contract = process.env.ESCROW_CONTRACT_ADDRESS;
    if (!rpcUrl || !contract) throw new Error("Missing BLOCKCHAIN_RPC_URL or ESCROW_CONTRACT_ADDRESS");

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const network = await provider.getNetwork();
    const balance = await provider.getBalance(contract);
    console.log(
      `✅ Connected to ${network.name}. Contract balance: ${ethers.formatEther(balance)} ETH`
    );
  } catch (err) {
    console.error("❌ Blockchain test failed:", err.message);
  }
}

async function testSocket() {
  console.log("\n🔍 Testing Socket.IO connection...");
  try {
    // Dynamically import socket.io-client if available
    let ioClient;
    try {
      ({ io: ioClient } = await import("socket.io-client"));
    } catch (e) {
      console.warn("⚠️ socket.io-client not installed, skipping Socket.IO test. Install with: npm i -D socket.io-client");
      return;
    }

    const socket = ioClient(BASE_URL, { transports: ["websocket"], timeout: 2000 });
    await new Promise((resolve) => {
      socket.on("connect", () => {
        console.log("✅ Socket connected:", socket.id);
        socket.emit("registerUser", "testUser");
        setTimeout(() => {
          socket.disconnect();
          resolve();
        }, 500);
      });
      socket.on("connect_error", (err) => {
        console.warn("⚠️ Socket connect error:", err.message);
        resolve();
      });
    });
  } catch (err) {
    console.error("❌ Socket test failed:", err.message);
  }
}

async function runChecks() {
  console.log("\n🚀 Running Blocklance backend verification suite...");
  await testEnv();
  await testDatabase();
  await testRoutes();
  await testBlockchain();
  await testSocket();
  console.log("\n✅ All checks executed. Review warnings for any issues.\n");
}

runChecks();
