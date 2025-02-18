import type React from "react"
import { useEffect, useState } from "react"
import { ArrowLeft, Search, UserPlus } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import SuperSillyLoading from "../components/Loading"
import { addFriend, findNonFriends, getUser, type UserData } from "../api/db"
import Layout from "../components/layout"
import { Avatar } from "../api/icons"
import { DefaultPallate, GetPallate, type Pallate } from "../api/settings"

const UserCard: React.FC<{
  otherUser: UserData
  user: UserData
  onAddFriend: (id: string) => void
  pallate: Pallate
}> = ({ otherUser, onAddFriend, user, pallate }) => {
  const mutualFriends = user.friends.filter((f) => otherUser.friends.includes(f)).length
  return (
    <div
      className="rounded-lg shadow-md p-4 flex items-center justify-between"
      style={{ backgroundColor: pallate.main, color: pallate.text }}
    >
      <div className="flex items-center space-x-4 gap-4">
        <Avatar icon={otherUser.icon} className="w-12 h-12 rounded-full object-cover" />
        <div className="mr-4">
          <h3 className="font-semibold text-lg">{otherUser.name}</h3>
          <p className="text-xs" style={{ color: pallate.text }}>
            {mutualFriends} חברים משותפים
          </p>
        </div>
      </div>
      <button
        onClick={() => onAddFriend(otherUser.id)}
        className="p-2 rounded-full"
        style={{ color: pallate.primary, backgroundColor: `${pallate.primary}20` }}
      >
        <UserPlus size={20} />
      </button>
    </div>
  )
}

const AddFriendsPage: React.FC = () => {
  const [users, setUsers] = useState<UserData[] | undefined>()
  const [user, setUser] = useState<UserData | undefined>()
  const [pallate, setPallate] = useState<Pallate>(DefaultPallate())
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState("")
  useEffect(() => {
    const fetchUsers = async () => {
      const userData = await getUser()
      if (!userData) {
        navigate("/")
        return
      }
      setPallate(GetPallate(userData))
      setUser(userData)
      const users = await findNonFriends(userData, 20)
      setUsers(users.filter((u) => u.id !== userData.id))
    }
    fetchUsers()
  }, [navigate]) // Added navigate to the dependency array

  const handleAddFriend = (id: string) => {
    if (!user) {
      return
    }
    setUser({ ...user, friends: [...user.friends.filter((f) => f !== id), id] })
    addFriend(user, id)
  }
  if (!users || !user) return <SuperSillyLoading></SuperSillyLoading>
  const filteredUsers = users
    .filter((user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort(
      (a, b) =>
        b.friends.filter((f) => a.friends.includes(f)).length - a.friends.filter((f) => b.friends.includes(f)).length,
    )

  return (
    <Layout>
      <div
        className="min-h-screen p-8 rtl"
        dir="rtl"
        style={{ backgroundColor: pallate.background, color: pallate.text }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">הוסף חברים</h1>
            <button
              className="group relative overflow-hidden rounded-full shadow-md transition-all duration-300 hover:shadow-lg"
              style={{ backgroundColor: pallate.primary }}
            >
              <Link
                to="/connections"
                className="relative z-10 flex items-center space-x-2 px-6 py-3 text-white transition-colors duration-300 group-hover:text-white"
              >
                <ArrowLeft size={20} className="ml-2" />
                <span className="font-bold">חזרה</span>
              </Link>
              <div className="absolute inset-0 z-0 opacity-80 transition-opacity duration-300 group-hover:opacity-100"></div>
            </button>
          </div>

          <div className="mb-6 relative">
            <input
              type="text"
              placeholder="חפש משתמשים..."
              className="w-full p-3 pr-10 rounded-full border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: pallate.main,
                color: pallate.text,
                borderColor: pallate.secondary,
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-3" style={{ color: pallate.secondary }} size={20} />
          </div>

          <div className="space-y-4">
            {filteredUsers.map((otherUser) => (
              <UserCard
                key={otherUser.id}
                otherUser={otherUser}
                user={user}
                onAddFriend={handleAddFriend}
                pallate={pallate}
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default AddFriendsPage

