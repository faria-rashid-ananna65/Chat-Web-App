import { useState } from 'react'
import { FiCheck, FiCheckCircle } from 'react-icons/fi'

const MessageBubble = ({ message, isOwn, onImageClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false)

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const renderContent = () => {
    switch (message.messageType) {
      case 'image':
        return (
          <div className="relative">
            <img
              src={message.fileUrl}
              alt=""
              className="max-w-[260px] sm:max-w-[280px] rounded-lg cursor-pointer hover:opacity-90"
              onClick={() => onImageClick(message.fileUrl)}
              onLoad={() => setImageLoaded(true)}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-lg">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-500 border-t-transparent" />
              </div>
            )}
          </div>
        )
      case 'video':
        return <video src={message.fileUrl} controls className="max-w-[260px] sm:max-w-[280px] rounded-lg" />
      case 'emoji':
        return <span className="text-3xl">{message.content}</span>
      default:
        return <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
    }
  }

  const renderStatus = () => {
    if (!isOwn) return null
    if (message.seen) return <FiCheckCircle size={13} className="text-blue-400" />
    if (message.delivered) return <FiCheckCircle size={13} className="text-gray-400" />
    return <FiCheck size={13} className="text-gray-400" />
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}>
      <div
        className={`max-w-[75%] ${
          isOwn
            ? 'bg-primary-500 text-white rounded-xl rounded-br-sm'
            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl rounded-bl-sm shadow-sm'
        } px-3 py-2`}
      >
        {!isOwn && message.sender?.fullName && (
          <p className="text-xs font-medium text-primary-500 mb-0.5">
            {message.sender.fullName}
          </p>
        )}
        {renderContent()}
        <div className={`flex items-center justify-end gap-1 mt-1 ${
          isOwn ? 'text-primary-100' : 'text-gray-400'
        }`}>
          <span className="text-[10px]">{formatTime(message.createdAt)}</span>
          {renderStatus()}
        </div>
      </div>
    </div>
  )
}

export default MessageBubble
