import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import ChatArea from '../components/ChatArea'
import AddFriendModal from '../components/AddFriendModal'
import CreateGroupModal from '../components/CreateGroupModal'
import { useChat } from '../hooks/useChat'

const Chat = () => {
  const [showAddFriend, setShowAddFriend] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const {
    selectedChat,
    chatType,
    setSelectedChat,
    setChatType,
    conversations,
    groups,
    friends,
    fetchFriends,
    fetchGroups,
  } = useChat()

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-gray-800">
      {/* Sidebar */}
      <div
        className={`${
          selectedChat ? 'hidden md:flex' : 'flex'
        } w-full md:w-[280px] lg:w-[300px] flex-shrink-0 h-full`}
      >
        <Sidebar
          conversations={conversations}
          groups={groups}
          friends={friends}
          selectedChat={selectedChat}
          chatType={chatType}
          onSelectChat={(chat, type) => {
            setSelectedChat(chat)
            setChatType(type)
          }}
          onAddFriend={() => setShowAddFriend(true)}
          onCreateGroup={() => setShowCreateGroup(true)}
          onRefreshFriends={fetchFriends}
        />
      </div>

      {/* Chat Area */}
      <div
        className={`${
          selectedChat ? 'flex' : 'hidden md:flex'
        } flex-1 flex-col h-full min-w-0`}
      >
        {selectedChat ? (
          <ChatArea
            chat={selectedChat}
            chatType={chatType}
            onBack={() => setSelectedChat(null)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-3xl sm:text-4xl">💬</span>
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-300">
                Select a chat to start messaging
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Choose from your existing conversations or start a new one
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddFriend && (
        <AddFriendModal
          onClose={() => setShowAddFriend(false)}
          onRequestSent={fetchFriends}
        />
      )}
      {showCreateGroup && (
        <CreateGroupModal
          friends={friends}
          onClose={() => setShowCreateGroup(false)}
          onGroupCreated={fetchGroups}
        />
      )}
    </div>
  )
}

export default Chat