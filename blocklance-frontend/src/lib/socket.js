import { io } from 'socket.io-client'

const socket = io(
  import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
  {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    autoConnect: false,
  }
)

socket.on('connect_error', (err) => {
  try {
    console.error('Socket connection failed:', err?.message || err)
  } catch {}
})

export const connectSocket = (userId) => {
  try {
    socket.auth = { userId }
    socket.connect()
    socket.emit('registerUser', userId)
  } catch {}
}

export const disconnectSocket = () => {
  try {
    if (socket.connected) socket.disconnect()
  } catch {}
}

export default socket
