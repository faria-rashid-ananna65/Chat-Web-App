import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext()

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const SocketProvider = ({ children }) => {
  const { user } = useAuth()
  const [socket, setSocket] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])
  const socketRef = useRef(null)

  useEffect(() => {
    if (user) {
      const newSocket = io(SOCKET_URL, {
        query: { userId: user._id },
      })

      socketRef.current = newSocket
      setSocket(newSocket)

      newSocket.on('onlineUsers', (users) => {
        setOnlineUsers(users)
      })

      return () => {
        newSocket.disconnect()
        socketRef.current = null
      }
    } else if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
      setSocket(null)
    }
  }, [user])

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}
