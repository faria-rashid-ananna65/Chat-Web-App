import { getAvatarColor } from '../utils/avatarColors'

const GroupItem = ({ group, isSelected, onSelect }) => {
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
    if (!group.lastMessage) return 'No messages'
    const msg = group.lastMessage
    if (msg.messageType === 'image') return '📷 Image'
    if (msg.messageType === 'video') return '🎥 Video'
    return msg.content?.substring(0, 25) + (msg.content?.length > 25 ? '...' : '')
  }

  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? 'bg-primary-500 text-white'
          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
      }`}
    >
      <div className="relative flex-shrink-0">
        <div className={`w-9 h-9 rounded-full ${getAvatarColor(group.name)} flex items-center justify-center overflow-hidden`}>
          {group.image ? (
            <img src={group.image} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs font-semibold text-white">
              {group.name?.charAt(0) || 'G'}
            </span>
          )}
        </div>
        <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-medium ${
          isSelected ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300'
        }`}>
          {group.members?.length || 0}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className={`text-xs font-medium truncate ${isSelected ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
            {group.name}
          </h3>
          <span className={`text-[10px] flex-shrink-0 ml-1 ${isSelected ? 'text-primary-100' : 'text-gray-400'}`}>
            {formatTime(group.lastMessage?.createdAt || group.updatedAt)}
          </span>
        </div>
        <p className={`text-[11px] truncate ${isSelected ? 'text-primary-100' : 'text-gray-400 dark:text-gray-500'}`}>
          {getLastMessage()}
        </p>
      </div>
    </div>
  )
}

export default GroupItem
