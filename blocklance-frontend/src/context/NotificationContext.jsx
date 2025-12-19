import { createContext, useEffect, useState, useContext } from 'react'
import socket from '../lib/socket'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { useAuth } from './AuthContext'

export const NotificationContext = createContext()

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])
  const { token } = useAuth()

  const fetchNotifications = async () => {
    if (!token) {
      setNotifications([])
      return
    }
    
    try {
      const res = await api.get('/notifications/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      setNotifications(res.data)
    } catch (err) {
      console.error('Failed to fetch notifications', err)
      if (err.response?.status === 401) {
        // Token might be expired, clear it
        localStorage.removeItem('token')
      }
    }
  }

  // Update API client with new token when it changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchNotifications()
    } else {
      // Clear notifications if not authenticated
      setNotifications([])
      delete api.defaults.headers.common['Authorization']
    }

    const onNew = (notif) => {
      setNotifications((prev) => [notif, ...prev])
      try { if (notif?.message) toast.success(notif.message) } catch {}
    }
    const onTx = (tx) => console.log('💰 Transaction update:', tx)
    const onDispute = (d) => console.log('⚖️ Dispute update:', d)

    socket.on('notification:new', onNew)
    socket.on('transaction:update', onTx)
    socket.on('dispute:update', onDispute)

    return () => {
      socket.off('notification:new', onNew)
      socket.off('transaction:update', onTx)
      socket.off('dispute:update', onDispute)
    }
  }, [])

  return (
    <NotificationContext.Provider value={{ notifications, fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  )
}
