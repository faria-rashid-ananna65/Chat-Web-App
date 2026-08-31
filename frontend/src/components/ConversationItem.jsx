import { useSocket } from '../context/SocketContext'
import { getAvatarColor } from '../utils/avatarColors'

const ConversationItem = ({ conversation, isSelected, onSelect }) => {
  const { onlineUsers } = useSocket()
  const isOnline = onlineUsers.includes(conversation._id)

  const formatTime = (date) => {
    if (!date) return ''
    const d = new Date(date)
    const now = new Date()
    const diff = now - d
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    if (days === 1) return 'Y'
    if (days < 7) return d.toLocaleDateString([], { weekday: 'short' })
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  const getLastMessage = () => {
    if (!conversation.lastMessage) return 'No messages'
    const msg = conversation.lastMessage
    if (msg.messageType === 'image') return '📷 Image'
    if (msg.messageType === 'video') return '🎥 Video'
    return msg.content?.substring(0, 25) + (msg.content?.length > 25 ? '...' : '')
  }

  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? 'bg-primary-500 text-white'
          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
      }`}
    >
      <div className="relative flex-shrink-0">
        <div className={`w-10 h-10 rounded-full ${getAvatarColor(conversation.fullName)} flex items-center justify-center overflow-hidden`}>
          {conversation.avatar ? (
            <img src={conversation.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className={`text-sm font-semibold text-white`}>
              {conversation.fullName?.charAt(0) || 'U'}
            </span>
          )}
        </div>
        {isOnline && (
          <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-[1.5px] ${
            isSelected ? 'bg-green-400 border-primary-500' : 'bg-green-500 border-white dark:border-gray-800'
          }`} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
            {conversation.fullName}
          </h3>
          <span className={`text-[11px] flex-shrink-0 ml-1 ${isSelected ? 'text-primary-100' : 'text-gray-400'}`}>
            {formatTime(conversation.lastMessage?.createdAt || conversation.updatedAt)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className={`text-xs truncate ${isSelected ? 'text-primary-100' : 'text-gray-400 dark:text-gray-500'}`}>
            {getLastMessage()}
          </p>
          {conversation.unreadCount > 0 && (
            <span className="ml-1 px-1.5 min-w-[18px] text-center bg-primary-500 text-white text-[10px] rounded-full font-medium">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConversationItem
