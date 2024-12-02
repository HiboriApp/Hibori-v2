import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, MessageSquare, Home, Bell, Search, User, HelpCircle, Plus } from 'lucide-react'
import { GetPallate, Pallate } from '../api/settings'
import { getUser, UserData } from '../api/db'
import { signOut } from 'firebase/auth'
import { auth } from '../api/firebase'

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
      <input
        type="text"
        placeholder="חיפוש..."
        className={`w-full py-2 pr-10 pl-4 rounded-lg bg-${palette.background} focus:outline-none focus:ring-2 focus:ring-${palette.secondary}`}
      />
      <Search className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-${palette.special}`} />
    </div>
  )
}

// NotificationBell Component
function NotificationBell({ palette }: { palette: Pallate }) {
  return (
    <button className={`relative p-2 rounded-full hover:bg-${palette.background} focus:outline-none focus:ring-2 focus:ring-${palette.secondary}`}>
      <Bell className={`h-6 w-6 text-${palette.text}`} />
      <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full"></span>
    </button>
  )
}

// Sidebar Component
function Sidebar({ palette, user }: { palette: Pallate, user: UserData }) {
  const location = useLocation()

  return (
    <aside className={`hidden md:flex md:flex-col md:w-64 bg-white border-r border-${palette.secondary}`}>
      <div className="p-4">
        <img src="/logo.svg" alt="Logo" className="h-8 w-auto" />
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
              <Icon className="mr-3 h-5 w-5" />
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
function Header({ palette }: { palette: Pallate }) {
  return (
    <header className={`bg-white border-b border-${palette.secondary} px-4 py-2 flex items-center justify-between`}>
      <div className="flex items-center space-x-4 space-x-reverse">
        <button className={`md:hidden p-2 rounded-md hover:bg-${palette.background} focus:outline-none focus:ring-2 focus:ring-${palette.secondary}`}>
          <Menu className={`h-6 w-6 text-${palette.text}`} />
        </button>
        <img src="/logo.svg" alt="Logo" className="h-8 w-auto md:hidden" />
      </div>
      <div className="flex items-center space-x-4 space-x-reverse">
        <NotificationBell palette={palette} />
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

// FloatingActionButton Component
function FloatingActionButton({ palette }: { palette: Pallate }) {
  return (
    <button className={`md:hidden fixed bottom-20 right-4 w-14 h-14 rounded-full bg-${palette.primary} text-white shadow-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${palette.secondary}`}>
      <Plus className="h-6 w-6" />
    </button>
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
      if (!userData){await signOut(auth);navigate('/');return;}
      setUser(userData);
    }
    fetchPalette()
  }, [])

  if (!palette || !user) {
    return <div>Loading...</div>
  }

  return (
    <div className={`flex flex-col h-screen bg-${palette.background}`} dir="rtl">
      <Header palette={palette} />
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
      <FloatingActionButton palette={palette} />
    </div>
  )
}

export default Layout;

