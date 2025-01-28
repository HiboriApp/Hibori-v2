import Layout from "../components/layout"
import { useEffect, useState } from "react"
import { MessageCircle, UserPlus } from "lucide-react"
import Predict from "../api/ai"
import { findNonFriends, getUser, getUserById, openChatName, type UserData } from "../api/db"
import { Avatar } from "../api/icons"
import { useNavigate } from "react-router-dom"
import { DefaultPallate, GetPallate, type Pallate } from "../api/settings"
import Loading from "../components/Loading"

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showResult, setShowResult] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [found, setFound] = useState<UserData | null>(null)
  const [user, setUser] = useState<UserData | null>(null)
  const [pallate, setPallate] = useState<Pallate>(DefaultPallate())
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      const user = await getUser()
      if (!user) {
        navigate("/")
        return
      }
      setUser(user)
      setPallate(GetPallate(user)) 
    }
    fetchData();
  }, []);
  
  if (!user){return <Loading></Loading>}
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)
    const others = (await findNonFriends(user, 20)).filter((u) => u.id !== user.id)
    const result = await Predict(user, others, searchQuery)
    if (result == "null") {
      setShowResult(true)
      setIsSearching(false)
      return
    }
    const found = await getUserById(result.trim())
    if (!found) {
      setShowResult(true)
      setIsSearching(false)
      return
    }
    setFound(found)
    setShowResult(true)
    setIsSearching(false)
  }
  return (
    <Layout>
      <div className="h-[92vh] relative overflow-hidden" dir="rtl" style={{ backgroundColor: pallate.background }}>

        <main className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
          <h1 className="text-5xl font-bold mb-12 text-center" style={{ color: pallate.text }}>
            חיפוש חברים באמצעות{" "}
            <span style={{ color: pallate.secondary }}>
              AI
            </span>
          </h1>

          <form onSubmit={handleSearch} className="w-full max-w-3xl relative mb-12">
            <div className="relative">
              <div
                className="absolute inset-0 bg-gradient-to-tr rounded-lg"
                style={{
                  background: `linear-gradient(to right, ${pallate.primary}, ${pallate.secondary})`,
                  padding: "2px",
                }}
              >
                <div className="absolute inset-0 rounded-lg" style={{ backgroundColor: pallate.background }}></div>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="חפש חבר..."
                className="w-full py-4 px-6 text-xl text-right bg-transparent rounded-lg focus:outline-none relative z-10"
                style={{ color: pallate.text, backgroundColor: pallate.background }}
              />
              <button
                type="submit"
                disabled={isSearching}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 px-6 py-2 rounded-lg text-lg font-semibold transition-colors duration-300 disabled:cursor-not-allowed z-20"
                style={{
                  backgroundColor: isSearching ? pallate.secondary : pallate.primary,
                  color: pallate.background,
                }}
              >
                {isSearching ? "מחפש..." : "חפש"}
              </button>
            </div>
          </form>

          {!showResult && !isSearching && (
            <p className="mt-8 text-xl text-center max-w-2xl" style={{ color: pallate.text }}>
              הזן שם או תיאור של החבר שאתה מחפש, ו-AI שלנו יעזור למצוא התאמה מושלמת!
            </p>
          )}

          {showResult && found && user && (
            <div
              className="w-full max-w-3xl rounded-xl shadow-lg p-6 animate-fade-in-up"
              style={{ backgroundColor: pallate.main }}
            >
              <h2 className="text-2xl font-bold mb-6" style={{ color: pallate.text }}>
                מצאנו חבר מושלם עבורך!
              </h2>
              <div className="flex items-center space-x-6 space-x-reverse">
                <Avatar className="w-24 h-24 rounded-full object-cover shadow-md" icon={found.icon}></Avatar>
                <div className="flex-grow">
                  <h3 className="text-base font-semibold" style={{ color: pallate.text }}>
                    {found.name}
                  </h3>
                </div>
                <div className="flex flex-col space-y-2">
                  <button
                    className="p-2 rounded-full transition-colors duration-300"
                    onClick={() => navigate("/messages/" + openChatName(user.id, found.id))}
                    style={{ color: pallate.primary, backgroundColor: `${pallate.primary}20` }}
                  >
                    <MessageCircle size={24} />
                  </button>
                  <button
                    className="p-2 rounded-full transition-colors duration-300"
                    style={{ color: pallate.secondary, backgroundColor: `${pallate.secondary}20` }}
                  >
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

