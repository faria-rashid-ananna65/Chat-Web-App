import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext()

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

export const SocketProvider = ({ children }) => {
  const { user } = useAuth()
  const [socket, setSocket] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])

  useEffect(() => {
    if (user) {
      // Connect to socket server
      const newSocket = io(SOCKET_URL, {
        query: { userId: user._id },
      })

      setSocket(newSocket)

      // Listen for online users
      newSocket.on('onlineUsers', (users) => {
        setOnlineUsers(users)
      })

      // Cleanup on unmount
      return () => {
        newSocket.disconnect()
      }
    } else {
      // Disconnect if user logs out
      if (socket) {
        socket.disconnect()
        setSocket(null)
      }
    }
  }, [user])

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  )
}

// Custom hook to use socket context
export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}
