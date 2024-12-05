'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ChevronRight, Send, Paperclip, Smile, MoreVertical, Search, X, ChevronLeft } from 'lucide-react'
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu'
import '@szhsin/react-menu/dist/index.css'
import { Layout } from '../components/layout';
import SuperSillyLoading from '../components/Loading'
import { Chat, getChats, getUser, getUserById, getUsersById, Message, sendMessage, UserData } from '../api/db'
import { Avatar, unknownIcon } from '../api/icons'
import { Timestamp } from 'firebase/firestore'


const formatTime = (date: Date) => {
  return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
}

const ChatList: React.FC<{
  chats: Chat[]
  onSelectChat: (id: string) => void
  selectedChat: string | null
}> = ({ chats, onSelectChat, selectedChat }) => {
  return <div className="flex-grow overflow-y-auto">
    {chats.map((chat) => {
      const [chatter, setChatter] = useState<UserData | null>(null);
      useEffect(() => {
        if (Array.isArray(chat.person)) getUserById(chat.messages[chat.messages.length - 1]?.sender || chat.person[0]).then(setChatter);
        else getUserById(chat.person).then(setChatter);
      })
      if (!chatter) return null;
      return <div
        key={chat.id}
        className={`p-4 flex items-center space-x-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
          selectedChat === chat.id ? 'bg-green-50' : ''
        }`}
        onClick={() => onSelectChat(chat.id)}
      >
        <div className="flex-shrink-0">
          <Avatar icon={chatter.icon} isOnline={chatter.isOnline} className={`w-12 h-12 rounded-full object-cover`} />
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex justify-between items-baseline">
            <div className="font-semibold truncate mr-2">{chatter.name}</div>
            <div className="text-xs text-gray-400 flex-shrink-0">
              {formatTime(chat.messages[chat.messages.length - 1]?.timestamp.toDate() || new Date())}
            </div>
          </div>
          <div className="text-sm text-gray-500 truncate mr-2">{chat.lastMessage}</div>
        </div>
      </div>
  })}
  </div>
}

const MessageComponent: React.FC<{ message: Message; chatter: UserData | undefined; isSent: boolean }> = ({ message, chatter, isSent }) => {
  return <div className={`mb-4 flex ${isSent ? 'justify-start' : 'justify-end'}`}>
    {isSent && <Avatar icon={chatter ? chatter.icon : unknownIcon()} className='w-8 h-8' />}
    <div
      className={`max-w-[70%] p-3 rounded-lg relative ml-5 mr-5 ${
        isSent ? 'bg-green-100 text-gray-800 ml-2' : 'bg-white text-gray-800 shadow-sm mr-2'
      }`}
    >
      <div
        className={`absolute top-2 ${isSent ? '-right-2' : '-left-2'} w-4 h-4 transform rotate-45 ${
          isSent ? 'bg-green-100' : 'bg-white'
        }`}
      ></div>
      <div className="relative z-10 px-2">
        <div>{message.content}</div>
        <div className="text-xs text-gray-500 mt-1 flex items-center justify-end">
          {formatTime(message.timestamp.toDate())}
        </div>
      </div>
    </div>
    {!isSent && <Avatar icon={chatter ? chatter.icon : unknownIcon()} className='w-8 h-8' />}
  </div>
}

const InputArea: React.FC<{ onSendMessage: (content: string) => void }> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      onSendMessage(message)
      setMessage('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center p-4 bg-white border-t border-gray-200">
      <button type="button" className="text-gray-500 hover:text-gray-700 ml-2">
        <Smile size={24} />
      </button>
      <button type="button" className="text-gray-500 hover:text-gray-700 ml-2">
        <Paperclip size={24} />
      </button>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="הקלד הודעה..."
        className="flex-grow p-2 bg-gray-100 rounded-full text-right focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      <button type="submit" className="mr-2 text-green-500 hover:text-green-700">
        <Send size={24} />
      </button>
    </form>
  )
}

const ProfileInfo: React.FC<{
  chat: Chat
  chatter: UserData | UserData | undefined
  onClose: () => void
}> = ({ chat, onClose, chatter }) => {
  const [showAllMembers, setShowAllMembers] = useState(false)
  const [members, setMembers] = useState<UserData[] | UserData | undefined>();
  if (!chatter){return;}
  useEffect(() => {
    if (Array.isArray(chat.person)) getUsersById(chat.person).then(setMembers);
    else {getUserById(chat.person).then(setMembers);};
  })
  if (!members){return null;}
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">פרופיל</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="flex flex-col items-center mb-4">
          <Avatar className="w-24 h-24 rounded-full mb-2" icon={chatter.icon}></Avatar>
          <h3 className="text-xl font-semibold">{chatter.name}</h3>
          <p className="text-gray-500">{chatter.isOnline ? 'מחובר' : 'לא מחובר'}</p>
        </div>
        {Array.isArray(members) ? (
          <>
            <div className="mb-4">
              <h4 className="font-semibold mb-2">תיאור הקבוצה</h4>
              <p>{chat.description || 'לא מוגדר'}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">חברי הקבוצה</h4>
              <div className="flex overflow-x-auto pb-2 mb-2">
                {members?.slice(0, showAllMembers ? undefined : 3).map((member) => (
                  <div key={member.id} className="flex-shrink-0 mr-2 text-center">
                    <Avatar icon={member.icon} className='w-8 h-8' />
                    <p className="text-xs mt-1">{member.name}</p>
                  </div>
                ))}
                {!showAllMembers && Array.isArray(chat.person) && chat.person.length > 3 && (
                  <button
                    onClick={() => setShowAllMembers(true)}
                    className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full text-gray-600"
                  >
                    <ChevronLeft size={16} />
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <p><strong>אימייל</strong> {chatter.email}</p>
            <p><strong>מידע אישי: </strong><br></br> {chatter.bio}</p>
          </div>
        )}
      </div>
    </div>
  )
}

const ChatArea: React.FC<{
  messages: Message[]
  onSendMessage: (content: string) => void
  selectedChat: Chat | null
  chatter: UserData | UserData[] | undefined
  onBackClick: () => void
  onProfileClick: (profile: string) => void
}> = ({ messages, onSendMessage, chatter, selectedChat, onBackClick, onProfileClick }) => {
  if (!chatter){return null;}
  return <div className="flex flex-col h-full min-h-0">
    {/* Header */}
    <div className="bg-white p-4 flex items-center justify-between border-b border-gray-200 flex-shrink-0">
      <div className="flex items-center">
        <button onClick={onBackClick} className="md:hidden mr-2 text-gray-600">
          <ChevronRight size={24} />
        </button>
        {selectedChat && (
          <>
            <div onClick={() => onProfileClick(selectedChat.id)} className="cursor-pointer">
              <Avatar
                icon={selectedChat.icon}
                isOnline={!Array.isArray(chatter) ? chatter.isOnline : undefined}
              />
            </div>
            <div className="mr-3">
              <h2 className="font-semibold">{selectedChat.name}</h2>
              <p className="text-xs text-gray-500">
                {Array.isArray(chatter)
                  ? `${chatter.length} חברים`
                  : chatter.isOnline ? 'מחובר' : 'לא מחובר'}
              </p>
            </div>
          </>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <Menu menuButton={<MenuButton><MoreVertical size={20} /></MenuButton>} transition>
          <MenuItem>
            <a href="#Attachment" className="block w-full">
              קבצים מצורפים
            </a>
          </MenuItem>
          <MenuItem>חיפוש</MenuItem>
          <MenuItem>השתק התראות</MenuItem>
        </Menu>
      </div>
    </div>
    {/* Messages */}
    <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
      {messages.map((message) => (
        <MessageComponent 
        chatter={Array.isArray(chatter) ? chatter.find((chat) => chat.id === message.sender) : chatter} 
        key={message.sender + message.timestamp.toDate().toString()} message={message} isSent={message.sender === 'אתה'} />
      ))}
    </div>
    {/* Input Area */}
    <div className="flex-shrink-0">
      <InputArea onSendMessage={onSendMessage} />
    </div>
  </div>
}

const App: React.FC = () => {
  const [chats, setChats] = useState<Chat[] | undefined>();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [showProfile, setShowProfile] = useState<string | undefined>();
  const [user, setUser] = useState<UserData | undefined>();
  const [selectedChatters, setSelectedChatters] = useState<UserData[] | UserData | undefined>()

  const [showChatList, setShowChatList] = useState(true)
  const chatListRef = useRef<HTMLDivElement>(null)
  const chatAreaRef = useRef<HTMLDivElement>(null)

  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    const fetchChats = async () => {
      setUser(await getUser());
      const fetchedChats = await getChats()
      setChats(fetchedChats);
    }
    fetchChats()
  }, [])
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    handleResize() // Initialize
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    let startX: number
    let isDragging = false

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      isDragging = true
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return
      const currentX = e.touches[0].clientX
      const diff = startX - currentX

      if (diff > 50) {
        setShowChatList(false)
      } else if (diff < -50) {
        setShowChatList(true)
      }
    }

    const handleTouchEnd = () => {
      isDragging = false
    }

    chatListRef.current?.addEventListener('touchstart', handleTouchStart)
    chatAreaRef.current?.addEventListener('touchstart', handleTouchStart)
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      chatListRef.current?.removeEventListener('touchstart', handleTouchStart)
      chatAreaRef.current?.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])

  // Determine whether to hide the layout on mobile when in chat area
  const hideLayoutOnMobile = isMobile && selectedChatId !== null && !showChatList

  const handleSelectChat = async (id: string) => {
    setShowProfile(undefined)
    setSelectedChatId(id)
    const chat = chats?.find((chat) => chat.id === id);
    const chatters = Array.isArray(chat?.person) ? 
    await getUsersById(chat.person) : await getUserById(chat?.person || '');
    setSelectedChatters(chatters)
    setShowChatList(false)
  }

  const handleSendMessage = (content: string) => {
    if (selectedChatId === null || !chats || !user) return;
    const selectedChat = chats.find((chat) => chat.id === selectedChatId);
    if (!selectedChat)return;
    sendMessage(selectedChat, {content, sender: user.id, timestamp: Timestamp.fromDate(new Date())})
  }
  if (!chats){return <SuperSillyLoading></SuperSillyLoading>}
  const selectedChat = chats.find((chat) => chat.id === selectedChatId) || null
  return (
    <Layout>
    <div dir="rtl" className="h-screen md:h-[94vh] flex bg-gray-100 text-right overflow-hidden">
      {/* Chat List */}
      <div
        ref={chatListRef}
        className={`bg-white w-full md:w-1/3 border-l border-gray-200 ${
          showChatList ? 'block' : 'hidden md:block'
        }`}
      >
        <div className="flex flex-col h-full min-h-0">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <h1 className="text-2xl font-bold text-gray-800">הודעות</h1>
            <div className="mt-4 relative">
              <input
                type="text"
                placeholder="חיפוש"
                className="w-full p-2 pl-10 pr-4 bg-gray-100 rounded-full text-right focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>
          {/* Chat List */}
          <ChatList chats={chats} onSelectChat={handleSelectChat} selectedChat={selectedChatId} />
        </div>
      </div>
      {/* Chat Area */}
      <div
        ref={chatAreaRef}
        className={`bg-white flex-grow ${
          showChatList ? 'hidden md:block' : 'block'
        }`}
      >
        {selectedChat ? (
          <div className="flex flex-col h-full min-h-0">
            <ChatArea
              messages={selectedChat.messages}
              onSendMessage={handleSendMessage}
              chatter={selectedChatters}
              selectedChat={selectedChat}
              onBackClick={() => setShowChatList(true)}
              onProfileClick={(profile) => setShowProfile(profile)}
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            בחר צ'אט כדי להתחיל לשוחח
          </div>
        )}
      </div>
      {showProfile && selectedChat && Array.isArray(selectedChatters) && (
        <ProfileInfo
          chat={selectedChat}
          chatter={selectedChatters.find((chatter) => chatter.id === showProfile)}
          onClose={() => setShowProfile(undefined)}
        />
      )}
    </div>
    </Layout>
  )
}

export default App

