import { useEffect, useRef, useState } from "react"
import { Trash2 } from "lucide-react"
import { getUser, type UserData, setUser as setUserInDB } from "../api/db"
import { Avatar, type Icon, IconType } from "../api/icons"
import Loading from "../components/Loading"
import { useNavigate } from "react-router-dom"
import Layout from "../components/layout"
import { DefaultPallate } from "../api/settings"

// VideoSettings Component
function VideoSettings({ onVideoUpload }: { onVideoUpload: (file: File) => void }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = () => {
    if (selectedFile) {
      onVideoUpload(selectedFile)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="video-upload" className="block text-sm font-medium mb-1 text-gray-700">
          העלאת וידאו
        </label>
        <input
          id="video-upload"
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-green-50 file:text-green-700
            hover:file:bg-green-100"
        />
      </div>
      {selectedFile && (
        <div>
          <p className="text-sm text-gray-600">נבחר: {selectedFile.name}</p>
          <button
            onClick={handleUpload}
            className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
          >
            העלה וידאו
          </button>
        </div>
      )}
    </div>
  )
}

// ColorPaletteSettings Component
function ColorPaletteSettings({
  initialColors,
  onSave,
}: {
  initialColors: {
    primary: string
    secondary: string
    background: string
    tertiary: string
    text: string
  }
  onSave: (colors: {
    primary: string
    secondary: string
    background: string
    tertiary: string
    text: string
  }) => void
}) {
  const [colors, setColors] = useState(initialColors)

  const handleColorChange = (colorType: keyof typeof colors, value: string) => {
    setColors((prevColors) => ({
      ...prevColors,
      [colorType]: value,
    }))
  }

  return (
    <div className="space-y-4">
      {Object.entries(colors).map(([colorType, colorValue]) => (
        <div key={colorType}>
          <label htmlFor={`color-${colorType}`} className="block text-sm font-medium mb-1 text-gray-700">
            {colorType.charAt(0).toUpperCase() + colorType.slice(1)}
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              id={`color-${colorType}`}
              value={colorValue}
              onChange={(e) => handleColorChange(colorType as keyof typeof colors, e.target.value)}
              className="h-8 w-8 border-none rounded-full overflow-hidden"
            />
            <input
              type="text"
              value={colorValue}
              onChange={(e) => handleColorChange(colorType as keyof typeof colors, e.target.value)}
              className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>
      ))}
      <button
        onClick={() => onSave(colors)}
        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
      >
        שמור הגדרות צבעים
      </button>
    </div>
  )
}

// Main SettingsPage Component
export default function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [hasProfileImage, setHasProfileImage] = useState(true)
  const [pfp, setPFP] = useState<Icon | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const [colors, setColors] = useState(DefaultPallate());

  const handleChangePFP = async () => {
    if (!fileRef.current) {
      return
    }
    fileRef.current?.click()
    fileRef.current.onchange = () => {
      if (!fileRef.current) {
        return
      }
      const file = fileRef.current.files && fileRef.current.files.length > 0 ? fileRef.current.files[0] : null
      if (!file) {
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        const icon = reader.result as string
        setPFP({ type: IconType.image, content: icon })
        setHasProfileImage(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleVideoUpload = async (file: File) => {
    // Here you would typically upload the file to your server or cloud storage
    // For this example, we'll just update the user object with the file name
    if (user) {
      setUser({
        ...user,
        //videoFileName: file.name,
      })
    }
  }

  const handleSave = async () => {
    if (!user) {
      return
    }
    await setUserInDB({
      ...user,
      //colors,
    })
    navigate("/home")
  }

  useEffect(() => {
    async function fetchData() {
      const userData = await getUser()
      if (!userData) {
        navigate("/")
        return
      }
      setUser(userData)
      if (userData.icon) {
        setPFP(userData.icon)
        setHasProfileImage(true)
      }
      if (userData.colors) {
        setColors(userData.colors)
      }
    }
    fetchData()
  }, [navigate])

  if (!user || !pfp) {
    return <Loading />
  }

  return (
    <Layout children={<div dir="rtl" className="min-h-screen bg-gray-50 text-gray-800 p-8">
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
                      <Avatar icon={pfp} className="h-full w-full object-cover" />
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
                      <svg
                        className="w-16 h-16 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <input type="file" accept="image/*" ref={fileRef} style={{ display: "none" }} />
                <button
                  onClick={handleChangePFP}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
                >
                  {hasProfileImage ? "שנה תמונה" : "הוסף תמונה"}
                </button>
              </div>
              <div className="w-full md:w-2/3 space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-700">
                    שם
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={user.name}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="הכנס את השם שלך"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700">
                    דוא"ל
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="הכנס את כתובת הדואר האלקטרוני שלך"
                  />
                </div>
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium mb-1 text-gray-700">
                    ביוגרפיה
                  </label>
                  <textarea
                    id="bio"
                    rows={4}
                    value={user.bio}
                    onChange={(e) => setUser({ ...user, bio: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="ספר לנו מעט על עצמך"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Notification Preferences */}
          <section className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-green-600">העדפות התראות</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">התראות דחיפה</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    checked={user.wantsNotifications}
                    onChange={(e) => setUser({ ...user, wantsNotifications: e.target.checked })}
                    type="checkbox"
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500" />
                </label>
              </div>
            </div>
          </section>

          {/* Video Settings */}
          <section className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-green-600">הגדרות וידאו</h2>
            <VideoSettings onVideoUpload={handleVideoUpload} />
          </section>

          {/* Color Palette Settings */}
          <section className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-green-600">הגדרות צבעים</h2>
            <ColorPaletteSettings initialColors={colors} onSave={(newColors) => setColors(newColors)} />
          </section>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              type="button"
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 text-lg font-semibold"
            >
              שמור שינויים
            </button>
          </div>
        </div>
      </div>
    </div>}></Layout>
  )
}

