import { useState, useEffect, useRef, useCallback } from 'react'
import {
  FiArrowLeft,
  FiPhone,
  FiVideo,
  FiMoreVertical,
  FiSend,
  FiImage,
  FiFilm,
  FiSmile,
  FiLoader,
} from 'react-icons/fi'
import EmojiPicker from 'emoji-picker-react'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { messagesAPI, uploadAPI } from '../services/api'
import MessageBubble from './MessageBubble'
import ImagePreviewModal from './ImagePreviewModal'
import { getAvatarColor } from '../utils/avatarColors'
import toast from 'react-hot-toast'

const ChatArea = ({ chat, chatType, onBack, onMessageSent, onMessageReceived, onMarkAsRead }) => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [showEmoji, setShowEmoji] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  const [uploading, setUploading] = useState(false)
  const messagesContainerRef = useRef(null)
  const messagesEndRef = useRef(null)
  const isAutoScrollRef = useRef(true)
  const fileInputRef = useRef(null)
  const videoInputRef = useRef(null)
  const { user } = useAuth()
  const { socket, onlineUsers } = useSocket()

  const isOnline = chatType === 'private' ? onlineUsers.includes(chat._id) : false

  const scrollToBottom = useCallback((force = false) => {
    if (force || isAutoScrollRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container) return
    const { scrollTop, scrollHeight, clientHeight } = container
    isAutoScrollRef.current = scrollHeight - scrollTop - clientHeight < 100
  }, [])

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true)
        const res = chatType === 'private'
          ? await messagesAPI.getMessages(chat._id)
          : await messagesAPI.getGroupMessages(chat._id)
        setMessages(res.data)
        setTimeout(() => scrollToBottom(true), 50)
        if (onMarkAsRead && chatType === 'private') {
          onMarkAsRead(chat._id)
        }
      } catch (error) {
        // silent fail
      } finally {
        setLoading(false)
      }
    }
    fetchMessages()
  }, [chat._id, chatType, scrollToBottom, onMarkAsRead])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (!socket) return

    const handleReceiveMessage = (message) => {
      if (chatType === 'private') {
        if (message.sender._id === chat._id || message.receiver === chat._id) {
          setMessages((prev) => [...prev, message])
        }
        if (onMessageReceived) onMessageReceived(message, false)
      }
    }

    const handleMessageSent = (message) => {
      if (onMessageSent) onMessageSent(message, false)
    }

    const handleReceiveGroupMessage = (message) => {
      if (chatType === 'group' && message.group === chat._id) {
        setMessages((prev) => [...prev, message])
      }
      if (onMessageReceived) onMessageReceived(message, true)
    }

    socket.on('receiveMessage', handleReceiveMessage)
    socket.on('messageSent', handleMessageSent)
    socket.on('receiveGroupMessage', handleReceiveGroupMessage)
    socket.on('userTyping', ({ userId }) => { if (userId === chat._id) setIsTyping(true) })
    socket.on('userStopTyping', ({ userId }) => { if (userId === chat._id) setIsTyping(false) })

    return () => {
      socket.off('receiveMessage', handleReceiveMessage)
      socket.off('messageSent', handleMessageSent)
      socket.off('receiveGroupMessage', handleReceiveGroupMessage)
      socket.off('userTyping')
      socket.off('userStopTyping')
    }
  }, [socket, chat._id, chatType, onMessageSent, onMessageReceived])

  useEffect(() => {
    if (!socket || !newMessage) return
    const roomId = chatType === 'private'
      ? [user._id, chat._id].sort().join('_')
      : `group_${chat._id}`
    socket.emit('typing', { roomId, userId: user._id })
    const timer = setTimeout(() => socket.emit('stopTyping', { roomId, userId: user._id }), 2000)
    return () => clearTimeout(timer)
  }, [newMessage, socket, chat._id, chatType, user._id])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    const messageData = { sender: user._id, content: newMessage, messageType: 'text' }
    if (chatType === 'private') {
      messageData.receiver = chat._id
      socket.emit('privateMessage', messageData)
    } else {
      messageData.group = chat._id
      socket.emit('groupMessage', messageData)
    }
    setNewMessage('')
    setShowEmoji(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Max 50MB')
      return
    }
    setUploading(true)
    const uploadToast = toast.loading(`Uploading ${type}...`)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await uploadAPI.uploadFile(formData)
      const data = res.data
      const messageData = { sender: user._id, content: '', messageType: type, fileUrl: data.url }
      if (chatType === 'private') {
        messageData.receiver = chat._id
        socket.emit('privateMessage', messageData)
      } else {
        messageData.group = chat._id
        socket.emit('groupMessage', messageData)
      }
      toast.success('Sent!', { id: uploadToast })
    } catch (error) {
      toast.error('Upload failed', { id: uploadToast })
    } finally {
      setUploading(false)
    }
    e.target.value = ''
  }

  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prev) => prev + emojiObject.emoji)
  }

  const groupMessagesByDate = (msgs) => {
    const groups = []
    let currentDate = ''
    msgs.forEach((msg) => {
      const msgDate = new Date(msg.createdAt).toLocaleDateString()
      if (msgDate !== currentDate) {
        currentDate = msgDate
        groups.push({ date: msgDate, messages: [] })
      }
      groups[groups.length - 1].messages.push(msg)
    })
    return groups
  }

  const formatDateSeparator = (dateStr) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const messageGroups = groupMessagesByDate(messages)

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-gray-800 overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700/50 px-2 sm:px-3 py-2.5 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button onClick={onBack} className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 flex-shrink-0">
              <FiArrowLeft size={18} />
            </button>
            <div className="relative flex-shrink-0">
              <div className={`w-9 h-9 rounded-full ${getAvatarColor(chat.name || chat.fullName)} flex items-center justify-center overflow-hidden`}>
                {chat.avatar ? (
                  <img src={chat.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm text-white font-semibold">
                    {chat.name?.charAt(0) || chat.fullName?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              {isOnline && (
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-[1.5px] border-white dark:border-gray-800" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white leading-tight truncate">
                {chatType === 'group' ? chat.name : chat.fullName}
              </h2>
              <p className="text-xs text-gray-400 dark:text-gray-500 leading-tight truncate">
                {isTyping ? (
                  <span className="text-primary-500">Typing...</span>
                ) : isOnline ? 'Online' : chatType === 'group' ? `${chat.members?.length} members` : 'Offline'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hidden sm:flex">
              <FiPhone size={16} />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hidden sm:flex">
              <FiVideo size={16} />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hidden min-[400px]:flex">
              <FiMoreVertical size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 sm:px-4 py-2 overscroll-contain"
        style={{
          scrollBehavior: 'smooth',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='none' stroke='%2322c55e' stroke-opacity='0.15' stroke-width='1'%3E%3Cpath d='M40 25c-3-8-12-10-15-5s2 10 15 15c13-5 17-12 15-15s-12-3-15 5z'/%3E%3Cpath d='M40 25c-3 8-12 10-15 5s2-10 15-15c13 5 17 12 15 15s-12 3-15-5z'/%3E%3Cpath d='M40 55c-3-8-12-10-15-5s2 10 15 15c13-5 17-12 15-15s-12-3-15 5z'/%3E%3Cpath d='M40 55c-3 8-12 10-15 5s2-10 15-15c13 5 17 12 15 15s-12 3-15-5z'/%3E%3Cline x1='40' y1='20' x2='40' y2='60'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px',
          backgroundColor: 'var(--chat-bg, #ffffff)',
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full px-4">
            <p className="text-sm text-gray-400 text-center">Start chatting with {chat.fullName || chat.name}</p>
          </div>
        ) : (
          messageGroups.map((group, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-center my-2">
                <span className="px-2.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[11px] text-gray-500 dark:text-gray-400">
                  {formatDateSeparator(group.date)}
                </span>
              </div>
              {group.messages.map((message) => (
                <MessageBubble
                  key={message._id}
                  message={message}
                  isOwn={message.sender._id === user._id}
                  onImageClick={setPreviewImage}
                />
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700/50 px-2 sm:px-3 py-2.5 flex-shrink-0">
        {uploading && (
          <div className="mb-2 flex items-center gap-2 text-xs text-primary-500">
            <FiLoader className="animate-spin" size={14} />
            <span>Uploading...</span>
            <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500 rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <div className="relative flex-shrink-0">
            <button
              type="button"
              onClick={() => setShowEmoji(!showEmoji)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"
            >
              <FiSmile size={18} />
            </button>
            {showEmoji && (
              <div className="absolute bottom-12 left-0 z-50">
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  width={280}
                  height={350}
                  theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
                />
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={(e) => handleFileUpload(e, 'image')}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 disabled:opacity-50 flex-shrink-0"
          >
            <FiImage size={18} />
          </button>

          <input
            type="file"
            ref={videoInputRef}
            accept="video/*"
            onChange={(e) => handleFileUpload(e, 'video')}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            disabled={uploading}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 disabled:opacity-50 flex-shrink-0"
          >
            <FiFilm size={18} />
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 min-w-0 px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />

          <button
            type="submit"
            disabled={!newMessage.trim() || uploading}
            className="p-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <FiSend size={16} />
          </button>
        </form>
      </div>

      {previewImage && (
        <ImagePreviewModal image={previewImage} onClose={() => setPreviewImage(null)} />
      )}
    </div>
  )
}

export default ChatArea
