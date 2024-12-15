import Layout from "../components/layout";


import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const [hasProfileImage, setHasProfileImage] = useState(true);

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 text-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-green-600">הגדרות</h1>

        <div className="space-y-8">
          {/* Profile Settings */}
          <section className="bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-green-600">פרטי פרופיל</h2>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/3 flex flex-col items-center">
                <div className="relative w-40 h-40 rounded-full overflow-hidden mb-4 group">
                  {hasProfileImage ? (
                    <>
                      <img
                        src="https://via.placeholder.com/160"
                        alt="תמונת פרופיל"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => setHasProfileImage(false)}
                          className="text-white bg-red-500 p-2 rounded-full hover:bg-red-600 transition-colors duration-200"
                          aria-label="הסר תמונה"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => setHasProfileImage(true)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
                >
                  {hasProfileImage ? 'שנה תמונה' : 'הוסף תמונה'}
                </button>
              </div>
              <div className="w-full md:w-2/3 space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-700">שם</label>
                  <input
                    type="text"
                    id="name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="הכנס את השם שלך"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700">דוא"ל</label>
                  <input
                    type="email"
                    id="email"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="הכנס את כתובת הדואר האלקטרוני שלך"
                  />
                </div>
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium mb-1 text-gray-700">ביוגרפיה</label>
                  <textarea
                    id="bio"
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="ספר לנו מעט על עצמך"
                  ></textarea>
                </div>
              </div>
            </div>
          </section>

          {/* Notification Preferences */}
          <section className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-green-600">העדפות התראות</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">התראות דוא"ל</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">התראות דחיפה</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
            </div>
          </section>

          {/* Account Settings */}
          <section className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-green-600">הגדרות חשבון</h2>
            <div className="space-y-4">
              <div className="relative">
                <label htmlFor="language" className="block text-sm font-medium mb-1 text-gray-700">שפה</label>
                <select
                  id="language"
                  className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-green-500 transition-all duration-200"
                >
                  <option value="he">עברית</option>
                  <option value="en">אנגלית</option>
                  <option value="ar">ערבית</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
              <div className="relative">
                <label htmlFor="timezone" className="block text-sm font-medium mb-1 text-gray-700">אזור זמן</label>
                <select
                  id="timezone"
                  className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-green-500 transition-all duration-200"
                >
                  <option value="Asia/Jerusalem">ירושלים</option>
                  <option value="Europe/London">לונדון</option>
                  <option value="America/New_York">ניו יורק</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            </div>
          </section>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="button"
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 text-lg font-semibold"
            >
              שמור שינויים
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}





export function Settings() {
    return <Layout children={
        <SettingsPage></SettingsPage>
    }></Layout>
}