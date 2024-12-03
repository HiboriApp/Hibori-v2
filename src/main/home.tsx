import React, { useState, useEffect } from 'react'
import { Loader2, Heart, Share2, ArrowRight, Bell, MessageSquare, User, Send, Users } from 'lucide-react'
import { Layout } from '../components/layout'

type ContentItem = {
  id: string
  content: string
  target: string
  timestamp: string
  image?: string
  likes: number
}

type Friend = {
  id: string
  name: string
  online: boolean
  avatar: string
}

type Message = {
  id: string
  sender: string
  avatar: string
  content: string
  timestamp: string
}

type Notification = {
  id: string
  content: string
  timestamp: string
  type: 'message' | 'like' | 'comment'
  userAvatar: string
  userName: string
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-24">
      <Loader2 className="h-8 w-8 animate-spin text-green-500" />
    </div>
  )
}

const ContentCard: React.FC<{ item: ContentItem }> = ({ item }) => {
  const [isLiked, setIsLiked] = useState(false)
  const [likes, setLikes] = useState(item.likes)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes(isLiked ? likes - 1 : likes + 1)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `פוסט מאת ${item.target}`,
        text: item.content,
        url: window.location.href,
      }).then(() => {
        console.log('Successfully shared')
      }).catch((error) => {
        console.log('Error sharing:', error)
      })
    } else {
      alert('שיתוף לא נתמך בדפדפן זה')
    }
  }

  const handleForward = () => {
    console.log('Forward button clicked')
  }

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xl ml-4">
            {item.target[0]}
          </div>
          <div>
            <p className="font-semibold text-lg text-gray-800">{item.target}</p>
            <p className="text-sm text-gray-500">{new Date(item.timestamp).toLocaleString()}</p>
          </div>
        </div>
        <p className="text-base text-gray-700 mb-4">{item.content}</p>
        {item.image && (
          <img src={item.image} alt="תמונת פוסט" className="rounded-xl w-full object-cover max-h-96 mb-4" />
        )}
        <div className="flex justify-between items-center text-gray-500">
          <button 
            className="flex items-center hover:text-green-500 transition-colors duration-200"
            onClick={handleForward}
          >
            <ArrowRight size={24} className="ml-2" />
            <span className="text-base">העבר</span>
          </button>
          <button 
            className={`flex items-center transition-colors duration-200 ${isLiked ? 'text-green-500' : 'hover:text-green-500'}`}
            onClick={handleLike}
          >
            <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} className="ml-2" />
            <span className="text-base">{likes}</span>
          </button>
          <button 
            className="flex items-center hover:text-green-500 transition-colors duration-200"
            onClick={handleShare}
          >
            <Share2 size={24} className="ml-2" />
            <span className="text-base">שתף</span>
          </button>
        </div>
      </div>
    </div>
  )
}

const simulatedContent: ContentItem[] = [
  {
    id: 'p1',
    content: 'תראו את התמונה המגניבה הזו!',
    target: 'צ׳רלי',
    timestamp: new Date().toISOString(),
    image: 'https://picsum.photos/800/600',
    likes: 24,
  },
  {
    id: 'p2',
    content: 'סתם פוסט טקסט',
    target: 'דוד',
    timestamp: new Date().toISOString(),
    likes: 15,
  },
  {
    id: 'p3',
    content: 'יום יפה!',
    target: 'גרייס',
    timestamp: new Date().toISOString(),
    image: 'https://picsum.photos/800/600?random=1',
    likes: 42,
  },
]

function NewContentFeed() {
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState<ContentItem[]>([])

  useEffect(() => {
    const fetchNewContent = () => {
      setLoading(true)
      setTimeout(() => {
        setContent(prevContent => [...simulatedContent, ...prevContent])
        setLoading(false)
      }, 1500)
    }

    fetchNewContent()
    const interval = setInterval(fetchNewContent, 60000)

    return () => clearInterval(interval)
  }, [])

  if (loading && content.length === 0) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {loading && <LoadingSpinner />}
      {content.map(item => (
        <ContentCard key={item.id} item={item} />
      ))}
    </div>
  )
}

const friends: Friend[] = [
  { id: '1', name: 'אבי', online: true, avatar: 'https://picsum.photos/100/100?random=1' },
  { id: '2', name: 'שרה', online: false, avatar: 'https://picsum.photos/100/100?random=2' },
  { id: '3', name: 'יוסי', online: true, avatar: 'https://picsum.photos/100/100?random=3' },
  { id: '4', name: 'רחל', online: true, avatar: 'https://picsum.photos/100/100?random=4' },
  { id: '5', name: 'דן', online: false, avatar: 'https://picsum.photos/100/100?random=5' },
  { id: '6', name: 'מיכל', online: true, avatar: 'https://picsum.photos/100/100?random=6' },
]

const messages: Message[] = [
  { id: '1', sender: 'אבי', avatar: 'https://picsum.photos/100/100?random=1', content: 'היי, מה שלומך?', timestamp: '10:30' },
  { id: '2', sender: 'שרה', avatar: 'https://picsum.photos/100/100?random=2', content: 'תודה על העזרה אתמול!', timestamp: '09:15' },
  { id: '3', sender: 'יוסי', avatar: 'https://picsum.photos/100/100?random=3', content: 'מתי נפגשים?', timestamp: '11:45' },
]

const notifications: Notification[] = [
  { id: '1', content: 'אהב את הפוסט שלך', timestamp: '10:30', type: 'like', userAvatar: 'https://picsum.photos/100/100?random=1', userName: 'אבי' },
  { id: '2', content: 'הגיב על התמונה שלך', timestamp: '09:15', type: 'comment', userAvatar: 'https://picsum.photos/100/100?random=2', userName: 'שרה' },
  { id: '3', content: 'שלח לך הודעה', timestamp: '11:45', type: 'message', userAvatar: 'https://picsum.photos/100/100?random=3', userName: 'יוסי' },
]

function LeftPanel() {
  return (
    <>
      <div className="bg-white rounded-xl p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Users className="ml-3 text-green-500" size={24} />
          חברים מקוונים
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {friends.map((friend) => (
            <div key={friend.id} className="flex flex-col items-center">
              <div className="relative">
                <img
                  src={friend.avatar}
                  alt={friend.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className={`absolute bottom-0 left-0 w-3 h-3 rounded-full border-2 border-white ${friend.online ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              </div>
              <span className="mt-1 text-xs text-gray-700 text-center">{friend.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <MessageSquare className="ml-3 text-green-500" size={24} />
          הודעות חדשות
        </h3>
        <ul className="space-y-3">
          {messages.map((message) => (
            <li key={message.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <img src={message.avatar} alt={message.sender} className="w-10 h-10 rounded-full ml-3" />
                <div>
                  <p className="font-medium text-sm">{message.sender}</p>
                  <p className="text-xs text-gray-600 truncate">{message.content}</p>
                  <span className="text-xs text-gray-400">{message.timestamp}</span>
                </div>
              </div>
              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                <Send className="h-4 w-4 text-green-500" />
                <span className="sr-only">Send message</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-white rounded-xl p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <Bell className="ml-3 text-green-500" size={24} />
          התראות
        </h3>
        <ul className="space-y-3">
          {notifications.map((notification) => (
            <li key={notification.id} className="flex items-center bg-gray-50 rounded-lg p-3">
              <img src={notification.userAvatar} alt={notification.userName} className="w-10 h-10 rounded-full ml-3" />
              <div className="flex-grow">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{notification.userName}</span> {notification.content}
                </p>
                <span className="text-xs text-gray-500">{notification.timestamp}</span>
              </div>
              <div className="ml-3">
                {notification.type === 'like' && <Heart className="text-red-500" size={20} />}
                {notification.type === 'comment' && <MessageSquare className="text-blue-500" size={20} />}
                {notification.type === 'message' && <User className="text-green-500" size={20} />}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

function App() {
  return (
    <Layout>
      <div className="min-h-screen ">
        <div className="flex justify-center">
          {/* Set the grid container direction to LTR */}
          <div
            className="w-full max-w-7xl grid grid-cols-12 gap-4"
            style={{ direction: 'ltr' }}
          >
            {/* Left Panel */}
            <div className="hidden lg:block col-span-4">
              <div className="sticky top-6">
                {/* Apply dir="rtl" to the left panel container */}
                <div className="bg-white shadow-lg rounded-xl p-4" dir="rtl">
                  <LeftPanel />
                </div>
              </div>
            </div>
            {/* Main Content */}
            <div className="col-span-12 lg:col-span-8 px-4 py-8" dir="rtl">
              <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b-2 border-green-400 pb-2">
                  הודעות ופוסטים
                </h1>
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                    תוכן
                  </h2>
                  <NewContentFeed />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default App;

