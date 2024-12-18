import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Home, User, Settings, Sparkles } from 'lucide-react';
import { GetPallate, Pallate } from '../api/settings';
import { getUser, UserData, setUser as setUserInDB } from '../api/db';
import Loading from './Loading';
import { Avatar } from '../api/icons';
import { Timestamp } from 'firebase/firestore';

// Routes
const routes = [
  { name: 'דף הבית', path: '/home', icon: Home },
  { name: 'חברים', path: '/connections', icon: User },
  { name: 'הודעות', path: '/messages', icon: MessageSquare },
  { name: 'מוצא החברים', path: '/ai', icon: Sparkles}
];

// Animations
const pageTransition = {
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

// UserProfile Component
function UserProfile({ palette, user }: { palette: Pallate; user: UserData }) {
  return (
    <div className="flex items-center justify-around space-x-4 space-x-reverse">
      <Avatar icon={user.icon} isOnline={user.lastOnline.toDate() > new Date()} className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-secondary font-bold text-lg" ></Avatar>
      <p className="text-sm font-medium text-text">{user.name}</p>
      <Link
        to={'/settings'}
        className={`p-2 rounded-full hover:bg-${palette.background} focus:outline-none focus:ring-2 focus:ring-${palette.secondary}`}
      >
        <Settings className={`h-6 w-6 text-${palette.text}`} />
        <span className="sr-only">Settings</span>
      </Link>
    </div>
  );
}
// Sidebar Component
function Sidebar({ palette, user }: { palette: Pallate; user: UserData }) {
  const location = useLocation();
  const [isHovering, setIsHovering] = useState(false);

  return (
    <aside onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}
    className={`hidden md:flex md:flex-col ${isHovering ? 'md:w-64' : 'md:w-16'} transition-all duration-200 bg-white border-r border-green-500`}>
      <a href="/" className='self-start'>
      <div className="p-4 self-end">
        <img src="/logo.svg" alt="Logo" className="h-8 w-auto" />
      </div>
      </a>
      <nav className="flex-1 px-2 py-4 space-y-2">
        {routes.map((route) => {
          const Icon = route.icon;
          const isActive = location.pathname === route.path;
          return (
            <Link
              key={route.path}
              to={route.path}
              className={`flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                isActive
                  ? `text-${palette.primary} bg-${palette.background} border-b-2 border-green-600 !important`
                  : `text-${palette.text} hover:bg-${palette.background}`
              }`}
            >
              <Icon className={'ml-2 min-h-6 min-w-6 translate-x-1'} />
              <p className='min-w-16'>{isHovering && route.name}</p>
            </Link>
          );
        })}
      </nav>
      <div className={`p-4 border-t border-${palette.secondary}`}>
        {isHovering ? <UserProfile user={user} palette={palette} /> : <Avatar icon={user.icon} isOnline={user.lastOnline.toDate() > new Date()} className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-secondary font-bold text-lg" ></Avatar>}
      </div>
    </aside>
  );
}

// MobileBottomNav Component
function MobileBottomNav({ palette }: { palette: Pallate }) {
  const location = useLocation();

  return (
    <nav
      className={`md:hidden fixed bottom-0 left-0 right-0 bg-white !important border-t border-gray-200 !important flex justify-around items-center h-16 z-50`}
    >
      {routes.map((route) => {
        const Icon = route.icon;
        const isActive = location.pathname === route.path;
        return (
          <Link
            key={route.path}
            to={route.path}
            className={`flex flex-col items-center justify-center w-full h-full ${
              isActive
                ? `text-${palette.primary} border-t-2 border-green-600`
                : `text-${palette.text}`
            }`}
          >
            <Icon className="h-6 w-6" />
            <span className="text-xs mt-1">{route.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

// Main Content Component
function MainContent({
  children,
  palette,
}: {
  children: React.ReactNode;
  palette: Pallate;
}) {
  const location = useLocation();
  return (
    <main className={`flex-1 bg-${palette.background}`}>
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
  );
}

// Layout Component
interface LayoutProps {
  children: React.ReactNode;
  hideLayoutOnMobile?: boolean; // New prop to control layout visibility
}

export function Layout({ children, hideLayoutOnMobile = false }: LayoutProps) {
  const [palette, setPalette] = useState<Pallate | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      const newPalette = await GetPallate();
      setPalette(newPalette);
      const userData = await getUser();
      if (!userData) {
        navigate('/');
        return;
      }
      setUser(userData);
    }
    fetchData();
  }, [navigate]);
  useEffect(() => {
    let timeout = setInterval(() => {
      if (!user) return;
      let date = new Date();
      date.setMinutes(date.getMinutes() + 5);
      if (user.lastOnline.toMillis() > new Date().getTime()) return;
      setUser({...user, lastOnline: Timestamp.fromDate(date)});
      setUserInDB(user);
    }, 1000);
    return () => clearInterval(timeout);
  })

  if (!palette || !user) {
    return <Loading></Loading>;
  }

  return (
    <div className={`flex flex-col h-screen bg-${palette.background}`} dir="rtl">
      {!hideLayoutOnMobile && <div className='md:hidden flex flex-row justify-between items-center border-b-2 border-gray-200 p-4'>
        <Avatar icon={user.icon} isOnline={user.lastOnline.toDate() > new Date()} className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-secondary font-bold text-lg" ></Avatar>
        <Link to={'/settings'}><div><Settings className={`h-8 w-8 ml-3 text-${palette.text}`} />
        <span className="sr-only">Settings</span></div></Link>
      </div>}
      <div className="flex flex-1 overflow-hidden">
        {!hideLayoutOnMobile && <Sidebar palette={palette} user={user} />}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <MainContent palette={palette}>{children}</MainContent>
        </div>
      </div>
      {!hideLayoutOnMobile && <MobileBottomNav palette={palette} />}
    </div>
  );
}

export default Layout;

