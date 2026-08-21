import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiX, FiUsers } from 'react-icons/fi'
import { groupsAPI } from '../services/api'
import { getAvatarColor } from '../utils/avatarColors'
import toast from 'react-hot-toast'

const CreateGroupModal = ({ friends, onClose, onGroupCreated }) => {
  const [groupName, setGroupName] = useState('')
  const [selectedMembers, setSelectedMembers] = useState([])
  const [loading, setLoading] = useState(false)

  const toggleMember = (friendId) => {
    setSelectedMembers((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!groupName.trim()) {
      toast.error('Enter group name')
      return
    }
    if (selectedMembers.length === 0) {
      toast.error('Select at least one member')
      return
    }
    setLoading(true)
    try {
      await groupsAPI.createGroup({ name: groupName, members: selectedMembers })
      toast.success('Group created!')
      if (onGroupCreated) onGroupCreated()
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-xl max-h-[80vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Create Group</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
            <FiX size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-4 py-2.5">
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 mb-2"
            />
            <p className="text-[11px] text-gray-400">{selectedMembers.length} selected</p>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-2">
            <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Friends</p>
            {friends.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-4">No friends to add</p>
            ) : (
              <div className="space-y-0.5">
                {friends.map((friend) => (
                  <div
                    key={friend._id}
                    onClick={() => toggleMember(friend._id)}
                    className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-colors ${
                      selectedMembers.includes(friend._id)
                        ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-500'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent'
                    }`}
                  >
                    <div className="relative">
                      <div className={`w-7 h-7 rounded-full ${getAvatarColor(friend.fullName)} flex items-center justify-center overflow-hidden`}>
                        {friend.avatar ? (
                          <img src={friend.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-white">
                            {friend.fullName?.charAt(0)}
                          </span>
                        )}
                      </div>
                      {friend.isOnline && (
                        <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white dark:border-gray-800" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{friend.fullName}</p>
                      <p className="text-[10px] text-gray-400">{friend.phoneNumber}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedMembers.includes(friend._id)
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {selectedMembers.includes(friend._id) && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-4 py-2.5 border-t border-gray-200 dark:border-gray-700 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-3 bg-primary-500 text-white text-xs font-medium rounded-lg hover:bg-primary-600 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
              ) : (
                <><FiUsers size={12} /> Create</>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default CreateGroupModal
