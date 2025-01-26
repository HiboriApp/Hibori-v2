import type React from "react"
import { useEffect, useState } from "react"
import { Search, MessageSquare, UserMinus } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Layout } from "../components/layout"
import { getUser, getUsersById, openChatName, removeFriend, type UserData } from "../api/db"
import SuperSillyLoading from "../components/Loading"
import { Avatar } from "../api/icons"

const FriendCard: React.FC<{
  friend: UserData
  user: UserData
  onMessage: (person: UserData) => void
  onRemove: (id: string) => void
}> = ({ friend, onMessage, user, onRemove }) => {
  const mutualFriends = user.friends.filter((f) => friend.friends.includes(f)).length
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4 gap-3">
        <Avatar icon={friend.icon} className="w-12 h-12 rounded-full object-cover" />
        <div className="ml-4">
          <h3 className="font-semibold text-lg text-gray-800">{friend.name}</h3>
          <p className="text-sm text-gray-500">{friend.lastOnline.toDate() > new Date() ? "מחובר" : "לא מחובר"}</p>
          <p className="text-xs text-gray-400">{mutualFriends} חברים משותפים</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button onClick={() => onMessage(friend)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full">
          <MessageSquare size={20} />
        </button>
        <button onClick={() => onRemove(friend.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full">
          <UserMinus size={20} />
        </button>
      </div>
    </div>
  )
}

const ConfirmationPopup: React.FC<{
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  friendName: string
}> = ({ isOpen, onClose, onConfirm, friendName }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <h2 className="text-xl font-bold mb-4 text-gray-800">הסרת חבר</h2>
        <p className="mb-6 text-gray-800">האם אתה בטוח שברצונך להסיר את {friendName} מרשימת החברים שלך?</p>
        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
            ביטול
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            הסר
          </button>
        </div>
      </div>
    </div>
  )
}

// Main Component
const FriendsPage: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null)
  const [friends, setFriends] = useState<UserData[]>()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      const userData = await getUser()
      if (!userData) {
        navigate("/") // Redirect to login page
        return
      }
      setUser(userData)
      setFriends(await getUsersById(userData.friends))
    }
    fetchData()
  }, [navigate])

  const [searchTerm, setSearchTerm] = useState("")
  const [confirmRemove, setConfirmRemove] = useState<{
    isOpen: boolean
    friendId: string | null
    friendName: string
  }>({
    isOpen: false,
    friendId: null,
    friendName: "",
  })

  const handleMessage = (person: UserData) => {
    if (!user) {
      return
    }
    navigate("/messages/" + openChatName(user.id, person.id))
  }

  if (!user || !friends) {
    return <SuperSillyLoading />
  }

  const handleRemoveFriend = (id: string) => {
    const friendToRemove = friends.find((friend) => friend.id === id)
    if (friendToRemove) {
      setConfirmRemove({
        isOpen: true,
        friendId: id,
        friendName: friendToRemove.name,
      })
    }
  }

  const confirmRemoveFriend = () => {
    if (confirmRemove.friendId !== null) {
      setFriends(friends.filter((friend) => friend.id !== confirmRemove.friendId))
      removeFriend(user, confirmRemove.friendId)
    }
    setConfirmRemove({ isOpen: false, friendId: null, friendName: "" })
  }

  const filteredFriends = friends.filter((friend) => friend.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <Layout>
      <div className="min-h-screen mb-14 md:mb-0 p-8 rtl bg-gray-100" dir="rtl">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">החברים שלי</h1>
            <button className="group relative overflow-hidden rounded-full bg-gradient-to-r from-green-500 to-green-600 shadow-md transition-all duration-300 hover:shadow-lg">
              <Link
                to="/addfriends"
                className="relative z-10 flex items-center space-x-2 px-6 py-3 text-white transition-colors duration-300 group-hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform duration-300 group-hover:scale-110 ml-2"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
                <span className="font-bold text-sm">הוסף חברים</span>
              </Link>
              <div className="absolute inset-0 z-0  opacity-80 transition-opacity duration-300 group-hover:opacity-100"></div>
            </button>
          </div>

          <div className="mb-6 relative">
            <input
              type="text"
              placeholder="חפש חברים..."
              className="w-full p-3 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          </div>

          <div className="space-y-4">
            {filteredFriends.map((friend) => (
              <FriendCard
                key={friend.id}
                friend={friend}
                user={user}
                onMessage={handleMessage}
                onRemove={handleRemoveFriend}
              />
            ))}
          </div>
        </div>

        <ConfirmationPopup
          isOpen={confirmRemove.isOpen}
          onClose={() => setConfirmRemove({ isOpen: false, friendId: null, friendName: "" })}
          onConfirm={confirmRemoveFriend}
          friendName={confirmRemove.friendName}
        />
      </div>
    </Layout>
  )
}

export default FriendsPage

