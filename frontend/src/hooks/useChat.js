import { useState, useEffect, useCallback } from 'react'
import { messagesAPI, friendsAPI, groupsAPI } from '../services/api'

export const useChat = () => {
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
  const updateConversation = (message, isGroup = false) => {
    if (isGroup) {
      setGroups((prev) =>
        prev.map((group) =>
          group._id === message.group
            ? { ...group, lastMessage: message }
            : group
        )
      )
    } else {
      setConversations((prev) => {
        const chatId =
          message.sender._id === selectedChat?._id
            ? message.receiver
            : message.sender._id

        const existing = prev.find((c) => c._id === chatId)

        if (existing) {
          return prev.map((c) =>
            c._id === chatId
              ? { ...c, lastMessage: message, updatedAt: new Date() }
              : c
          ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        } else {
          return [
            {
              _id: chatId,
              fullName: message.sender.fullName,
              avatar: message.sender.avatar,
              lastMessage: message,
              updatedAt: new Date(),
            },
            ...prev,
          ]
        }
      })
    }
  }

  const markAsRead = (chatId) => {
    setConversations((prev) =>
      prev.map((c) =>
        c._id === chatId ? { ...c, unreadCount: 0 } : c
      )
    )
  }

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
