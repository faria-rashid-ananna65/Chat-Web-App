import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiX, FiUserPlus, FiMail } from 'react-icons/fi'
import { friendsAPI } from '../services/api'
import toast from 'react-hot-toast'

const AddFriendModal = ({ onClose, onRequestSent }) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('Enter email')
      return
    }
    setLoading(true)
    try {
      await friendsAPI.sendRequest(email)
      toast.success('Request sent!')
      if (onRequestSent) onRequestSent()
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
        className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-xl"
      >
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Add Friend</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
            <FiX size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Enter email to add friend
          </p>
          <div className="relative mb-3">
            <FiMail className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-2">
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
                <><FiUserPlus size={12} /> Send</>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default AddFriendModal