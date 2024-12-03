import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, MessageSquare, Home, Bell, Search, User, HelpCircle, X } from 'lucide-react'
import { GetPallate, Pallate } from '../api/settings'
import { getUser, UserData } from '../api/db'

// Routes
const routes = [
  { name: 'דף הבית', path: '/home', icon: Home },
  { name: 'חברים', path: '/connections', icon: User },
  { name: 'הודעות', path: '/messages', icon: MessageSquare },
]

// Animations
const pageTransition = {
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
}

// UserProfile Component
function UserProfile({ palette, user }: { palette: Pallate, user: UserData }) {
  return (
    <div className="flex items-center space-x-4 space-x-reverse">
      <div className={`w-10 h-10 rounded-full overflow-hidden ring-2 ring-${palette.secondary}`} dangerouslySetInnerHTML={{ __html: user.icon }}>
      </div>
      <div>
        <p className={`text-sm font-semibold text-${palette.text}`}>{user.name}</p>
        <p className={`text-xs text-${palette.special}`}>{user.email}</p>
      </div>
    </div>
  )
}

// SearchBar Component
function SearchBar({ palette }: { palette: Pallate }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 rounded-lg overflow-hidden">
        <div className="absolute -left-1 -top-1 w-1/3 h-1/3 bg-gradient-to-br from-green-500 via-green-300 to-green-500" />
      </div>
      <input
        type="text"
        placeholder="חיפוש..."
        className={`
          w-full py-2 pr-10 pl-4 rounded-lg 
          bg-white
          border border-gray-200
          focus:outline-none focus:ring-2 focus:ring-${palette.secondary}
          relative z-10
          text-gray-800 placeholder-gray-400
        `}
      />
      <Search className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-${palette.special} z-20`} />
    </div>
  )
}

// NotificationBell Component
function NotificationBell({ palette, user }: { palette: Pallate, user: UserData }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="relative">
      <button 
        onClick={() => setIsModalOpen(!isModalOpen)}
        className={`relative p-2 rounded-full hover:bg-${palette.background} focus:outline-none focus:ring-2 focus:ring-${palette.secondary}`}
      >
        <Bell className={`h-6 w-6 text-${palette.text}`} />
        {user.messages.length > 0 && (
          <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full"></span>
        )}
      </button>
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 md:p-0`}
          >
            <div 
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setIsModalOpen(false)}
            ></div>
            <div className={`relative w-full max-w-md bg-white rounded-lg shadow-lg border border-${palette.secondary} z-50`}>
              <div className={`p-4 border-b border-${palette.secondary} flex justify-between items-center`}>
                <h3 className={`text-lg md:text-xl font-semibold text-${palette.text}`}>התראות</h3>
                <button onClick={() => setIsModalOpen(false)} className={`text-${palette.text} hover:text-${palette.primary}`}>
                  <X className="h-6 w-6" />
                </button>
              </div>
              <ul className="py-4">
                {user.messages.map((message, index) => (
                  <li key={index} className={`px-6 py-4 hover:bg-${palette.background}`}>
                    <p className={`text-base md:text-lg text-${palette.text}`}>{message.message}</p>
                    <p className={`text-sm md:text-base text-${palette.special} mt-2`}>
                      {message.date.toDate().toLocaleString('he-IL')}
                    </p>
                  </li>
                ))}
                {user.messages.length === 0 && (
                  <li className={`px-6 py-4 text-center text-${palette.text}`}>
                    אין הודעות חדשות
                  </li>
                )}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Sidebar Component
function Sidebar({ palette, user }: { palette: Pallate, user: UserData }) {
  const location = useLocation()

  return (
    <aside className={`hidden md:flex md:flex-col md:w-64 bg-white border-r border-${palette.secondary}`}>
      <div className="p-4">
        <img src="/logo.svg" alt="לוגו" className="h-8 w-auto" />
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        {routes.map((route) => {
          const Icon = route.icon
          const isActive = location.pathname === route.path
          return (
            <Link
              key={route.path}
              to={route.path}
              className={`flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                isActive
                  ? `text-${palette.primary} bg-${palette.background} border-b-2 border-${palette.secondary}`
                  : `text-${palette.text} hover:bg-${palette.background}`
              }`}
            >
              <Icon className="ml-2 h-5 w-5" />
              {route.name}
            </Link>
          )
        })}
      </nav>
      <div className={`p-4 border-t border-${palette.secondary}`}>
        <UserProfile user={user} palette={palette} />
      </div>
    </aside>
  )
}

// Header Component
function Header({ palette, user }: { palette: Pallate, user: UserData }) {
  return (
    <header className={`bg-white border-b border-${palette.secondary} px-4 py-2 flex items-center justify-between`}>
      <div className="flex items-center space-x-4 space-x-reverse">
        <button className={`md:hidden p-2 rounded-md hover:bg-${palette.background} focus:outline-none focus:ring-2 focus:ring-${palette.secondary}`}>
          <Menu className={`h-6 w-6 text-${palette.text}`} />
        </button>
        <img src="/logo.svg" alt="לוגו" className="h-8 w-auto md:hidden" />
      </div>
      <div className="flex items-center space-x-4 space-x-reverse">
        <NotificationBell palette={palette} user={user} />
        <button className={`p-2 rounded-full hover:bg-${palette.background} focus:outline-none focus:ring-2 focus:ring-${palette.secondary}`}>
          <HelpCircle className={`h-6 w-6 text-${palette.text}`} />
        </button>
      </div>
    </header>
  )
}

// MobileBottomNav Component
function MobileBottomNav({ palette }: { palette: Pallate }) {
  const location = useLocation()

  return (
    <nav className={`md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-${palette.secondary} flex justify-around items-center h-16`}>
      {routes.slice(0, 4).map((route) => {
        const Icon = route.icon
        const isActive = location.pathname === route.path
        return (
          <Link
            key={route.path}
            to={route.path}
            className={`flex flex-col items-center justify-center w-full h-full ${
              isActive ? `text-${palette.primary} border-t-2 border-${palette.secondary}` : `text-${palette.text}`
            }`}
          >
            <Icon className="h-6 w-6" />
            <span className="text-xs mt-1">{route.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}

// Main Content Component
function MainContent({ children, palette }: { children: React.ReactNode; palette: Pallate }) {
  return (
    <main className={`flex-1 overflow-y-auto bg-${palette.background} p-4 md:p-8`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial="out"
          animate="in"
          exit="out"
          variants={pageTransition}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </main>
  )
}

// Layout Component
export function Layout({ children }: { children: React.ReactNode }) {
  const [palette, setPalette] = useState<Pallate | null>(null)
  const [user, setUser] = useState<UserData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPalette() {
      const newPalette = await GetPallate()
      setPalette(newPalette)
      const userData = await getUser();
      if (!userData){navigate('/');return;}
      setUser(userData);
    }
    fetchPalette()
  }, [])

  if (!palette || !user) {
    return <div>טוען...</div>
  }

  return (
    <div className={`flex flex-col h-screen bg-${palette.background}`} dir="rtl">
      <Header palette={palette} user={user} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar palette={palette} user={user} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 md:hidden">
            <SearchBar palette={palette} />
          </div>
          <MainContent palette={palette}>{children}</MainContent>
        </div>
      </div>
      <MobileBottomNav palette={palette} />
    </div>
  )
}

export default Layout;

