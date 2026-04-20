import type React from "react"
import { useEffect, useState } from "react"
import { Search, MessageSquare, UserMinus, UserPlus } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Layout } from "../components/layout"
import { addFriend, findNonFriends, getUser, getUsersById, openChatName, removeFriend, type UserData } from "../api/db"
import SuperSillyLoading from "../components/Loading"
import { Avatar } from "../api/icons"
import { DefaultPallate, GetPallate, type Pallate } from "../api/settings"

const FriendCard: React.FC<{
  friend: UserData
  user: UserData
  onMessage: (person: UserData) => void
  onRemove: (id: string) => void
  pallate: Pallate
}> = ({ friend, onMessage, user, onRemove, pallate }) => {
  const mutualFriends = user.friends.filter((f) => friend.friends.includes(f)).length
  return (
    <div
      className="rounded-lg shadow-md p-4 flex items-center justify-between"
      style={{ backgroundColor: pallate.main }}
    >
      <div className="flex items-center space-x-4 gap-3">
        <Avatar userID={friend.id} icon={friend.icon} className="w-12 h-12 rounded-full object-cover" />
        <div className="ml-4">
          <h3 className="font-semibold text-lg" style={{ color: pallate.text }}>
            {friend.name}
          </h3>
          <p className="text-sm" style={{ color: pallate.text }}>
            {friend.lastOnline.toDate() > new Date() ? "מחובר" : "לא מחובר"}
          </p>
          <p className="text-xs" style={{ color: pallate.text }}>
            {mutualFriends} חברים משותפים
          </p>
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
  pallate: Pallate
  friendName: string
}> = ({ isOpen, onClose, onConfirm, friendName, pallate }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="rounded-lg p-6 max-w-sm w-full mx-4"
        style={{ backgroundColor: pallate.main, color: pallate.text }}
      >
        <h2 className="text-xl font-bold mb-4 text-gray-800">הסרת חבר</h2>
        <p className="mb-6 text-gray-800">האם אתה בטוח שברצונך להסיר את {friendName} מרשימת החברים שלך?</p>
        <div className="flex justify-center space-x-4 ">
        <button onClick={onConfirm} className="px-4 py-2 bg-red-600 ml-3 mr-3 text-white rounded hover:bg-red-700">
            הסר
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
            ביטול
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
  const [suggestedFriends, setSuggestedFriends] = useState<UserData[]>([])
  const [pallate, setPallate] = useState<Pallate>(DefaultPallate())
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      const userData = await getUser()
      if (!userData) {
        navigate("/") // Redirect to login page
        return
      }
      setUser(userData)
      setPallate(GetPallate(userData))
      setFriends(await getUsersById(userData.friends))
      const suggestions = (await findNonFriends(userData, 8)).filter((person) => person.id !== userData.id)
      setSuggestedFriends(suggestions)
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

  const handleAddSuggestedFriend = async (id: string) => {
    if (!user) return

    await addFriend(user, id)
    const updatedUser = await getUser()
    if (!updatedUser) return

    setUser(updatedUser)
    setFriends(await getUsersById(updatedUser.friends))
    setSuggestedFriends((current) => current.filter((person) => person.id !== id))
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
      <div
        className="min-h-screen mb-14 md:mb-0 p-8 rtl connections-page"
        dir="rtl"
        style={{ 
          color: pallate.text, 
          backgroundColor: pallate.background,
          backgroundImage: `radial-gradient(circle at top right, ${pallate.primary}20 0%, transparent 50%)`
        }}
      >
        <div className="max-w-3xl mx-auto">
        <div className="mb-6 relative">
            <input
              type="text"
              placeholder="חפש חברים..."
              className="w-full p-3 pr-10 rounded-full border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: pallate.main,
                color: pallate.text,
                borderColor: pallate.secondary,
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          </div>

          {friends.length === 0 && (
            <section className="mb-8 rounded-[28px] border p-4 sm:p-5" style={{ backgroundColor: pallate.main, borderColor: `${pallate.primary}22` }}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold" style={{ color: pallate.text }}>חברים מומלצים</h2>
                <Link to="/addfriends" className="text-xs font-semibold opacity-80 hover:opacity-100" style={{ color: pallate.primary }}>
                  עוד הצעות
                </Link>
              </div>

              {suggestedFriends.length === 0 ? (
                <div className="rounded-2xl border border-dashed px-4 py-8 text-center text-sm opacity-75" style={{ borderColor: `${pallate.primary}22` }}>
                  אין כרגע הצעות חדשות
                </div>
              ) : (
                <div className="space-y-3">
                  {suggestedFriends.slice(0, 5).map((person) => (
                    <div
                      key={person.id}
                      className="flex items-center justify-between rounded-2xl border px-3 py-3"
                      style={{ backgroundColor: pallate.background, borderColor: `${pallate.primary}18` }}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar userID={person.id} icon={person.icon} className="h-11 w-11 rounded-full object-cover" />
                        <div>
                          <p className="text-sm font-semibold" style={{ color: pallate.text }}>{person.name}</p>
                          <p className="text-xs opacity-70" style={{ color: pallate.text }}>
                            {person.bio?.trim() ? person.bio.slice(0, 42) : "ללא תיאור"}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddSuggestedFriend(person.id)}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                        style={{ backgroundColor: pallate.primary }}
                      >
                        <UserPlus size={14} />
                        הוסף
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {friends.length > 0 && (
          <div className="flex justify-center items-center mb-8">
            <button
              className="group  relative overflow-hidden rounded-full shadow-md transition-all duration-300 hover:shadow-lg"
              style={{ backgroundColor: pallate.primary }}
            >
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
          )}

        
          {filteredFriends.length === 0 && friends.length > 0 ? (
            <div className="rounded-[28px] border border-dashed px-6 py-12 text-center" style={{ backgroundColor: pallate.background, borderColor: `${pallate.primary}25` }}>
              <Search className="mx-auto h-12 w-12" style={{ color: pallate.primary }} />
              <p className="mt-4 text-base font-medium">לא נמצאו תוצאות חיפוש</p>
              <p className="mt-1 text-sm opacity-70">נסה לחפש עם טקסט אחר</p>
            </div>
          ) : (
          <div className="space-y-4">
            {filteredFriends.map((friend) => (
              <FriendCard
                key={friend.id}
                friend={friend}
                user={user}
                onMessage={handleMessage}
                onRemove={handleRemoveFriend}
                pallate={pallate}
              />
            ))}
          </div>
          )}
        </div>

        <ConfirmationPopup
          isOpen={confirmRemove.isOpen}
          onClose={() => setConfirmRemove({ isOpen: false, friendId: null, friendName: "" })}
          onConfirm={confirmRemoveFriend}
          friendName={confirmRemove.friendName}
          pallate={pallate}
        />
      </div>
    </Layout>
  )
}

export default FriendsPage

