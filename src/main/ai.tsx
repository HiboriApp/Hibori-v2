import Layout from "../components/layout";
import { useState, useEffect } from 'react'
import { MessageCircle, UserPlus } from 'lucide-react'
import Predict from "../api/ai";
import { findNonFriends, getUser, getUserById, openChatName, UserData } from "../api/db";
import { Avatar } from "../api/icons";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [animationKey, setAnimationKey] = useState(0)
  const [found, setFound] = useState<UserData | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationKey(prev => prev + 1)
    }, 4000) // Restart animation every 4 seconds

    return () => clearInterval(interval)
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)
    const user = await getUser();
    if (!user){navigate('/');return;}
    setUser(user);
    const others = (await findNonFriends(user, 20)).filter((u) => u.id !== user.id);
    const result = await Predict(user, others, searchQuery);
    console.log(result);
    if (result == "null"){
      setShowResult(true)
      setIsSearching(false)
      return;
    }
    const found = await getUserById(result.trim());
    if (!found){
      setShowResult(true)
      setIsSearching(false)
      return;
    }
    setFound(found);
    setShowResult(true)
    setIsSearching(false)
  }

  return (
    <Layout>
    <div className="h-[92vh] bg-gray-50 relative overflow-hidden" dir="rtl">
      {/* Light-like SVG effect */}
      <div className="absolute top-0 left-0 w-1/2 h-1/2 opacity-10">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="lightGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#10B981" stopOpacity="0"/>
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="100" fill="url(#lightGradient)" />
        </svg>
      </div>

      <main className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <h1 className="text-5xl font-bold text-gray-800 mb-12 text-center">
          חיפוש חברים באמצעות{' '}
          <span key={animationKey} className="inline-block animate-gradient-text">
            AI
          </span>
        </h1>
        
        <form onSubmit={handleSearch} className="w-full max-w-3xl relative mb-12">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-green-300 via-green-400 to-green-500 rounded-lg" style={{ padding: '2px' }}>
              <div className="absolute inset-0 bg-white rounded-lg"></div>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חפש חבר..."
              className="w-full py-4 px-6 text-xl text-right bg-transparent rounded-lg focus:outline-none relative z-10"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-green-500 text-white px-6 py-2 rounded-lg text-lg font-semibold hover:bg-green-600 transition-colors duration-300 disabled:bg-green-400 disabled:cursor-not-allowed z-20"
            >
              {isSearching ? 'מחפש...' : 'חפש'}
            </button>
          </div>
        </form>
        
        {!showResult && !isSearching && (
          <p className="mt-8 text-xl text-gray-600 text-center max-w-2xl">
            הזן שם או תיאור של החבר שאתה מחפש, ו-AI שלנו יעזור למצוא התאמה מושלמת!
          </p>
        )}

        {showResult && found && user && (
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">מצאנו חבר מושלם עבורך!</h2>
            <div className="flex items-center space-x-6 space-x-reverse">
              <Avatar
              className="w-24 h-24 rounded-full object-cover shadow-md"
              icon={found.icon}
              ></Avatar>
              <div className="flex-grow">
                <h3 className="text-base font-semibold text-gray-800">{found.name}</h3>
              </div>
              <div className="flex flex-col space-y-2">
                <button className=" text-black p-2 rounded-full hover:bg-blue-600 transition-colors duration-300"
                onClick={() => navigate("/messages/" + openChatName(user.id, found.id))}>
                  <MessageCircle size={24} />
                </button>
                <button className=" text-black p-2 rounded-full hover:bg-green-600 transition-colors duration-300">
                  <UserPlus size={24} />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
    </Layout>
  )
}

