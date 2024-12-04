import React, { useState, useEffect } from 'react';
import {
  Loader2,
  Heart,
  Share2,
  ArrowRight,
  Bell,
  MessageSquare,
  User,
  Send,
  Users,
  Image as ImageIcon,
  Video,
  X,
  Plus,
} from 'lucide-react';
import { Layout } from '../components/layout';
import { getUsersById, getUser, UserData, Message, Notification } from '../api/db';
import { useNavigate } from 'react-router-dom';
import { userListener } from '../api/listeners';
import SuperSillyLoading from '../components/Loading';
import { Avatar } from '../api/icons';

// הגדרת סוגים
type ContentItem = {
  id: string;
  content: string;
  target: string;
  timestamp: string;
  image?: string;
  likes: number;
};

// קומפוננטת טוען
function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-24">
      <Loader2 className="h-8 w-8 animate-spin text-green-500" />
    </div>
  );
}

// קומפוננטת כרטיס תוכן
const ContentCard: React.FC<{ item: ContentItem }> = ({ item }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(item.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes((prevLikes) => (isLiked ? prevLikes - 1 : prevLikes + 1));
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `פוסט מאת ${item.target}`,
          text: item.content,
          url: window.location.href,
        })
        .then(() => {
          console.log('Successfully shared');
        })
        .catch((error) => {
          console.log('Error sharing:', error);
        });
    } else {
      alert('שיתוף לא נתמך בדפדפן זה');
    }
  };

  const handleForward = () => {
    console.log('Forward button clicked');
  };

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xl ml-4">
            {item.target[0]}
          </div>
          <div>
            <p className="font-semibold text-lg text-gray-800">{item.target}</p>
            <p className="text-sm text-gray-500">
              {new Date(item.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
        <p className="text-base text-gray-700 mb-4">{item.content}</p>
        {item.image && (
          <img
            src={item.image}
            alt="תמונת פוסט"
            className="rounded-xl w-full object-cover max-h-96 mb-4"
          />
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
            className={`flex items-center transition-colors duration-200 ${
              isLiked ? 'text-green-500' : 'hover:text-green-500'
            }`}
            onClick={handleLike}
          >
            <Heart
              size={24}
              fill={isLiked ? 'currentColor' : 'none'}
              className="ml-2"
            />
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
  );
};

// תוכן מדומה
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
];

// קומפוננטת תוכן חדש
function NewContentFeed({
  content,
}: {
  content: ContentItem[];
}) {
  if (content.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {content.map((item) => (
        <ContentCard key={item.id} item={item} />
      ))}
    </div>
  );
}

function LeftPanel({
  friends,
  messages,
  user
}: {
  friends: UserData[];
  messages: (Message & UserData)[];
  user: UserData;
}) {
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
                <div
                  className="h-12 w-12 rounded"
                  dangerouslySetInnerHTML={{ __html: friend.icon }}
                ></div>
                <div
                  className={`absolute bottom-0 left-0 w-3 h-3 rounded-full border-2 border-white ${
                    friend.isOnline ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                ></div>
              </div>
              <span className="mt-1 text-xs text-gray-700 text-center">
                {friend.name}
              </span>
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
                <div
                  className="w-10 h-10 rounded-full ml-3"
                  dangerouslySetInnerHTML={{ __html: message.icon }}
                />
                <div>
                  <p className="font-medium text-sm">{message.name}</p>
                  <p className="text-md text-gray-600 truncate">
                    {message.content.length > 20
                      ? message.content.substring(0, 20) + '...'
                      : message.content}
                  </p>
                  <span className="text-xs text-gray-400">
                    {message.date.toDate().toLocaleString()}
                  </span>
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
          {user.notifications.map((notification, i) => (
            <li
              key={notification.timestamp.toDate().getTime() + i}
              className="flex items-center bg-gray-50 rounded-lg p-3"
            >
              <Avatar icon={notification.icon} className='"w-10 h-10 rounded-full ml-3"'></Avatar>
              <div className="flex-grow">
                <p className="text-sm text-gray-700">
                  {notification.content}
                </p>
                <span className="text-xs text-gray-500">
                  {notification.timestamp.toDate().toLocaleString()}
                </span>
              </div>
              <div className="ml-3">
                {notification.type === 'like' && (
                  <Heart className="text-red-500" size={20} />
                )}
                {notification.type === 'comment' && (
                  <MessageSquare className="text-blue-500" size={20} />
                )}
                {notification.type === 'message' && (
                  <User className="text-green-500" size={20} />
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

// קומפוננטת יצירת פוסט
const CreatePost = ({
  onPostSubmit,
}: {
  onPostSubmit: (newPost: { content: string; image: string | null }) => void;
}) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() === '' && !image) return;

    onPostSubmit({ content, image });
    setContent('');
    setImage(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 mb-6">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start mb-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xl ml-4">
            <User size={24} />
          </div>
          <textarea
            className="flex-grow border border-gray-300 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="מה תרצה לשתף?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          ></textarea>
        </div>
        {image && (
          <div className="relative mb-4">
            <img
              src={image}
              alt="Preview"
              className="rounded-xl max-h-64 w-full object-cover"
            />
            <button
              type="button"
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
              onClick={() => setImage(null)}
            >
              <X/>
            </button>
          </div>
        )}
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <label className="cursor-pointer text-gray-500 hover:text-green-500 transition-colors duration-200 ml-4">
              <input type="file" className="hidden" onChange={handleImageUpload} />
              <ImageIcon size={24} />
            </label>
            <label className="cursor-pointer text-gray-500 hover:text-green-500 transition-colors duration-200">
              <input type="file" accept="video/*" className="hidden" />
              <Video size={24} />
            </label>
          </div>
          <button
            type="submit"
            className="bg-green-500 flex text-white px-4 py-2 rounded-xl hover:bg-green-600 transition-colors duration-200"
          >
            <Plus className='ml-1S'/>
            פרסם
          </button>
        </div>
      </form>
    </div>
  );
};

// קומפוננטת אפליקציה ראשית
function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [friends, setFriends] = useState<UserData[]>([]);
  const [messages, _setMessages] = useState<(Message & UserData)[]>([]);
  const [content, setContent] = useState<ContentItem[]>([...simulatedContent]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const userData = await getUser();
      if (!userData) {
        navigate('/');
        return;
      }
      setUser(userData);
      const friendsData = await getUsersById(userData.friends);
      setFriends(friendsData);
      
      
    };
    fetchData();

    const unsubscribe = userListener(async (user) => {
      setUser(user);
      const friendsData = await getUsersById(user.friends);
      setFriends(friendsData);
    });
    return unsubscribe;
  }, [navigate]);

  const handlePostSubmit = (newPost: {
    content: string;
    image: string | null;
  }) => {
    setContent((prevContent) => [
      {
        id: `p${prevContent.length + 1}`,
        content: newPost.content,
        target: user ? user.name : 'אנונימי',
        timestamp: new Date().toISOString(),
        image: newPost.image || undefined,
        likes: 0,
      },
      ...prevContent,
    ]);
  };
  if (!user) return <SuperSillyLoading></SuperSillyLoading>;
  return (
    <Layout>
      <div className="min-h-screen">
        <div className="flex justify-center">
          <div
            className="w-full max-w-7xl grid grid-cols-12 gap-4"
            style={{ direction: 'rtl' }}
          >
            {/* תוכן ראשי */}
            <div className="col-span-12 lg:col-span-8 px-4 py-8" dir="rtl">
              <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b-2 border-green-400 pb-2">
                  הודעות ופוסטים
                </h1>
                <div className="mb-8">
                  <CreatePost onPostSubmit={handlePostSubmit} />
                  <NewContentFeed content={content} />
                </div>
              </div>
            </div>
            {/* פאנל שמאלי */}
            <div className="hidden lg:block col-span-4">
              <div className="sticky top-6">
                <div className="space-y-6" dir="rtl">
                  <LeftPanel user={user} friends={friends} messages={messages} />
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
