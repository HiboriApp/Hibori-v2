import React, { useState } from 'react';

const SignupForm: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle signup logic here
    console.log('Signup attempted with:', { fullName, email, password, confirmPassword });
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white" dir="rtl">
      <div className="w-full md:w-1/2 flex flex-col justify-between md:justify-center relative">
        {/* Wave design for mobile */}
        <div className="md:hidden w-full overflow-hidden">
          <svg className="w-full h-auto" viewBox="0 0 500 150" preserveAspectRatio="none">
            <path d="M0,0 C150,100 350,0 500,100 L500,0 L0,0 Z" fill="#06AA06"></path>
          </svg>
        </div>

        {/* Mobile welcome text */}
        <div className="md:hidden text-white z-10 p-6 -mt-16">
          <h3 className="text-2xl font-bold mb-2">ברוכים הבאים!</h3>
          <p>צור חשבון חדש כדי להתחיל</p>
        </div>

        {/* Signup form - Centered on mobile and desktop */}
        <div className="w-full max-w-md mx-auto p-6 md:p-8 bg-white md:bg-transparent rounded-t-3xl md:rounded-none z-10 flex-grow flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-[#06AA06] mb-6">הרשמה</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-[#115614] mb-1">
                שם מלא
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-[#0A810B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#06AA06]"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#115614] mb-1">
                דוא"ל
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-[#0A810B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#06AA06]"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#115614] mb-1">
                סיסמה
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-[#0A810B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#06AA06]"
                required
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#115614] mb-1">
                אימות סיסמה
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-[#0A810B] rounded-md focus:outline-none focus:ring-2 focus:ring-[#06AA06]"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#06AA06] text-white py-2 px-4 rounded-md hover:bg-[#0A810B] transition duration-300"
            >
              הירשם
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-[#115614]">כבר יש לך חשבון?</p>
            <a href="#" className="text-[#06AA06] font-bold hover:underline">התחבר עכשיו</a>
          </div>
        </div>
      </div>

      <div className="hidden md:flex w-full md:w-1/2 items-center justify-center relative overflow-hidden h-screen">
        <img
          src="/skibidi.png"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />

        <div className="absolute inset-0 bg-[#06AA06] opacity-50 z-10"></div>

        <div className="relative z-20 text-white text-center px-4">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">ברוכים הבאים!</h3>
          <p className="text-lg md:text-xl mb-6">צור חשבון חדש כדי להתחיל</p>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;

