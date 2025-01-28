import type React from "react"
import { useState, useEffect, useRef } from "react"
import { ChevronRight, Send, Paperclip, Smile, Search, X, ChevronLeft, Edit, Trash, Reply } from "lucide-react"
import "@szhsin/react-menu/dist/index.css"
import { Layout } from "../components/layout"
import SuperSillyLoading from "../components/Loading"
import {
  type Chat,
  chatExists,
  type ChatWrapper,
  getChats,
  getUser,
  getUserById,
  getUsersById,
  setChat,
  type Message,
  openChat,
  openChatName,
  type UserData,
} from "../api/db"
import { Avatar, unknownIcon } from "../api/icons"
import { Timestamp } from "firebase/firestore"
import { useNavigate, useParams } from "react-router-dom"
import { GetPallate, type Pallate } from "../api/settings"
import { chatsListener } from "../api/listeners"

const formatTime = (date: Date) => {
  return date.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })
}

const ChatList: React.FC<{
  chats: ChatWrapper[]
  onSelectChat: (id: string) => void
  selectedChat: string | null
  pallate: Pallate
  user: UserData
}> = ({ chats, onSelectChat, selectedChat, pallate, user }) => {
  return (
    <div className="flex-grow overflow-y-auto" style={{ backgroundColor: pallate.background, color: pallate.text }}>
      {chats.map((chat) => {
        const [chatter, setChatter] = useState<UserData | null>(null)
        useEffect(() => {
          if (!chat.person.filter((id) => id != user.id)[0]) {
            console.error("FAILED TO FIND THE SECOND USER")
            return
          }
          getUserById(chat.person.filter((id) => id != user.id)[0]).then((res) => setChatter(res))
        }, [])
        if (!chatter) return null
        return (
          <div
            key={chat.id}
            className={`p-4 flex items-center space-x-4 cursor-pointer transition-colors duration-200 ${
              selectedChat === chat.id ? "bg-opacity-20" : ""
            }`}
            style={{
              backgroundColor: selectedChat === chat.id ? `${pallate.primary}20` : "transparent",
              color: pallate.text,
            }}
            onClick={() => onSelectChat(chat.id)}
          >
            <div className="flex-shrink-0">
              <Avatar
                icon={chatter.icon}
                isOnline={chatter.lastOnline.toDate() > new Date()}
                className="w-12 h-12 rounded-full object-cover"
              />
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex justify-between items-baseline">
                <div className="font-semibold truncate mr-2">{chatter.name}</div>
                <div className="text-xs flex-shrink-0" style={{ color: pallate.secondary }}>
                  {formatTime((chat.lastMessageDate && chat.lastMessageDate.toDate()) || new Date())}
                </div>
              </div>
              <div className="text-sm truncate mr-2" style={{ color: pallate.tertiary }}>
                {chat.lastMessage && chat.lastMessage.content}
              </div>
            </div>
          </div>
        )
      })}
      {user.friends.map((friend) => {
        if (chats.some((chat) => chat.person.includes(friend))) return null
        const [chatter, setChatter] = useState<UserData | null>(null)
        useEffect(() => {
          getUserById(friend).then(setChatter)
        }, [])
        if (!chatter) return null
        return (
          <div
            key={chatter.id}
            className={`p-4 flex items-center space-x-4 cursor-pointer hover:bg-gray-100 transition-colors duration-200 ${
              selectedChat === chatter.id ? "bg-gray-200" : ""
            }`}
            onClick={() => onSelectChat(chatter.id)}
          >
            <div className="flex-shrink-0">
              <Avatar
                icon={chatter.icon}
                isOnline={chatter.lastOnline.toDate() > new Date()}
                className="w-12 h-12 rounded-full object-cover"
              />
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex justify-between items-baseline">
                <div className="font-semibold truncate mr-2">{chatter.name}</div>
                <div className="text-xs text-gray-500 flex-shrink-0">
                  {formatTime(chatter.lastOnline.toDate() || new Date())}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const MessageComponent: React.FC<{
  message: Message
  chatter: UserData | undefined
  isSent: boolean
  pallate: Pallate
  onEdit: (messageId: string) => void
  onDelete: (messageId: string) => void
  onReply: (messageId: string) => void
  replyingTo?: Message
}> = ({ message, chatter, isSent, pallate, onEdit, onDelete, onReply, replyingTo }) => {
  const [showOptions, setShowOptions] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleTouchStart = () => {
    timeoutRef.current = setTimeout(() => {
      setShowOptions(true)
    }, 500)
  }

  const handleTouchEnd = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showOptions && !(event.target as Element).closest(".message-container")) {
        setShowOptions(false)
      }
    }

    document.addEventListener("click", handleClickOutside)
    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [showOptions])

  return (
    <div className={`mb-4 ${isSent ? "mr-auto" : "ml-auto"} max-w-[80%]`}>
      <div className={`flex items-start ${isSent ? "flex-row-reverse" : "flex-row"}`}>
        <Avatar icon={chatter ? chatter.icon : unknownIcon()} className={`w-8 h-8 ${isSent ? "ml-2" : "mr-2"}`} />
        <div className={`flex flex-col ${isSent ? "items-end" : "items-start"}`}>
          <span className="text-xs font-semibold mb-1" style={{ color: pallate.text }}>
            {chatter?.name}
          </span>
          <div
            className={`message-container min-w-[80px] relative p-3 rounded-lg`}
            style={{
              backgroundColor: isSent ? pallate.primary : pallate.secondary,
              color: isSent ? pallate.background : pallate.text,
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {replyingTo && (
              <div className={`text-xs italic mb-2 p-1 ${isSent ? "bg-blue-600" : "bg-gray-300"} rounded`}>
                מגיב ל: {replyingTo.content}
              </div>
            )}
            <div className="break-words">
              {message.isDeleted ? <span className="italic underline">[ההודעה נמחקה]</span> : message.content}
            </div>
            <div className="text-xs mt-1 flex items-center justify-end">
              {formatTime(message.timestamp.toDate())}
              {message.isEdited && <span className="mr-1">(נערך)</span>}
            </div>
          </div>
          {showOptions && !message.isDeleted && (
            <div
              className={`mt-1 rounded shadow-md border-2 flex ${isSent ? "justify-start" : "justify-end"}`}
              style={{ backgroundColor: pallate.background, borderColor: pallate.secondary }}
            >
              <button onClick={() => onEdit(message.id)} className="p-1 mr-2" style={{ color: pallate.text }}>
                <Edit size={20} />
              </button>
              <button onClick={() => onDelete(message.id)} className="p-1 mr-2" style={{ color: pallate.text }}>
                <Trash size={20} />
              </button>
              <button onClick={() => onReply(message.id)} className="p-1 mr-2 ml-2" style={{ color: pallate.text }}>
                <Reply size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const InputArea: React.FC<{
  onSendMessage: (content: string) => void
  pallate: Pallate
  replyingTo: Message | null
  onCancelReply: () => void
  editingMessage: Message | null
  onCancelEdit: () => void
}> = ({ onSendMessage, pallate, replyingTo, onCancelReply, editingMessage, onCancelEdit }) => {
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.content)
    }
  }, [editingMessage])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      onSendMessage(message)
      setMessage("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col border-t" style={{ borderColor: pallate.secondary }}>
      {replyingTo && (
        <div
          className="p-2 mb-[0.5vh] flex justify-between items-center"
          style={{ backgroundColor: `${pallate.secondary}20` }}
        >
          <span className="text-sm" style={{ color: pallate.text }}>
            מגיב ל: {replyingTo.content}
          </span>
          <button type="button" onClick={onCancelReply} style={{ color: pallate.secondary }}>
            <X size={16} />
          </button>
        </div>
      )}
      {editingMessage && (
        <div
          className="p-2 mb-[0.5vh] flex justify-between items-center"
          style={{ backgroundColor: `${pallate.secondary}20` }}
        >
          <span className="text-sm" style={{ color: pallate.text }}>
            עורך הודעה
          </span>
          <button type="button" onClick={onCancelEdit} style={{ color: pallate.secondary }}>
            <X size={16} />
          </button>
        </div>
      )}
      <div className="flex items-center p-2 min-w-[300px]" style={{ backgroundColor: pallate.background }}>
        <button type="button" style={{ color: pallate.secondary }}>
          <Smile size={24} />
        </button>
        <button type="button" style={{ color: pallate.secondary }}>
          <Paperclip size={24} />
        </button>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={editingMessage ? "ערוך הודעה..." : "הקלד הודעה..."}
          className="flex-grow p-2 bg-transparent text-right focus:outline-none"
          style={{ color: pallate.text }}
        />
        <button type="submit" style={{ color: pallate.primary }}>
          <Send size={24} />
        </button>
      </div>
    </form>
  )
}

const ProfileInfo: React.FC<{
  chat: Chat
  chatter: UserData | UserData | undefined
  onClose: () => void
  pallate: Pallate
}> = ({ chat, onClose, chatter }) => {
  const [showAllMembers, setShowAllMembers] = useState(false)
  const [members, setMembers] = useState<UserData[] | UserData | undefined>()

  if (!chatter) return null

  useEffect(() => {
    if (Array.isArray(chat.person)) getUsersById(chat.person).then(setMembers)
    else getUserById(chat.person).then(setMembers)
  }, [])

  if (!members) return null

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
          <p className="text-gray-600">{chatter.lastOnline.toDate() > new Date() ? "מחובר" : "לא מחובר"}</p>
        </div>
        {Array.isArray(members) ? (
          <>
            <div className="mb-4">
              <h4 className="font-semibold mb-2">תיאור הקבוצה</h4>
              <p>{chat.description || "לא מוגדר"}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">חברי הקבוצה</h4>
              <div className="flex overflow-x-auto pb-2 mb-2">
                {members?.slice(0, showAllMembers ? undefined : 3).map((member) => (
                  <div key={member.id} className="flex-shrink-0 ml-2 text-center">
                    <Avatar icon={member.icon} className="w-8 h-8" />
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
            <p>
              <strong>אימייל</strong> {chatter.email}
            </p>
            <p>
              <strong>מידע אישי: </strong>
              <br /> {chatter.bio}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

const ChatArea: React.FC<{
  messages: Message[]
  onSendMessage: (content: string, replyTo?: string) => void
  selectedChat: Chat | null
  chatter: UserData[] | undefined
  onBackClick: () => void
  onProfileClick: (profile: string) => void
  user: UserData
  pallate: Pallate
}> = ({ messages, onSendMessage, user, chatter, selectedChat, onBackClick, onProfileClick, pallate }) => {
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  if (!chatter) return null

  const otherUser = chatter.filter((c) => c.id != user.id)[0]

  const handleEditMessage = (messageId: string) => {
    const messageToEdit = messages.find((m) => m.id === messageId)
    if (messageToEdit) {
      setEditingMessage(messageToEdit)
    }
  }

  const handleDeleteMessage = (messageId: string) => {
    onSendMessage("", messageId)
  }

  const handleReplyMessage = (messageId: string) => {
    const replyMessage = messages.find((m) => m.id === messageId)
    if (replyMessage) {
      setReplyingTo(replyMessage)
    }
  }

  const handleSendMessage = (content: string) => {
    if (editingMessage) {
      onSendMessage(content, editingMessage.id)
      setEditingMessage(null)
    } else {
      onSendMessage(content, replyingTo?.id)
      setReplyingTo(null)
    }
    scrollToBottom()
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="flex flex-col h-full min-h-0 chat-area relative" style={{ backgroundColor: pallate.background }}>
      {/* Header */}
      <div
        className="p-4 flex items-center justify-between border-b flex-shrink-0 z-10"
        style={{ backgroundColor: `${pallate.background}CC`, borderColor: pallate.secondary }}
      >
        <div className="flex items-center">
          <button onClick={onBackClick} className="md:hidden ml-2" style={{ color: pallate.text }}>
            <ChevronRight size={24} />
          </button>
          {selectedChat && (
            <>
              <div onClick={() => onProfileClick(selectedChat.id)}>
                <Avatar
                  className="w-8 h-8"
                  icon={selectedChat.icon || otherUser.icon}
                  isOnline={otherUser.lastOnline.toDate() > new Date()}
                />
              </div>
              <div className="ml-3">
                <h2 className="font-semibold" style={{ color: pallate.text }}>
                  {selectedChat.name}
                </h2>
                <p className="text-md mr-2" style={{ color: pallate.secondary }}>
                  {`${otherUser.name}`}
                </p>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center space-x-4"></div>
      </div>
      {/* Messages */}
      <div ref={scrollContainerRef} className="flex-grow overflow-y-auto p-4 relative z-10">
        {messages.map((message) => (
          <MessageComponent
            key={message.id}
            message={message}
            chatter={message.sender == user.id ? user : otherUser}
            isSent={message.sender === user.id}
            pallate={pallate}
            onEdit={handleEditMessage}
            onDelete={handleDeleteMessage}
            onReply={handleReplyMessage}
            replyingTo={message.reply ? messages.find((m) => m.id === message.reply) : undefined}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      {/* Input Area */}
      <div className="flex-shrink-0 z-10">
        <InputArea
          onSendMessage={handleSendMessage}
          pallate={pallate}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          editingMessage={editingMessage}
          onCancelEdit={() => setEditingMessage(null)}
        />
      </div>
    </div>
  )
}

const App: React.FC = () => {
  const { id } = useParams()
  const [selectedChatId, setSelectedChatId] = useState<string | null>(id || null)
  const [showProfile, setShowProfile] = useState<string | undefined>()
  const [user, setUser] = useState<UserData | undefined>()
  const [pallate, setPallate] = useState<Pallate | undefined>()
  const [openedChats, setOpenedChats] = useState<Chat[]>([])
  const [chatsWrapper, setChatsWrapper] = useState<ChatWrapper[] | null>(null)
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [selectedChatters, setSelectedChatters] = useState<UserData[] | undefined>()
  const navigate = useNavigate()
  const [showChatList, setShowChatList] = useState(true)
  const chatListRef = useRef<HTMLDivElement>(null)
  const chatAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchChats = async () => {
      const user = await getUser()
      setUser(user)
      if (!user) {
        navigate("/")
        return
      }

      const fetchedPallate = await GetPallate(user)
      setPallate(fetchedPallate)
      const chats = await getChats(user)
      setChatsWrapper(chats.chats)
      return chatsListener((chats) => setOpenedChats(chats))
    }
    fetchChats()
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

    chatListRef.current?.addEventListener("touchstart", handleTouchStart)
    chatAreaRef.current?.addEventListener("touchstart", handleTouchStart)
    document.addEventListener("touchmove", handleTouchMove)
    document.addEventListener("touchend", handleTouchEnd)

    return () => {
      chatListRef.current?.removeEventListener("touchstart", handleTouchStart)
      chatAreaRef.current?.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [])

  const handleSelectChat = async (id: string) => {
    if (!user) return
    setShowProfile(undefined)
    setSelectedChatId(id)
    if (openedChats.find((chat) => chat.id === openChatName(user.id, id))) {
      const chat = openedChats.find((chat) => chat.id === openChatName(user.id, id))
      if (!chat) return
      setSelectedChat(chat)
      setSelectedChatters(await getUsersById(chat.person))
      setShowChatList(false)
      return
    }
    try {
      const chat = await openChat(id)
      setOpenedChats([...openedChats, chat])
      const chatters = await getUsersById(chat.person)
      setSelectedChat(chat)
      setSelectedChatters(chatters)
      setShowChatList(false)
    } catch {
      if (await chatExists(id)) {
        return
      }
      const newChat: Chat = {
        person: [user.id, id],
        messages: [],
        id: openChatName(user.id, id),
      }
      const createdChat = await setChat(newChat)
      if (!createdChat) {
        return
      }
      setOpenedChats([...openedChats, createdChat])
      const chatters = await getUsersById(createdChat.person)
      setSelectedChat(createdChat)
      setSelectedChatters(chatters)
      setShowChatList(false)
    }
  }

  const handleSendMessage = async (content: string, messageId?: string) => {
    if (selectedChatId === null || !user || !selectedChat) return
    let updatedMessages: Message[]
    let newMessage: Message
    if (messageId) {
      const existingMessage = selectedChat.messages.find((m) => m.id === messageId)
      if (existingMessage) {
        // This is an edit or delete
        updatedMessages = selectedChat.messages.map((m) =>
          m.id === messageId ? { ...m, content: content || "ההודעה נמחקה", isEdited: true, isDeleted: !content } : m,
        )
        newMessage = updatedMessages.find((m) => m.id === messageId)!
      } else {
        // This is a reply
        newMessage = {
          id: Date.now().toString(),
          content,
          sender: user.id,
          timestamp: Timestamp.fromDate(new Date()),
          reply: messageId,
        }
        updatedMessages = [...selectedChat.messages, newMessage]
      }
    } else {
      // This is a new message
      newMessage = {
        id: Date.now().toString(),
        content,
        sender: user.id,
        timestamp: Timestamp.fromDate(new Date()),
      }
      updatedMessages = [...selectedChat.messages, newMessage]
    }
    const updatedChat = { ...selectedChat, messages: updatedMessages }
    setSelectedChat(updatedChat)
    setOpenedChats(openedChats.map((chat) => (chat.id === selectedChatId ? updatedChat : chat)))
    await setChat(updatedChat)
  }

  if (!pallate || !chatsWrapper || !user) {
    return <SuperSillyLoading />
  }

  return (
    <Layout
      children={
        <div
          dir="rtl"
          className="h-screen flex overflow-hidden"
          style={{ backgroundColor: pallate.background, color: pallate.text }}
        >
          {/* Chat List */}
          <div
            ref={chatListRef}
            className={`w-full md:w-1/3 border-l ${showChatList ? "block" : "hidden md:block"}`}
            style={{ backgroundColor: pallate.main, borderColor: pallate.secondary }}
          >
            <div className="flex flex-col h-full min-h-0">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-800">הודעות</h1>
                <div className="mt-4 relative">
                  <input
                    type="text"
                    placeholder="חיפוש"
                    className="w-full p-2 pl-10 pr-4 bg-gray-100 rounded-full text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-500" size={20} />
                </div>
              </div>
              {/* Chat List */}
              <ChatList
                chats={chatsWrapper}
                user={user}
                onSelectChat={handleSelectChat}
                selectedChat={selectedChatId}
                pallate={pallate}
              />
            </div>
          </div>
          {/* Chat Area */}
          <div
            ref={chatAreaRef}
            className={`flex-grow ${showChatList ? "hidden md:block" : "block"}`}
            style={{ backgroundColor: pallate.background }}
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
              <div className="h-full flex items-center justify-center" style={{ color: pallate.secondary }}>
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
      }
    ></Layout>
  )
}

export default App

