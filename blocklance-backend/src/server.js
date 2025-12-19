// Entry point: starts the HTTP server after connecting to MongoDB
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import mongoose from 'mongoose';
import cloudinary from './config/cloudinary.js';
import { connectToDatabase } from './config/db.js';
import { createApp } from './app.js';
import cors from 'cors';
import routes from './routes/index.js';
import blockchainRoutes from './routes/blockchain.routes.js';
import { initEscrowListener } from './blockchain/listener.js';

dotenv.config();

const PORT = process.env.PORT || 4000;

let ioInstance = null;
let serverInstance = null;

// Named exports for consumers that need access to the running server/io
export { ioInstance as io, serverInstance as server };

export const emitEvent = (eventName, receiverId, payload) => {
  if (!ioInstance) return;
  if (receiverId) {
    ioInstance.to(receiverId).emit(eventName, payload);
    // eslint-disable-next-line no-console
    console.log(`📡 Event "${eventName}" sent to ${receiverId}`);
  } else {
    ioInstance.emit(eventName, payload);
    // eslint-disable-next-line no-console
    console.log(`🌍 Broadcast "${eventName}" sent to all`);
  }
};

async function start() {
  // eslint-disable-next-line no-console
  console.log('\n🚀 Starting dev server (nodemon)');

  await connectToDatabase();
  const app = createApp();
  // Ensure explicit CORS for local frontend
  app.use(
    cors({
      origin: 'http://localhost:5173',
      credentials: true,
    })
  );
  // Register routes after middleware
  app.use('/api', routes);
  app.use('/api/blockchain', blockchainRoutes);
  
  // Create HTTP server
  const server = http.createServer(app);

  // Initialize blockchain event listener if contract address is set
  if (process.env.ESCROW_CONTRACT_ADDRESS) {
    await initEscrowListener();
  } else {
    console.log('⚠️  ESCROW_CONTRACT_ADDRESS not set. Blockchain event listening disabled.');
  }

  const io = new SocketServer(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    // eslint-disable-next-line no-console
    console.log('🔗 Socket connected:', socket.id);

    socket.on('registerUser', (userId) => {
      socket.userId = userId;
      socket.join(userId);
      // eslint-disable-next-line no-console
      console.log(`👤 User ${userId} joined room`);
    });

    // Allow clients to join arbitrary rooms
    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
      // eslint-disable-next-line no-console
      console.log(`User joined room ${roomId}`);
    });

    // Relay messages to a room
    socket.on('sendMessage', (data) => {
      // expected: { roomId, ...payload }
      if (data && data.roomId) {
        io.to(data.roomId).emit('receiveMessage', data);
      }
    });

    socket.on('disconnect', () => {
      // eslint-disable-next-line no-console
      console.log('❌ Socket disconnected:', socket.id);
    });
  });

  ioInstance = io;
  serverInstance = server;

  server.listen(PORT, () => {
    const origin = process.env.CORS_ORIGIN || '*';
    const base = `http://localhost:${PORT}`;
    const mode = process.env.NODE_ENV || 'development';
    const mongoStates = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    const mongoState = mongoStates[mongoose.connection.readyState] || 'unknown';
    const mongoDb = mongoose.connection.name || process.env.MONGO_DB || 'n/a';
    const firebaseProject = process.env.FIREBASE_PROJECT_ID || 'n/a';
    const hasRpc = Boolean(process.env.BLOCKCHAIN_RPC_URL);
    const hasEscrow = Boolean(process.env.ESCROW_CONTRACT_ADDRESS);
    const hasCloudName = Boolean(process.env.CLOUDINARY_CLOUD_NAME);
    const hasCloudKey = Boolean(process.env.CLOUDINARY_API_KEY);
    const hasCloudSecret = Boolean(process.env.CLOUDINARY_API_SECRET);
    // eslint-disable-next-line no-console
    console.log(
      `\n✅ Startup Summary\n` +
        `🌐 Server\n` +
        `  ✔ URL: ${base}\n` +
        `  🔓 CORS origin: http://localhost:5173\n` +
        `  🏷️ Mode: ${mode}\n` +
        `\n🗄️ Database\n` +
        `  ✔ State: ${mongoState}\n` +
        `  📚 DB: ${mongoDb}\n` +
        `\n🖼️ Cloudinary\n` +
        `  ☁️ Cloud: ${hasCloudName ? process.env.CLOUDINARY_CLOUD_NAME : 'missing'}\n` +
        `  🔑 API Key: ${hasCloudKey ? 'set' : 'missing'}\n` +
        `  🕵️ API Secret: ${hasCloudSecret ? 'set' : 'missing'}\n` +
        `\n⚡ Realtime\n` +
        `  ✔ Socket.io: enabled\n` +
        `\n🔥 Firebase\n` +
        `  🆔 Project: ${firebaseProject}\n` +
        `\n⛓️ Blockchain\n` +
        `  🔌 RPC URL: ${hasRpc ? 'set' : 'missing'}\n` +
        `  📜 Escrow contract: ${hasEscrow ? 'set' : 'missing'}\n` +
        `\nHealth\n` +
        `  🩺 ${base}/health\n` +
        `  🛣️ API base: ${base}/api\n`
    );

    // Async Cloudinary ping (logs after banner)
    (async () => {
      try {
        const res = await cloudinary.api.ping();
        // eslint-disable-next-line no-console
        console.log(`  🔗 Cloudinary connectivity: ok (status: ${res.status})`);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(`  ❌ Cloudinary connectivity failed: ${e?.message || e}`);
      }
    })();
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fatal error starting server:', err);
  process.exit(1);
});


