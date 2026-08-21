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
              className="max-w-[220px] rounded cursor-pointer hover:opacity-90"
              onClick={() => onImageClick(message.fileUrl)}
              onLoad={() => setImageLoaded(true)}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-500 border-t-transparent" />
              </div>
            )}
          </div>
        )
      case 'video':
        return <video src={message.fileUrl} controls className="max-w-[220px] rounded" />
      case 'emoji':
        return <span className="text-2xl">{message.content}</span>
      default:
        return <p className="text-xs whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
    }
  }

  const renderStatus = () => {
    if (!isOwn) return null
    if (message.seen) return <FiCheckCircle size={11} className="text-blue-400" />
    if (message.delivered) return <FiCheckCircle size={11} className="text-gray-400" />
    return <FiCheck size={11} className="text-gray-400" />
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}>
      <div
        className={`max-w-[75%] ${
          isOwn
            ? 'bg-primary-500 text-white rounded-xl rounded-br-sm'
            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl rounded-bl-sm shadow-sm'
        } px-2.5 py-1.5`}
      >
        {!isOwn && message.sender?.fullName && (
          <p className="text-[10px] font-medium text-primary-500 mb-0.5">
            {message.sender.fullName}
          </p>
        )}
        {renderContent()}
        <div className={`flex items-center justify-end gap-0.5 mt-0.5 ${
          isOwn ? 'text-primary-100' : 'text-gray-400'
        }`}>
          <span className="text-[9px]">{formatTime(message.createdAt)}</span>
          {renderStatus()}
        </div>
      </div>
    </div>
  )
}

export default MessageBubble
