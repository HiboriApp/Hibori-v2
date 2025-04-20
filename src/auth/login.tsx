import React, { useState } from 'react';
import { Login } from '../api/auth';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../api/firebase';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  onAuthStateChanged(auth, (user) => {
    if (user) { 
      navigate('/home');
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await Login(email, password);
      if (res) {
        navigate('/home');
      } else {
        setError('דוא"ל או סיסמה שגויים');
      }
    } catch (err) {
      setError('דוא"ל או סיסמה שגויים');
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] justify-center bg-white" dir="rtl">
      {/* Mobile and Tablet View */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-4 rounded-bl-lg rounded-tr-3xl">
        {/* Wave design for mobile */}
        <div className="w-full md:w-[40vw] h-full overflow-hidden absolute top-0 right-0">
          <svg className="w-full h-auto" viewBox="0 0 500 150" preserveAspectRatio="none">
            <defs>
              <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4ade80" /> {/* green-400 */}
                <stop offset="50%" stopColor="#22c55e" /> {/* green-500 */}
                <stop offset="100%" stopColor="#16a34a" /> {/* green-600 */}
              </linearGradient>
            </defs>
            <path d="M0,0 C150,100 350,0 500,100 L500,0 L0,0 Z" fill="url(#leafGradient)">
              <animate
                attributeName="d"
                dur="10s"
                repeatCount="indefinite"
                values="
                  M0,0 C150,100 350,0 500,100 L500,0 L0,0 Z;
                  M0,0 C150,80 350,20 500,100 L500,0 L0,0 Z;
                  M0,0 C150,100 350,0 500,100 L500,0 L0,0 Z"
              />
            </path>
          </svg>
        </div>

        {/* Login form - Centered on mobile and desktop */}
        <div className="w-full max-w-md mx-auto p-6 md:p-8 md:bg-transparent rounded-t-3xl md:rounded-none z-20 flex flex-col justify-center md:mt-0">
          <h2 className="text-3xl font-bold text-green-500 mb-6 text-center md:text-start">התחברות</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-md font-medium text-[#115614] mb-1">
                דוא"ל
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-[#0A810B] rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-md font-medium text-[#115614] mb-1">
                סיסמה
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-[#0A810B] rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-[#0A810B] transition duration-300"
            >
              התחבר
            </button>
            {/* Display error message if login fails */}
            {error && <p className="mt-2 text-center text-red-500">{error}</p>}
          </form>
          <div className="mt-6 text-center">
            <p className="text-[#115614]">אין לך חשבון?</p>
            <Link to="/" className="text-green-500 font-bold hover:underline">הירשם עכשיו</Link>
          </div>
        </div>
      </div>

      <div className="md:flex -order-1 md:order-1 w-full md:w-1/2 h-[30vh] md:h-auto items-center justify-center relative overflow-hidden rounded-bl-[30em] rounded-tr-[40em] mt-14 md:mt-0">
        <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-green-500 to-green-600 shadow-inner">
          <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-white/10 to-white/30"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4/5 h-4/5 bg-gradient-to-br from-green-300 via-green-400 to-green-600 rounded-tl-[70%] rounded-br-[70%] transform rotate-45 shadow-lg"></div>
          </div>
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/20"></div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
