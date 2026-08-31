import { useState, useEffect, useCallback } from 'react'
import { messagesAPI, friendsAPI, groupsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export const useChat = () => {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [groups, setGroups] = useState([])
  const [friends, setFriends] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [chatType, setChatType] = useState('private')
  const [loading, setLoading] = useState(true)

  // Fetch conversations, groups, and friends
  const fetchFriends = useCallback(async () => {
    try {
      const res = await friendsAPI.getFriends()
      setFriends(res.data)
    } catch (error) {
      // silent fail
    }
  }, [])

  const fetchGroups = useCallback(async () => {
    try {
      const res = await groupsAPI.getGroups()
      setGroups(res.data)
    } catch (error) {
      // silent fail
    }
  }, [])

  const fetchConversations = useCallback(async () => {
    try {
      const res = await messagesAPI.getConversations()
      setConversations(res.data)
    } catch (error) {
      // silent fail
    }
  }, [])

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        await Promise.all([
          fetchConversations(),
          fetchGroups(),
          fetchFriends(),
        ])
      } catch (error) {
        // silent fail
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [fetchConversations, fetchGroups, fetchFriends])

  // Update conversations when new message arrives
  const updateConversation = useCallback((message, isGroup = false) => {
    if (isGroup) {
      setGroups((prev) =>
        prev.map((group) =>
          group._id === message.group
            ? { ...group, lastMessage: message }
            : group
        ).sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
      )
    } else {
      const friendId = message.sender._id === user?._id
        ? message.receiver
        : message.sender._id

      const friendName = message.sender._id === user?._id
        ? null
        : message.sender.fullName

      const friendAvatar = message.sender._id === user?._id
        ? null
        : message.sender.avatar

      setConversations((prev) => {
        const existing = prev.find((c) => c._id === friendId)

        if (existing) {
          return prev.map((c) =>
            c._id === friendId
              ? {
                  ...c,
                  lastMessage: message,
                  updatedAt: new Date(),
                  fullName: c.fullName || friendName || 'User',
                  avatar: c.avatar || friendAvatar,
                }
              : c
          ).sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
        } else {
          return [
            {
              _id: friendId,
              fullName: friendName || 'User',
              avatar: friendAvatar,
              lastMessage: message,
              updatedAt: new Date(),
              unreadCount: 0,
            },
            ...prev,
          ]
        }
      })
    }
  }, [user])

  const markAsRead = useCallback((chatId) => {
    setConversations((prev) =>
      prev.map((c) =>
        c._id === chatId ? { ...c, unreadCount: 0 } : c
      )
    )
  }, [])

  return {
    conversations,
    groups,
    friends,
    selectedChat,
    chatType,
    loading,
    setSelectedChat,
    setChatType,
    updateConversation,
    markAsRead,
    setGroups,
    setFriends,
    fetchFriends,
    fetchGroups,
    fetchConversations,
  }
}
