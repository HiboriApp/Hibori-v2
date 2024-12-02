import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DefaultPallate, GetPallate, Pallate } from '../api/settings';

// Routes
const routes = [
  { name: 'עמוד ראשי', path: '/home' },
  { name: 'החברים שלך', path: '/connections' },
  { name: 'הודעות', path: '/messages' },
];

function UserProfile({ palette }: { palette: Pallate }) {
  return (
    <div className={`flex items-center justify-between p-4 ${palette.secondary}`}>
      <div className="flex items-center space-x-4">
        <div className="relative w-10 h-10 rounded-full overflow-hidden">
          <img
            src="/avatars/01.png"
            alt="John Doe"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className={`text-sm font-medium ${palette.text}`}>John Doe</p>
          <p className={`text-xs ${palette.special}`}>john@example.com</p>
        </div>
      </div>
      <button
        aria-label="User settings"
        className={`p-2 rounded-full hover:${palette.tertiary} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-300`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 ${palette.text}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}

function RightSidebar({ palette }: { palette: Pallate }) {
  const location = useLocation();

  return (
    <aside className={`w-64 h-screen ${palette.background} border-l border-emerald-800 flex flex-col`}>
      <UserProfile palette={palette} />
      <nav className="flex-1 overflow-y-auto">
        <ul className="py-4">
          {routes.map((route) => (
            <li key={route.path}>
              <Link
                to={route.path}
                className={`block px-4 py-2 text-sm ${
                  location.pathname === route.path
                    ? `${palette.primary} ${palette.text} font-medium`
                    : `${palette.special} hover:${palette.tertiary}`
                }`}
              >
                {route.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <footer className={`p-4 text-xs text-center ${palette.special} border-t border-emerald-800`}>
        ©{new Date().getFullYear()} Your Company Name
      </footer>
    </aside>
  );
}

// Layout Component
export function Layout({children}: {children: React.ReactNode}) {
  const [palette, setPalette] = useState<Pallate>(DefaultPallate());

  useEffect(() => {
    async function fetchPalette() {
      const newPalette = await GetPallate();
      setPalette(newPalette);
    }
    fetchPalette();
  }, []);

  return (
    <div className={`flex min-h-screen ${palette.background}`}>
      <main className={`flex-1 overflow-y-auto p-4 ${palette.text}`}>{children}</main>
      <RightSidebar palette={palette} />
    </div>
  );
}

