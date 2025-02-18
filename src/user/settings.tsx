import { useEffect, useRef, useState } from "react"
import { Trash2, UploadCloud, Camera } from "lucide-react"
import { getUser, type UserData, setUser as setUserInDB } from "../api/db"
import { Avatar, GenerateIcons, type Icon, IconType } from "../api/icons"
import Loading from "../components/Loading"
import { useNavigate } from "react-router-dom"
import Layout from "../components/layout"
import { DefaultPallate } from "../api/settings"
import { uploadString } from "../api/cloudinary"

export interface Pallate {
  primary: string
  secondary: string
  tertiary: string
  background: string
  text: string
  main: string
}

// Modernized Video Upload Component with Dropzone
function VideoSettings({ onVideoUpload, colors }: { onVideoUpload: (file: File) => void; colors: Pallate }) {
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
      <label className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
        העלאת וידאו
      </label>
      {/* Dropzone Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-500 transition-colors duration-200"
        style={{ borderColor: colors.text, backgroundColor: colors.background }}
      >
        {selectedFile ? (
          <span className="text-sm" style={{ color: colors.text }}>
            נבחר: {selectedFile.name}
          </span>
        ) : (
          <>
            <UploadCloud size={32} color={colors.text} />
            <span className="mt-2 text-sm" style={{ color: colors.text }}>
              לחץ לבחירת וידאו
            </span>
          </>
        )}
      </div>
      <input type="file" accept="video/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
      {selectedFile && (
        <button
          onClick={handleUpload}
          className="mt-2 text-white flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200"
          style={{ backgroundColor: colors.primary }}
        >
          <UploadCloud size={16} />
          העלה וידאו
        </button>
      )}
    </div>
  )
}

// Simplified Color Settings – Only Change the Theme Color with Visual Feedback
function ColorPaletteSettings({
  initialColors,
  onSave,
}: {
  initialColors: Pallate
  onSave: (colors: Pallate) => void
}) {
  // Allow changing only the primary color (labeled "צבע נושא")
  const [themeColor, setThemeColor] = useState(initialColors.primary)

  const handleColorChange = (value: string) => {
    setThemeColor(value)
  }

  const handleSave = () => {
    const newColors = { ...initialColors, primary: themeColor }
    onSave(newColors)
  }

  const handleReset = () => {
    const defaultColors = DefaultPallate()
    setThemeColor(defaultColors.primary)
    onSave(defaultColors)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label htmlFor="theme-color" className="text-sm font-medium" style={{ color: initialColors.text }}>
          צבע נושא
        </label>
        {/* Color Preview Circle */}
        <div
          className="w-6 h-6 rounded-xl "
          style={{ backgroundColor: themeColor }}
        ></div>
      </div>
      <input
        type="color"
        id="theme-color"
        value={themeColor}
        onChange={(e) => handleColorChange(e.target.value)}
        className="h-10 rounded-xl cursor-pointer w-full"
      />
      <div className="flex gap-4 mt-2">
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg text-white transition-colors duration-200"
          style={{ backgroundColor: initialColors.primary }}
        >
          שמור צבע
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg text-white transition-colors duration-200"
          style={{ backgroundColor: initialColors.primary }}
        >
          אתחול צבע
        </button>
      </div>
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
  const [colors, setColors] = useState(DefaultPallate())

  const handleChangePFP = async () => {
    if (!fileRef.current) return
    fileRef.current.click()
    fileRef.current.onchange = () => {
      if (!fileRef.current) return
      const file = fileRef.current.files && fileRef.current.files.length > 0 ? fileRef.current.files[0] : null
      if (!file) return
      const reader = new FileReader()
      reader.onload = async () => {
        const icon = reader.result as string
        setPFP({ type: IconType.image, content: await uploadString(icon) })
        setHasProfileImage(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleVideoUpload = async (file: File) => {
    if (file && user) {
      const reader = new FileReader()
      reader.onload = async () => {
        const video = reader.result as string
        setUser({
          ...user,
          background: await uploadString(video),
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    if (!user) return
    await setUserInDB({
      ...user,
      pallate: colors,
      icon: pfp ? pfp : await GenerateIcons(user.id),
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
      if (userData.pallate) {
        setColors(userData.pallate)
      }
    }
    fetchData()
  }, [navigate])

  if (!user || !pfp) {
    return <Loading />
  }

  return (
    <Layout>
      <div dir="rtl" className="min-h-screen p-8" style={{ color: colors.text, backgroundColor: colors.background }}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8" style={{ color: colors.primary }}>הגדרות</h1>
          <div className="space-y-8">
            {/* Profile Settings */}
            <section className="p-6 rounded-xl shadow-md" style={{ backgroundColor: colors.main }}>
              <h2 className="text-2xl font-semibold mb-6" style={{ color: colors.primary }}>פרטי פרופיל</h2>
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
                    className="flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    style={{ backgroundColor: colors.primary}}
                  >
                    <Camera size={16} />
                    {hasProfileImage ? "שנה תמונה" : "הוסף תמונה"}
                  </button>
                </div>
                <div className="w-full md:w-2/3 space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                      שם
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={user.name}
                      onChange={(e) => setUser({ ...user, name: e.target.value })}
                      className="w-full p-3 border rounded-lg transition-all duration-200"
                      style={{ borderColor: colors.text, color: colors.text, backgroundColor: colors.background }}
                      placeholder="הכנס את השם שלך"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                      דוא"ל
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={user.email}
                      onChange={(e) => setUser({ ...user, email: e.target.value })}
                      className="w-full p-3 border rounded-lg transition-all duration-200"
                      style={{ borderColor: colors.text, color: colors.text, backgroundColor: colors.background }}
                      placeholder="הכנס את כתובת הדואר האלקטרוני שלך"
                    />
                  </div>
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                      ביוגרפיה
                    </label>
                    <textarea
                      id="bio"
                      rows={4}
                      value={user.bio}
                      onChange={(e) => setUser({ ...user, bio: e.target.value })}
                      className="w-full p-3 border rounded-lg transition-all duration-200"
                      style={{ borderColor: colors.text, color: colors.text, backgroundColor: colors.background }}
                      placeholder="ספר לנו מעט על עצמך"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Notification Preferences */}
            <section className="p-6 rounded-xl shadow-md" style={{ backgroundColor: colors.main }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: colors.primary }}>העדפות התראות</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: colors.text }}>
                    התראות דחיפה
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      checked={user.wantsNotifications}
                      onChange={(e) => setUser({ ...user, wantsNotifications: e.target.checked })}
                      type="checkbox"
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                  </label>
                </div>
              </div>
            </section>


          {/*   video settings
            <section className="p-6 rounded-xl shadow-md" style={{ backgroundColor: colors.main }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: colors.primary }}>הגדרות וידאו</h2>
              <VideoSettings onVideoUpload={handleVideoUpload} colors={colors} />
            </section>
            */}


            {/* Color Palette Settings */}
            <section className="p-6 rounded-xl shadow-md" style={{ backgroundColor: colors.main }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: colors.primary }}>הגדרות צבע</h2>
              <ColorPaletteSettings
                initialColors={colors}
                onSave={(newColors) => {
                  setColors(newColors)
                }}
              />
            </section>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                type="button"
                className="px-6 text-white py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 text-lg font-semibold"
                style={{ backgroundColor: colors.primary }}
              >
                שמור שינויים
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
