import type React from "react"
import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, Home, User, Settings, Sparkles } from "lucide-react"
import { GetPallate, type Pallate, DefaultPallate } from "../api/settings"
import { getUser, type UserData, setUser as setUserInDB } from "../api/db"
import Loading from "./Loading"
import { Avatar } from "../api/icons"
import { Timestamp } from "firebase/firestore"
import LeafLogo from "./LeafLogo"

// Routes
const routes = [
  { name: "דף הבית", path: "/home", icon: Home },
  { name: "חברים", path: "/connections", icon: User },
  { name: "הודעות", path: "/messages", icon: MessageSquare },
  { name: "מוצא החברים", path: "/ai", icon: Sparkles },
]

// Animations
const pageTransition = {
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
}

// UserProfile Component
function UserProfile({ palette, user }: { palette: Pallate; user: UserData }) {
  return (
    <div
      className="flex items-center justify-around space-x-4 space-x-reverse"
      style={{ color: palette.text, backgroundColor: palette.main }}
    >
        <Avatar
          icon={user.icon}
          userID={user.id}
          isOnline={user.lastOnline.toDate() > new Date()}
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
        ></Avatar>
      <p className="text-sm font-medium">{user.name}</p>
      <Link
        to={"/settings"}
        className="p-2 rounded-full hover:bg-opacity-20 focus:outline-none focus:ring-2"
        style={{ color: palette.text, backgroundColor: palette.main }}
      >
        <Settings className="h-6 w-6" />
        <span className="sr-only">Settings</span>
      </Link>
    </div>
  )
}
// Sidebar Component
function Sidebar({ palette, user }: { palette: Pallate; user: UserData }) {
  const location = useLocation()
  const [isHovering, setIsHovering] = useState(false)
  const [hoveredPath, setHoveredPath] = useState<string | null>(null)

  return (
    <aside
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`hidden md:flex md:flex-col ${isHovering ? "md:w-64" : "md:w-16"} transition-all duration-200`}
      style={{ color: palette.text, backgroundColor: palette.main }}
    >
      <a href="/" className="self-start">
        <div className="p-4 self-end">
          <LeafLogo color={palette.primary} className="h-8 w-8" />
        </div>
      </a>
      <nav className="flex-1 px-2 py-4 space-y-2">
        {routes.map((route) => {
          const Icon = route.icon
          const isActive = location.pathname === route.path
          const isHovered = hoveredPath === route.path
          return (
            <Link
              key={route.path}
              to={route.path}
              onMouseEnter={() => setHoveredPath(route.path)}
              onMouseLeave={() => setHoveredPath((current) => (current === route.path ? null : current))}
              style={{
                color: isActive ? palette.primary : palette.text,
                backgroundColor: isActive
                  ? isHovered
                    ? `${palette.primary}18`
                    : `${palette.primary}12`
                  : isHovered
                    ? `${palette.primary}08`
                    : palette.main,
                borderBottomColor: isActive ? palette.primary : 'transparent',
              }}
              className="group relative flex items-center overflow-hidden rounded-2xl border-b-2 px-3 py-2.5 text-sm transition-all duration-200"
            >
              <motion.span
                className="absolute inset-0 rounded-2xl"
                aria-hidden="true"
                animate={{
                  opacity: isHovered ? 1 : 0,
                  scale: isHovered ? 1 : 0.99,
                }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                style={{
                  background: isActive
                    ? `linear-gradient(90deg, ${palette.primary}10 0%, transparent 100%)`
                    : `linear-gradient(90deg, ${palette.primary}06 0%, transparent 100%)`,
                }}
              />

              <motion.span
                aria-hidden="true"
                className={`absolute rounded-full ${isHovering ? "inset-y-2 right-1 w-0.5" : "bottom-1 left-1/2 h-0.5 w-5 -translate-x-1/2"}`}
                animate={{
                  opacity: isHovering && (isActive || isHovered) ? 1 : 0,
                  scaleY: isHovering ? (isActive ? (isHovered ? 1.02 : 0.92) : isHovered ? 0.62 : 0.3) : 1,
                  scaleX: isHovering ? 1 : isActive ? (isHovered ? 1.05 : 0.92) : isHovered ? 0.75 : 0.35,
                }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                style={{ backgroundColor: palette.primary }}
              />

              <motion.span
                className="relative z-10 ml-3 flex h-10 w-10 items-center justify-center"
                animate={{
                  scale: isActive ? (isHovered ? 1.03 : 1) : isHovered ? 1.02 : 1,
                  x: isHovered ? -1 : 0,
                  rotate: isHovered ? -1 : 0,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 26 }}
                style={{
                  color: isActive ? palette.primary : palette.text,
                }}
              >
                <Icon className="min-h-5 min-w-5" />
              </motion.span>

              <motion.p
                className="relative z-10 min-w-16 whitespace-nowrap text-sm font-medium"
                animate={{
                  opacity: isHovering ? 1 : 0,
                  x: isHovering ? 0 : 8,
                  scale: isActive && isHovered ? 1.02 : 1,
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {route.name}
              </motion.p>
            </Link>
          )
        })}
      </nav>
      <div className={`p-4 border-t `  }style={{
                borderTopColor:  palette.primary
              }}>
        {isHovering ? (
          <UserProfile user={user} palette={palette} />
        ) : (
          <Link to={`/user/${user.id}`}>
            <Avatar
              icon={user.icon}
              userID={user.id}
              isOnline={user.lastOnline.toDate() > new Date()}
              className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-secondary font-bold text-lg"
            ></Avatar>
          </Link>
        )}
      </div>
    </aside>
  )
}

// MobileBottomNav Component
function MobileBottomNav({ palette }: { palette: Pallate }) {
  const location = useLocation()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 flex justify-around items-center h-16 z-50"
      style={{ color: palette.text, backgroundColor: palette.main }}
    >
      {routes.map((route) => {
        const Icon = route.icon
        const isActive = location.pathname === route.path
        return (
          <Link
          key={route.path}
          to={route.path}
          style={{
            color: isActive ? palette.primary : palette.text,
            backgroundColor: palette.main,
            borderTopColor: isActive ? palette.primary : 'transparent',
          }}
          className="flex flex-col items-center justify-center w-full h-full border-t-2"
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
function MainContent({
  children,
  palette,
}: {
  children: React.ReactNode
  palette: Pallate
}) {
  const location = useLocation()
  return (
    <main style={{ color: palette.text, backgroundColor: palette.main }}>
      <AnimatePresence mode="wait">
        <motion.div key={location.pathname} initial="out" animate="in" exit="out" variants={pageTransition}>
          {children}
        </motion.div>
      </AnimatePresence>
    </main>
  )
}

// Layout Component
interface LayoutProps {
  children: React.ReactNode
  hideLayoutOnMobile?: boolean // New prop to control layout visibility
}

export function Layout({ children, hideLayoutOnMobile = false }: LayoutProps) {
  const [palette, setPalette] = useState<Pallate>(DefaultPallate())
  const [user, setUser] = useState<UserData | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchData() {
      const userData = await getUser()
      if (!userData) {
        navigate("/")
        return
      }
      const newPalette = await GetPallate(userData)
      setPalette(newPalette)
      if (typeof window !== "undefined") {
        window.localStorage.setItem("hibori-theme-primary", newPalette.primary)
      }
      setUser(userData)
    }
    fetchData()
  }, [navigate])
  useEffect(() => {
    const timeout = setInterval(() => {
      if (!user) return
      const date = new Date()
      date.setMinutes(date.getMinutes() + 5)
      if (user.lastOnline.toDate().getTime() > new Date().getTime()) return
      setUser({ ...user, lastOnline: Timestamp.fromDate(date) })
      setUserInDB({ ...user, lastOnline: Timestamp.fromDate(date) })
    }, 1000)
    return () => clearInterval(timeout)
  })

  if (!user) {
    return <Loading />
  }

  return (
    <div
      className="flex flex-col justify-center h-[95vh] md:h-screen"
      dir="rtl"
      style={{ color: palette.text, backgroundColor: palette.main }}
    >
      {!hideLayoutOnMobile && (
        <div className="md:hidden flex flex-row justify-between items-center border-b-2 shadow-md shadow-slate-50  p-4 ">
          <Link to={`/user/${user.id}`}>
            <Avatar
              icon={user.icon}
              userID={user.id}
              isOnline={user.lastOnline.toDate() > new Date()}
              className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-secondary font-bold text-lg"
            ></Avatar>
          </Link>
          <Link to={"/settings"}>
            <div>
              <Settings className={`h-7 w-7 ml-3 text-${palette.text}`} />
              <span className="sr-only">Settings</span>
            </div>
          </Link>
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        {!hideLayoutOnMobile && <Sidebar palette={palette} user={user} />}
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
          <MainContent palette={palette}>{children}</MainContent>
        </div>
      </div>
      {!hideLayoutOnMobile && <MobileBottomNav palette={palette} />}
    </div>
  )
}

export default Layout

