import React, { useState, useEffect } from 'react'
import { Loader2, Heart, Share2, ArrowRight } from 'lucide-react'
import { Layout } from './layout'

type ContentItem = {
  id: string
  content: string
  target: string
  timestamp: string
  image?: string
  likes: number
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
    // Placeholder for future functionality
    console.log('Forward button clicked')
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="p-4">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-lg ml-3">
            {item.target[0]}
          </div>
          <div>
            <p className="font-semibold text-base text-gray-800">{item.target}</p>
            <p className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleString()}</p>
          </div>
        </div>
        <p className="text-sm text-gray-700 mb-4">{item.content}</p>
        {item.image && (
          <img src={item.image} alt="תמונת פוסט" className="rounded-lg w-full object-cover max-h-64 mb-4" />
        )}
        <div className="flex justify-between items-center text-gray-500">
   
         
          <button 
            className="flex items-center hover:text-green-500 transition-colors duration-200"
            onClick={handleForward}
          >
            <ArrowRight size={18} className="ml-1" />
            <span className="text-sm">העבר</span>
          </button>
          <button 
            className={`flex items-center transition-colors duration-200 ${isLiked ? 'text-green-500' : 'hover:text-green-500'}`}
            onClick={handleLike}
          >
            <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} className="ml-1" />
            <span className="text-sm">{likes}</span>
          </button>
          <button 
            className="flex items-center hover:text-green-500 transition-colors duration-200"
            onClick={handleShare}
          >
            <Share2 size={18} className="ml-1" />
            <span className="text-sm">שתף</span>
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
    <div className="space-y-4">
      {loading && <LoadingSpinner />}
      {content.map(item => (
        <ContentCard key={item.id} item={item} />
      ))}
    </div>
  )
}

export default function Home() {
  return (
    <Layout>
      <div dir="rtl" className=" min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-4 text-gray-800 border-b-2 border-green-400 pb-2">הודעות ופוסטים</h1>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">תוכן</h2>
            <NewContentFeed />
          </div>
        </div>
      </div>
    </Layout>
  )
}

