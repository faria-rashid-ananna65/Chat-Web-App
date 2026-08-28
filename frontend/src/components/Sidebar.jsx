import { useState, useEffect } from 'react'
import {
  FiSearch,
  FiPlus,
  FiSun,
  FiMoon,
  FiLogOut,
  FiUsers,
  FiRefreshCw,
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useSocket } from '../context/SocketContext'
import ConversationItem from './ConversationItem'
import GroupItem from './GroupItem'
import { friendsAPI } from '../services/api'
import { getAvatarColor } from '../utils/avatarColors'
import toast from 'react-hot-toast'

const Sidebar = ({
  conversations,
  groups,
  friends,
  selectedChat,
  chatType,
  onSelectChat,
  onAddFriend,
  onCreateGroup,
  onRefreshFriends,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('chats')
  const [friendRequests, setFriendRequests] = useState([])
  const [loadingRequests, setLoadingRequests] = useState(false)
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const { socket } = useSocket()

  useEffect(() => {
    if (activeTab === 'friends') {
      fetchFriendRequests()
    }
  }, [activeTab])

  const handleLogout = async () => {
    if (socket) socket.disconnect()
    await logout()
    toast.success('Logged out')
  }

  const filteredConversations = conversations.filter((c) =>
    c.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredGroups = groups.filter((g) =>
    g.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredFriends = friends.filter((f) =>
    f.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const fetchFriendRequests = async () => {
    setLoadingRequests(true)
    try {
      const res = await friendsAPI.getPendingRequests()
      setFriendRequests(res.data)
    } catch (error) {
      // silent fail
    } finally {
      setLoadingRequests(false)
    }
  }

  const handleAcceptRequest = async (requestId) => {
    try {
      await friendsAPI.acceptRequest(requestId)
      setFriendRequests((prev) => prev.filter((r) => r._id !== requestId))
      if (onRefreshFriends) await onRefreshFriends()
      toast.success('Friend added!')
    } catch (error) {
      toast.error('Failed to accept')
    }
  }

  const handleRejectRequest = async (requestId) => {
    try {
      await friendsAPI.rejectRequest(requestId)
      setFriendRequests((prev) => prev.filter((r) => r._id !== requestId))
      toast.success('Rejected')
    } catch (error) {
      toast.error('Failed to reject')
    }
  }

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-gray-800 overflow-hidden border-r-4 border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-semibold">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[120px]">
              {user?.fullName}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            >
              {isDark ? <FiSun size={14} /> : <FiMoon size={14} />}
            </button>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            >
              <FiLogOut size={14} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {['chats', 'groups', 'friends'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab}
            {tab === 'friends' && friendRequests.length > 0 && (
              <span className="ml-1 px-1 py-0.5 bg-red-500 text-white text-[9px] rounded-full">
                {friendRequests.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Chats */}
        {activeTab === 'chats' && (
          <div className="p-1">
            {filteredConversations.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-6">No conversations</p>
            ) : (
              filteredConversations.map((conv) => (
                <ConversationItem
                  key={conv._id}
                  conversation={conv}
                  isSelected={selectedChat?._id === conv._id && chatType === 'private'}
                  onSelect={() => onSelectChat(conv, 'private')}
                />
              ))
            )}
          </div>
        )}

        {/* Groups */}
        {activeTab === 'groups' && (
          <div className="p-1">
            {filteredGroups.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-6">No groups</p>
            ) : (
              filteredGroups.map((group) => (
                <GroupItem
                  key={group._id}
                  group={group}
                  isSelected={selectedChat?._id === group._id && chatType === 'group'}
                  onSelect={() => onSelectChat(group, 'group')}
                />
              ))
            )}
          </div>
        )}

        {/* Friends */}
        {activeTab === 'friends' && (
          <div className="p-1">
            {/* Requests */}
            <div className="mb-2">
              <div className="flex items-center justify-between px-2 mb-1">
                <span className="text-[10px] font-semibold text-gray-400 uppercase">
                  Requests ({friendRequests.length})
                </span>
                <button
                  onClick={fetchFriendRequests}
                  disabled={loadingRequests}
                  className="text-primary-500 hover:text-primary-600"
                >
                  <FiRefreshCw size={11} className={loadingRequests ? 'animate-spin' : ''} />
                </button>
              </div>

              {loadingRequests ? (
                <div className="py-3 text-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-500 border-t-transparent mx-auto" />
                </div>
              ) : friendRequests.length === 0 ? (
                <p className="text-center text-[11px] text-gray-400 py-2">No pending</p>
              ) : (
                friendRequests.map((req) => (
                  <div
                    key={req._id}
                    className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full ${getAvatarColor(req.sender.fullName)} flex items-center justify-center overflow-hidden`}>
                        {req.sender.avatar ? (
                          <img src={req.sender.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-white">
                            {req.sender.fullName?.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate max-w-[100px]">
                          {req.sender.fullName}
                        </p>
                        <p className="text-[10px] text-gray-400">{req.sender.phoneNumber}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleAcceptRequest(req._id)}
                        className="px-2 py-0.5 bg-green-500 text-white text-[10px] rounded hover:bg-green-600"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectRequest(req._id)}
                        className="px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-[10px] rounded hover:bg-gray-300"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* All Friends */}
            <div>
              <h3 className="text-[10px] font-semibold text-gray-400 uppercase px-2 mb-1">
                Friends ({filteredFriends.length})
              </h3>
              {filteredFriends.length === 0 ? (
                <p className="text-center text-[11px] text-gray-400 py-2">No friends</p>
              ) : (
                filteredFriends.map((friend) => (
                  <div
                    key={friend._id}
                    onClick={() => {
                      onSelectChat(friend, 'private')
                      setActiveTab('chats')
                    }}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
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
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                        {friend.fullName}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {friend.isOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="px-2 py-2 border-t border-gray-200 dark:border-gray-700 space-y-1">
        <button
          onClick={() => { setActiveTab('friends'); fetchFriendRequests() }}
          className="w-full py-1.5 px-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-1.5 text-[11px] font-medium"
        >
          <FiUsers size={12} />
          Friend Requests
          {friendRequests.length > 0 && (
            <span className="px-1 py-0.5 bg-red-500 text-white text-[9px] rounded-full">
              {friendRequests.length}
            </span>
          )}
        </button>
        <button
          onClick={onCreateGroup}
          className="w-full py-1.5 px-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-1.5 text-[11px] font-medium"
        >
          <FiUsers size={12} />
          Create Group
        </button>
        <button
          onClick={onAddFriend}
          className="w-full py-1.5 px-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center gap-1.5 text-[11px] font-medium"
        >
          <FiPlus size={12} />
          Add Friend
        </button>
      </div>
    </div>
  )
}

export default Sidebar
