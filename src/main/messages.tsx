'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ChevronRight, Send, Paperclip, Smile, MoreVertical, Search, X, ChevronLeft } from 'lucide-react'
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu'
import '@szhsin/react-menu/dist/index.css'
import { Layout } from '../components/layout';


// Types
type Message = {
  id: number
  sender: string
  content: string
  timestamp: Date
  status: 'sent' | 'delivered' | 'read'
  avatar: string
}

type User = {
  id: number
  name: string
  avatar: string
  isOnline: boolean
  phoneNumber: string
  email: string
}

type Chat = {
  id: number
  name: string
  avatar: string
  lastMessage: string
  unreadCount: number
  isOnline: boolean
  messages: Message[]
  isGroup: boolean
  members?: User[]
  description?: string
}

// Utility functions
const formatTime = (date: Date) => {
  return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
}

// Components
const Avatar: React.FC<{
  src: string
  name: string
  isOnline?: boolean
  size?: 'sm' | 'md' | 'lg'
}> = ({ src, name, isOnline, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }

  return (
    <div className="relative">
      <img src={src} alt={name} className={`${sizeClasses[size]} rounded-full object-cover`} />
      {isOnline && (
        <div className="absolute bottom-0 left-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
      )}
    </div>
  )
}

const ChatList: React.FC<{
  chats: Chat[]
  onSelectChat: (id: number) => void
  selectedChat: number | null
}> = ({ chats, onSelectChat, selectedChat }) => (
  <div className="flex-grow overflow-y-auto">
    {chats.map((chat) => (
      <div
        key={chat.id}
        className={`p-4 flex items-center space-x-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
          selectedChat === chat.id ? 'bg-green-50' : ''
        }`}
        onClick={() => onSelectChat(chat.id)}
      >
        <div className="flex-shrink-0">
          <Avatar src={chat.avatar} name={chat.name} isOnline={chat.isOnline} />
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex justify-between items-baseline">
            <div className="font-semibold truncate mr-2">{chat.name}</div>
            <div className="text-xs text-gray-400 flex-shrink-0">
              {formatTime(new Date(chat.messages[chat.messages.length - 1]?.timestamp || new Date()))}
            </div>
          </div>
          <div className="text-sm text-gray-500 truncate mr-2">{chat.lastMessage}</div>
        </div>
        {chat.unreadCount > 0 && (
          <div className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">
            {chat.unreadCount}
          </div>
        )}
      </div>
    ))}
  </div>
)

const MessageComponent: React.FC<{ message: Message; isSent: boolean }> = ({ message, isSent }) => (
  <div className={`mb-4 flex ${isSent ? 'justify-start' : 'justify-end'}`}>
    {isSent && <Avatar src={message.avatar} name={message.sender} size="sm" />}
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
          {formatTime(message.timestamp)}
          {isSent && (
            <span className="mr-1">
              {message.status === 'sent' && '⋯'}
              {message.status === 'delivered' && '✓'}
              {message.status === 'read' && <span className="text-green-500">✓</span>}
            </span>
          )}
        </div>
      </div>
    </div>
    {!isSent && <Avatar src={message.avatar} name={message.sender} size="sm" />}
  </div>
)

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
  onClose: () => void
}> = ({ chat, onClose }) => {
  const [showAllMembers, setShowAllMembers] = useState(false)

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
          <img src={chat.avatar} alt={chat.name} className="w-24 h-24 rounded-full mb-2" />
          <h3 className="text-xl font-semibold">{chat.name}</h3>
          <p className="text-gray-500">{chat.isOnline ? 'מחובר' : 'לא מחובר'}</p>
        </div>
        {chat.isGroup ? (
          <>
            <div className="mb-4">
              <h4 className="font-semibold mb-2">תיאור הקבוצה</h4>
              <p>{chat.description || 'לא מוגדר'}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">חברי הקבוצה</h4>
              <div className="flex overflow-x-auto pb-2 mb-2">
                {chat.members?.slice(0, showAllMembers ? undefined : 3).map((member) => (
                  <div key={member.id} className="flex-shrink-0 mr-2 text-center">
                    <Avatar src={member.avatar} name={member.name} size="sm" />
                    <p className="text-xs mt-1">{member.name}</p>
                  </div>
                ))}
                {!showAllMembers && chat.members && chat.members.length > 3 && (
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
            <p><strong>טלפון:</strong> {chat.phoneNumber}</p>
            <p><strong>אימייל:</strong> {chat.email}</p>
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
  onBackClick: () => void
  onProfileClick: () => void
}> = ({ messages, onSendMessage, selectedChat, onBackClick, onProfileClick }) => (
  <div className="flex flex-col h-full min-h-0">
    {/* Header */}
    <div className="bg-white p-4 flex items-center justify-between border-b border-gray-200 flex-shrink-0">
      <div className="flex items-center">
        <button onClick={onBackClick} className="md:hidden mr-2 text-gray-600">
          <ChevronRight size={24} />
        </button>
        {selectedChat && (
          <>
            <div onClick={onProfileClick} className="cursor-pointer">
              <Avatar
                src={selectedChat.avatar}
                name={selectedChat.name}
                isOnline={selectedChat.isOnline}
              />
            </div>
            <div className="mr-3">
              <h2 className="font-semibold">{selectedChat.name}</h2>
              <p className="text-xs text-gray-500">
                {selectedChat.isGroup
                  ? `${selectedChat.members?.length} חברים`
                  : selectedChat.isOnline ? 'מחובר' : 'לא מחובר'}
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
        <MessageComponent key={message.id} message={message} isSent={message.sender === 'אתה'} />
      ))}
    </div>
    {/* Input Area */}
    <div className="flex-shrink-0">
      <InputArea onSendMessage={onSendMessage} />
    </div>
  </div>
)

// Main App Component
const App: React.FC = () => {
  const initialChats: Chat[] = [
    {
      id: 1,
      name: 'משפחה',
      avatar: 'https://i.pravatar.cc/150?img=1',
      lastMessage: 'מה קורה?',
      unreadCount: 2,
      isOnline: true,
      isGroup: true,
      description: 'קבוצת המשפחה שלנו',
      members: [
        { id: 101, name: 'אמא', avatar: 'https://i.pravatar.cc/150?img=6', isOnline: true, phoneNumber: '+972 50-111-1111', email: 'mom@family.com' },
        { id: 102, name: 'אבא', avatar: 'https://i.pravatar.cc/150?img=7', isOnline: false, phoneNumber: '+972 50-222-2222', email: 'dad@family.com' },
        { id: 103, name: 'אח', avatar: 'https://i.pravatar.cc/150?img=8', isOnline: true, phoneNumber: '+972 50-333-3333', email: 'brother@family.com' },
        { id: 104, name: 'אחות', avatar: 'https://i.pravatar.cc/150?img=9', isOnline: false, phoneNumber: '+972 50-444-4444', email: 'sister@family.com' },
      ],
      messages: [
        {
          id: 1,
          sender: 'אמא',
          content: 'מה שלומך?',
          timestamp: new Date(),
          status: 'read',
          avatar: 'https://i.pravatar.cc/150?img=6',
        },
        {
          id: 2,
          sender: 'אתה',
          content: 'הכל טוב, תודה!',
          timestamp: new Date(),
          status: 'read',
          avatar: 'https://i.pravatar.cc/150?img=5',
        },
      ],
    },
    {
      id: 2,
      name: 'חברים',
      avatar: 'https://i.pravatar.cc/150?img=2',
      lastMessage: 'מתי ניפגש?',
      unreadCount: 0,
      isOnline: false,
      isGroup: true,
      description: 'קבוצת החברים הטובים',
      members: [
        { id: 201, name: 'דני', avatar: 'https://i.pravatar.cc/150?img=10', isOnline: true, phoneNumber: '+972 50-555-5555', email: 'danny@friends.com' },
        { id: 202, name: 'רותי', avatar: 'https://i.pravatar.cc/150?img=11', isOnline: false, phoneNumber: '+972 50-666-6666', email: 'ruth@friends.com' },
        { id: 203, name: 'יוסי', avatar: 'https://i.pravatar.cc/150?img=12', isOnline: true, phoneNumber: '+972 50-777-7777', email: 'yossi@friends.com' },
      ],
      messages: [
        {
          id: 1,
          sender: 'דני',
          content: 'רוצה לצאת הערב?',
          timestamp: new Date(),
          status: 'read',
          avatar: 'https://i.pravatar.cc/150?img=10',
        },
      ],
    },
    {
      id: 3,
      name: 'יעל',
      avatar: 'https://i.pravatar.cc/150?img=3',
      lastMessage: 'תזכורת: פגישה ב-10',
      unreadCount: 1,
      isOnline: true,
      isGroup: false,
      phoneNumber: '+972 50-888-8888',
      email: 'yael@example.com',
      messages: [
        {
          id: 1,
          sender: 'יעל',
          content: 'תזכורת: פגישה ב-10',
          timestamp: new Date(),
          status: 'delivered',
          avatar: 'https://i.pravatar.cc/150?img=3',
        },
      ],
    },
  ]

  const [chats, setChats] = useState<Chat[]>(initialChats)
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null)
  const [showProfile, setShowProfile] = useState(false)

  const [showChatList, setShowChatList] = useState(true)
  const chatListRef = useRef<HTMLDivElement>(null)
  const chatAreaRef = useRef<HTMLDivElement>(null)

  const [isMobile, setIsMobile] = useState<boolean>(false)

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

  const handleSelectChat = (id: number) => {
    setSelectedChatId(id)
    setShowChatList(false)
  }

  const handleSendMessage = (content: string) => {
    if (selectedChatId === null) return

    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === selectedChatId) {
          const newMessage: Message = {
            id: chat.messages.length + 1,
            sender: 'אתה',
            content,
            timestamp: new Date(),
            status: 'sent',
            avatar: 'https://i.pravatar.cc/150?img=5',
          }

          // Update last message and unread count
          return {
            ...chat,
            messages: [...chat.messages, newMessage],
            lastMessage: content,
            unreadCount: 0,
          }
        }
        return chat
      })
    )

    // Simulate message being delivered and read
    setTimeout(() => {
      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.id === selectedChatId) {
            const updatedMessages = chat.messages.map((msg) =>
              msg.status === 'sent' ? { ...msg, status: 'delivered' } : msg
            )
            return { ...chat, messages: updatedMessages }
          }
          return chat
        })
      )
    }, 1000)

    setTimeout(() => {
      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.id === selectedChatId) {
            const updatedMessages = chat.messages.map((msg) =>
              msg.status === 'delivered' ? { ...msg, status: 'read' } : msg
            )
            return { ...chat, messages: updatedMessages }
          }
          return chat
        })
      )
    }, 2000)
  }

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
              selectedChat={selectedChat}
              onBackClick={() => setShowChatList(true)}
              onProfileClick={() => setShowProfile(true)}
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            בחר צ'אט כדי להתחיל לשוחח
          </div>
        )}
      </div>
      {showProfile && selectedChat && (
        <ProfileInfo
          chat={selectedChat}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
    </Layout>
  )
}

export default App

