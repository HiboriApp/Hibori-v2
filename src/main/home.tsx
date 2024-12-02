import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { DefaultPallate, GetPallate, Pallate } from '../api/settings'
import { Layout } from './layout'

type Message = {
  id: string
  content: string
  target: string
  timestamp: string
}

type Post = {
  id: string
  content: string
  target: string
  timestamp: string
  image?: string
}

// Simulated data
const simulatedNewMessages: Message[] = [
  { id: 'm1', content: 'שלום!', target: 'אליס', timestamp: new Date().toISOString() },
  { id: 'm2', content: 'מה שלומך?', target: 'בוב', timestamp: new Date().toISOString() },
]

const simulatedNewPosts: Post[] = [
  { id: 'p1', content: 'תראו את התמונה המגניבה הזו!', target: 'צ׳רלי', timestamp: new Date().toISOString(), image: 'https://picsum.photos/200/300' },
  { id: 'p2', content: 'סתם פוסט טקסט', target: 'דוד', timestamp: new Date().toISOString() },
]

const simulatedMessages: Message[] = [
  { id: 'm3', content: 'היי שם!', target: 'חוה', timestamp: '2023-05-01T10:00:00Z' },
  { id: 'm4', content: 'מה קורה?', target: 'פרנק', timestamp: '2023-05-01T09:30:00Z' },
]

const simulatedPosts: Post[] = [
  { id: 'p3', content: 'יום יפה!', target: 'גרייס', timestamp: '2023-05-01T11:00:00Z', image: 'https://picsum.photos/200/300?random=1' },
  { id: 'p4', content: 'סיימתי עכשיו ספר מעולה', target: 'הנרי', timestamp: '2023-05-01T08:45:00Z' },
]

function LoadingSpinner({pallate}: {pallate: Pallate}) {
  return (
    <div className="flex justify-center items-center h-24">
      <Loader2 className={`h-8 w-8 animate-spin text-${pallate.text}`} />
    </div>
  )
}

function NewContentFeed({pl}: {pl: Pallate}) {
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    const fetchNewContent = () => {
      setLoading(true)
      setTimeout(() => {
        setMessages(prevMessages => [...simulatedNewMessages, ...prevMessages])
        setPosts(prevPosts => [...simulatedNewPosts, ...prevPosts])
        setLoading(false)
      }, 1500)
    }

    fetchNewContent()
    const interval = setInterval(fetchNewContent, 60000)

    return () => clearInterval(interval)
  }, [])

  if (loading && messages.length === 0 && posts.length === 0) {
    return <LoadingSpinner pallate={pl} />
  }

  return (
    <div className="space-y-4">
      {loading && <LoadingSpinner pallate={pl} />}
      {messages.map(message => (
        <div key={message.id} className={`p-4 bg-${pl.secondary} text-${pl.text} shadow rounded-lg`}>
          <p className="font-semibold">{message.target}</p>
          <p>{message.content}</p>
          <p className={`text-sm text-${pl.background}`}>{message.timestamp}</p>
        </div>
      ))}
      {posts.map(post => (
        <div key={post.id} className={`p-4 bg-${pl.secondary} text-${pl.text} shadow rounded-lg`}>
          <p className="font-semibold">{post.target}</p>
          <p>{post.content}</p>
          {post.image && (
            <img src={post.image} alt="תמונת פוסט" className="mt-2 rounded-lg max-w-full h-auto" />
          )}
          <p className={`text-sm text-${pl.background}`}>{post.timestamp}</p>
        </div>
      ))}
    </div>
  )
}

export default function Home() {
  const { messages, posts } = { messages: simulatedMessages, posts: simulatedPosts }
  const [pl, setPalette] = useState<Pallate>(DefaultPallate());

  useEffect(() => {GetPallate().then((pl) => setPalette(pl))}, []);

  return (
    <Layout children={<div dir="rtl" className={`container mx-auto px-4 py-8 bg-${pl.background} text-${pl.text}`}>
      <h1 className={`text-3xl font-bold mb-6 text-${pl.primary}`}>הודעות ופוסטים</h1>
      <div className="mb-8">
        <h2 className={`text-2xl font-semibold mb-4 text-${pl.tertiary}`}>תוכן חדש</h2>
        <NewContentFeed pl={pl}/>
      </div>
      <div>
        <h2 className={`text-2xl font-semibold mb-4 text-${pl.tertiary}`}>כל התוכן</h2>
        <div className="space-y-4">
          {[...messages, ...posts]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .map(item => (
              <div key={item.id} className={`p-4 bg-${pl.secondary} shadow rounded-lg`}>
                <p className="font-semibold">{item.target}</p>
                <p>{item.content}</p>
                {('image' in item && item.image) ? (
                    //@ts-expect-error item.image could be undefined
                  <img src={item.image} alt="תמונת פוסט" className="mt-2 rounded-lg max-w-full h-auto" />
                ) : null}
                <p className={`text-sm text-${pl.background}`}>{item.timestamp}</p>
              </div>
            ))}
        </div>
      </div>
    </div>}></Layout>
  )
}

