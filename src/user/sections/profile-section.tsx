import { useState } from 'react'
import { Upload, RefreshCw } from 'lucide-react'
import { Pallate } from '../../api/settings'

interface ProfileSectionProps {
  name: string
  setName: (name: string) => void
  bio: string
  setBio: (bio: string) => void
  icon: string
  setIcon: (icon: string) => void
  palette: Pallate
  onChange: () => void
}

export function ProfileSection({
  name,
  setName,
  setBio,
  bio,
  icon,
  setIcon,
  palette,
  onChange
}: ProfileSectionProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploading(true)
      // Simulating upload process
      setTimeout(() => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setIcon(reader.result as string)
          setIsUploading(false)
          onChange()
        }
        reader.readAsDataURL(file)
      }, 1000)
    }
  }

  const generateIcon = () => {
    // Simulating icon generation
    setIsUploading(true)
    setTimeout(() => {
      const generatedIcon = `https://api.dicebear.com/6.x/initials/svg?seed=${name}`
      setIcon(generatedIcon)
      setIsUploading(false)
      onChange()
    }, 1000)
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="name" className="block mb-1 font-medium">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            onChange()
          }}
          style={{borderColor: palette.gray[300]}}
          className={`w-full px-3 py-2 border rounded`}
        />
      </div>
      <div>
        <label htmlFor="bio" className="block mb-1 font-medium">
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => {
            setBio(e.target.value)
            onChange()
          }}
          style={{borderColor: palette.gray[300]}}
          className={`w-full px-3 py-2 border rounded`}
          rows={4}
        />
      </div>
      <div>
        <label htmlFor="icon" className="block mb-1 font-medium">
          Icon
        </label>
        <div className="flex items-center space-x-2">
          <input
            id="icon"
            type="text"
            value={icon}
            onChange={(e) => {
              setIcon(e.target.value)
              onChange()
            }}
            style={{borderColor: palette.gray[300]}}
            className={`flex-grow px-3 py-2 border rounded`}
          />
          <label style={{backgroundColor: palette.primary}} className={`px-3 py-2 text-white rounded cursor-pointer`}>
            <Upload size={20} />
            <input type="file" className="hidden" onChange={handleIconUpload} accept="image/*" />
          </label>
          <button
            onClick={generateIcon}
            style={{backgroundColor: palette.secondary}}
            className={`px-3 py-2 text-white rounded`}
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>
      <div className="pt-4">
        <h3 className="font-medium mb-2">Preview</h3>
        <div className="flex items-center space-x-4">
          <div
            style={{backgroundColor: palette.gray[200]}}
            className={`w-16 h-16 rounded-full flex items-center justify-center overflow-hidden`}
          >
            {isUploading ? (
              <div style={{borderColor: palette.primary}} className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 `}></div>
            ) : icon ? (
              <img src={icon} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold">{name.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          <div>
            <p className="font-medium">{name || 'Your Name'}</p>
            <p style={{color: palette.gray[500]}} className={`text-sm`}>
              {bio || 'Your bio'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

