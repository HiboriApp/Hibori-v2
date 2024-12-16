import React, { useState, useEffect, useRef } from 'react'
import { ChevronRight, Send, Paperclip, Smile, MoreVertical, Search, X, ChevronLeft } from 'lucide-react'
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu'
import '@szhsin/react-menu/dist/index.css'
import { Layout } from '../components/layout';
import SuperSillyLoading from '../components/Loading'
import { Chat, chatExists, ChatWrapper, getChats, getUser, getUserById, getUsersById, makeChat, Message, openChat, openChatName, sendMessage, UserData } from '../api/db'
import { Avatar, unknownIcon } from '../api/icons'
import { Timestamp } from 'firebase/firestore'
import { useNavigate, useParams } from 'react-router-dom'
import { GetPallate, Pallate } from '../api/settings'


const formatTime = (date: Date) => {
  return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
}

const ChatList: React.FC<{
  chats: ChatWrapper[]
  onSelectChat: (id: string) => void
  selectedChat: string | null
  pallate: Pallate
  user: UserData
}> = ({ chats, onSelectChat, selectedChat, pallate, user }) => {
  return <div className="flex-grow overflow-y-auto">
    {chats.map((chat) => {
      const [chatter, setChatter] = useState<UserData | null>(null);
      useEffect(() => {
        if (Array.isArray(chat.person)) (chat.person.length == 0 ? setChatter(null) : getUserById(chat.person[0]).then(setChatter));
        else getUserById(chat.person).then(setChatter);
      })
      if (!chatter) return null;
      return <div
        key={chat.id}
        className={`p-4 flex items-center space-x-4 cursor-pointer hover:bg-${pallate.background} transition-colors duration-200 ${
          selectedChat === chat.id ? `bg-${pallate.secondary}` : ''
        }`}
        onClick={() => onSelectChat(chat.id)}
      >
        <div className="flex-shrink-0">
          <Avatar icon={chatter.icon} isOnline={chatter.lastOnline.toDate() > new Date()} className={`w-12 h-12 rounded-full object-cover`} />
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex justify-between items-baseline">
            <div className="font-semibold truncate mr-2">{chatter.name}</div>
            <div className="text-xs text-${pallate.text} flex-shrink-0">
              {formatTime((chat.lastMessageDate && chat.lastMessageDate.toDate()) || new Date())}
            </div>
          </div>
          <div className="text-sm text-${pallate.text} truncate mr-2">{chat.lastMessage && chat.lastMessage.content}</div>
        </div>
      </div>
  })}
  {
    user.friends.map((friend) => {
      if (chats.some((chat) => chat.person.includes(friend))) return null;
      const [chatter, setChatter] = useState<UserData | null>(null);
      useEffect(() => {
        getUserById(friend).then(setChatter);
      }, []);
      if (!chatter){return null;}
      return <div
      key={chatter.id}
      className={`p-4 flex items-center space-x-4 cursor-pointer hover:bg-${pallate.background} transition-colors duration-200 ${
        selectedChat === chatter.id ? `bg-${pallate.secondary}` : ''
      }`}
      onClick={() => onSelectChat(openChatName(user.id, chatter.id))}
    >
      <div className="flex-shrink-0">
        <Avatar icon={chatter.icon} isOnline={chatter.lastOnline.toDate() > new Date()} className={`w-12 h-12 rounded-full object-cover`} />
      </div>
      <div className="flex-grow min-w-0">
        <div className="flex justify-between items-baseline">
          <div className="font-semibold truncate mr-2">{chatter.name}</div>
          <div className="text-xs text-${pallate.text} flex-shrink-0">
            {formatTime(chatter.lastOnline.toDate() || new Date())}
          </div>
        </div>
      </div>
    </div>
    })
  }
  </div>
}

const MessageComponent: React.FC<{ message: Message; chatter: UserData | undefined; isSent: boolean; pallate: Pallate }> = ({ message, chatter, isSent, pallate }) => {
  return <div className={`mb-4 flex ${isSent ? 'justify-start' : 'justify-end'}`}>
    {isSent && <Avatar icon={chatter ? chatter.icon : unknownIcon()} className='w-8 h-8' />}
    <div
      className={`max-w-[70%] p-3 rounded-lg relative ml-5 mr-5 ${
        isSent ? `bg-${pallate.secondary} text-${pallate.text} ml-2` : `bg-${pallate.white} text-${pallate.text} shadow-sm mr-2`
      }`}
    >
      <div
        className={`absolute top-2 ${isSent ? '-right-2' : '-left-2'} w-4 h-4 transform rotate-45 ${
          isSent ? `bg-${pallate.secondary}` : `bg-${pallate.white}`
        }`}
      ></div>
      <div className="relative z-10 px-2">
        <div>{message.content}</div>
        <div className="text-xs text-${pallate.text} mt-1 flex items-center justify-end">
          {formatTime(message.timestamp.toDate())}
        </div>
      </div>
    </div>
    {!isSent && <Avatar icon={chatter ? chatter.icon : unknownIcon()} className='w-8 h-8' />}
  </div>
}

const InputArea: React.FC<{ onSendMessage: (content: string) => void; pallate: Pallate }> = ({ onSendMessage, pallate }) => {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      onSendMessage(message)
      setMessage('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`flex items-center p-4 bg-${pallate.white} border-t border-${pallate.gray[200]}`}>
      <button type="button" className={`text-${pallate.text} hover:text-${pallate.tertiary} ml-2`}>
        <Smile size={24} />
      </button>
      <button type="button" className={`text-${pallate.text} hover:text-${pallate.tertiary} ml-2`}>
        <Paperclip size={24} />
      </button>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="הקלד הודעה..."
        className={`flex-grow p-2 bg-${pallate.background} rounded-full text-right focus:outline-none focus:ring-2 focus:ring-${pallate.primary}`}
      />
      <button type="submit" className={`mr-2 text-${pallate.primary} hover:text-${pallate.tertiary}`}>
        <Send size={24} />
      </button>
    </form>
  )
}

const ProfileInfo: React.FC<{
  chat: Chat
  chatter: UserData | UserData | undefined
  onClose: () => void
  pallate: Pallate
}> = ({ chat, onClose, chatter, pallate }) => {
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
      <div className={`bg-${pallate.white} rounded-lg p-6 w-full max-w-md`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">פרופיל</h2>
          <button onClick={onClose} className={`text-${pallate.text} hover:text-${pallate.tertiary}`}>
            <X size={24} />
          </button>
        </div>
        <div className="flex flex-col items-center mb-4">
          <Avatar className="w-24 h-24 rounded-full mb-2" icon={chatter.icon}></Avatar>
          <h3 className="text-xl font-semibold">{chatter.name}</h3>
          <p className="text-${pallate.text}">{(chatter.lastOnline.toDate() > new Date()) ? 'מחובר' : 'לא מחובר'}</p>
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
  chatter: UserData[] | undefined
  onBackClick: () => void
  onProfileClick: (profile: string) => void
  user: UserData
  pallate: Pallate
}> = ({ messages, onSendMessage, user, chatter, selectedChat, onBackClick, onProfileClick, pallate }) => {
  if (!chatter){return null;}
  const otherUser = chatter.filter((chatter) => chatter.id != user.id)[0];
  return <div className="flex flex-col h-full min-h-0">
    {/* Header */}
    <div className={`bg-${pallate.white} p-4 flex items-center justify-between border-b border-${pallate.gray[200]} flex-shrink-0`}>
      <div className="flex items-center">
        <button onClick={onBackClick} className="md:hidden mr-2 text-${pallate.text}">
          <ChevronRight size={24} />
        </button>
        {selectedChat && (
          <>
            <div onClick={() => onProfileClick(selectedChat.id)} className="cursor-pointer">
              <Avatar
                icon={selectedChat.icon || otherUser.icon}
                isOnline={otherUser.lastOnline.toDate() > new Date()}
              />
            </div>
            <div className="mr-3">
              <h2 className="font-semibold">{selectedChat.name}</h2>
              <p className="text-xs text-${pallate.text}">
                {`${otherUser.friends} חברים`}
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
    <div className={`flex-grow overflow-y-auto p-4 bg-${pallate.background}`}>
      {messages.map((message) => (
        <MessageComponent 
        chatter={message.sender == user.id ? user : otherUser} 
        key={message.sender + message.timestamp.toDate().toString()} message={message} isSent={message.sender === 'אתה'} pallate={pallate} />
      ))}
    </div>
    {/* Input Area */}
    <div className="flex-shrink-0">
      <InputArea onSendMessage={onSendMessage} pallate={pallate} />
    </div>
  </div>
}

const App: React.FC = () => {
  const {id} = useParams();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(id || null);
  const [showProfile, setShowProfile] = useState<string | undefined>();
  const [user, setUser] = useState<UserData | undefined>();
  const [pallate, setPallate] = useState<Pallate | undefined>();
  const [openedChats, setOpenedChats] = useState<Chat[]>([]);
  const [chatsWrapper, setChatsWrapper] = useState<ChatWrapper[] | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [selectedChatters, setSelectedChatters] = useState<UserData[] | undefined>()
  const navigate = useNavigate();
  const [showChatList, setShowChatList] = useState(true)
  const chatListRef = useRef<HTMLDivElement>(null)
  const chatAreaRef = useRef<HTMLDivElement>(null)
  console.log(selectedChatters);
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    const fetchChats = async () => {
      const fetchedPallate = await GetPallate();
      setPallate(fetchedPallate);
      const user = await getUser();
      setUser(user);
      if (!user){navigate('/');return;}
      const chats = await getChats(user);
      setChatsWrapper(chats.chats);
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
    if (!user){return;}
    setShowProfile(undefined)
    setSelectedChatId(id)
    if (openedChats.find((chat) => chat.id === openChatName(user.id, id))) {
      const chat = openedChats.find((chat) => chat.id === openChatName(user.id, id));
      if (!chat){return;}
      setSelectedChat(chat);
      setSelectedChatters(await getUsersById(chat.person));
      setShowChatList(false)
      return
    }
    try {
      const chat = await openChat(id);
      setOpenedChats([...openedChats, chat])
      const chatters = await getUsersById(chat.person);
      setSelectedChat(chat);
      setSelectedChatters(chatters)
      setShowChatList(false)
    }catch{
      if (await chatExists(id)){
        return;
      }
      const chat: Chat = {
        person: [user.id, id],
        messages: [],
        id: openChatName(user.id, id),
      }
      await makeChat(chat);
      setOpenedChats([...openedChats, chat])
      const chatters = await getUsersById(chat.person);
      setSelectedChat(chat);
      setSelectedChatters(chatters)
      setShowChatList(false)
    }
  }

  const handleSendMessage = (content: string) => {
    if (selectedChatId === null  || !user) return;
    if (!selectedChat)return;
    sendMessage(selectedChat, {content, sender: user.id, timestamp: Timestamp.fromDate(new Date())})
  }
  if (!pallate || !chatsWrapper || !user){return <SuperSillyLoading></SuperSillyLoading>}
  return (
    <Layout>
    <div dir="rtl" className={`h-screen md:h-[94vh] flex bg-${pallate.background} text-right overflow-hidden`}>
      {/* Chat List */}
      <div
        ref={chatListRef}
        className={`bg-${pallate.white} w-full md:w-1/3 border-l border-${pallate.gray[200]} ${
          showChatList ? 'block' : 'hidden md:block'
        }`}
      >
        <div className="flex flex-col h-full min-h-0">
          {/* Header */}
          <div className={`p-4 border-b border-${pallate.gray[200]} flex-shrink-0`}>
            <h1 className={`text-2xl font-bold text-${pallate.text}`}>הודעות</h1>
            <div className="mt-4 relative">
              <input
                type="text"
                placeholder="חיפוש"
                className={`w-full p-2 pl-10 pr-4 bg-${pallate.background} rounded-full text-right focus:outline-none focus:ring-2 focus:ring-green-600`}
              />
              <Search className="absolute left-3 top-2.5 text-${pallate.text}" size={20} />
            </div>
          </div>
          {/* Chat List */}
          <ChatList chats={chatsWrapper} user={user} onSelectChat={handleSelectChat} selectedChat={selectedChatId} pallate={pallate} />
        </div>
      </div>
      {/* Chat Area */}
      <div
        ref={chatAreaRef}
        className={`bg-${pallate.white} flex-grow ${
          showChatList ? 'hidden md:block' : 'block'
        }`}
      >
        {selectedChat ? (
          <div className="flex flex-col h-full min-h-0">
            <ChatArea
              messages={selectedChat.messages}
              onSendMessage={handleSendMessage}
              chatter={selectedChatters}
              user={user}
              selectedChat={selectedChat}
              onBackClick={() => setShowChatList(true)}
              onProfileClick={(profile) => setShowProfile(profile)}
              pallate={pallate}
            />
          </div>
        ) : (
          <div className={`h-full flex items-center justify-center text-${pallate.text}`}>
            בחר צ'אט כדי להתחיל לשוחח
          </div>
        )}
      </div>
      {showProfile && selectedChat && Array.isArray(selectedChatters) && (
        <ProfileInfo
          chat={selectedChat}
          chatter={selectedChatters.find((chatter) => chatter.id === showProfile)}
          onClose={() => setShowProfile(undefined)}
          pallate={pallate}
        />
      )}
    </div>
    </Layout>
  )
}

export default App

