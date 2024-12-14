import Layout from "../components/layout";

import { useState } from 'react'
import { UserCircle, Palette } from 'lucide-react'
import { ProfileSection } from './sections/profile-section'
import { PaletteSection } from './sections/pallate-section'
import { DefaultPallate, Pallate } from "../api/settings";

interface SaveModalProps {
  onSave: () => void
  onCancel: () => void
  palette: Pallate
}

export function SaveModal({ onSave, onCancel, palette }: SaveModalProps) {
  return (
    <div className={`fixed inset-0`} style={{ backgroundColor: palette.black, opacity: 0.5 }}>
      <div className="p-6 rounded-lg shadow-lg" style={{ backgroundColor: palette.white }}>
        <h2 className="text-xl font-bold mb-4" style={{ color: palette.text }}>Save Changes</h2>
        <p className="mb-6" style={{ color: palette.text }}>Are you sure you want to save your changes?</p>
        <div className="flex justify-end space-x-4">
          <button
            className={`px-4 py-2 rounded hover:bg-${palette.gray[300]} transition-colors`}
            style={{ backgroundColor: palette.gray[200], color: palette.text }}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 rounded hover:bg-${palette.secondary} transition-colors`}
            style={{ backgroundColor: palette.primary, color: palette.white }}
            onClick={onSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'palette'>('profile')
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [icon, setIcon] = useState('')
  const [palette, setPalette] = useState<Pallate>(DefaultPallate())
  const [isChanged, setIsChanged] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const handleChange = () => {
    if (!isChanged) {
      setIsChanged(true)
    }
  }

  const handleSave = () => {
    console.log({ name, bio, icon, palette })
    setIsChanged(false)
    setShowModal(false)
  }

  return (
    <div style={{backgroundColor: palette.background, color: palette.text}} className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">User Settings</h1>
      <div className="flex mb-6">
        <button
          style={{backgroundColor: activeTab === 'profile' ? palette.primary : palette.gray[200], color: activeTab === 'profile' ? 'white' : palette.text}}
          className="flex items-center px-4 py-2 mr-2 rounded-t-lg"
          onClick={() => setActiveTab('profile')}
        >
          <UserCircle className="mr-2" />
          Profile
        </button>
        <button
          style={{backgroundColor: activeTab === 'palette' ? palette.primary : palette.gray[200], color: activeTab === 'palette' ? 'white' : palette.text}}
          className="flex items-center px-4 py-2 rounded-t-lg"
          onClick={() => setActiveTab('palette')}
        >
          <Palette className="mr-2" />
          Palette
        </button>
      </div>
      <div style={{backgroundColor: palette.white}} className="bg-white p-6 rounded-lg shadow-md">
        {activeTab === 'profile' ? (
          <ProfileSection
            name={name}
            setName={setName}
            bio={bio}
            setBio={setBio}
            icon={icon}
            setIcon={setIcon}
            palette={palette}
            onChange={handleChange}
          />
        ) : (
          <PaletteSection palette={palette} setPalette={setPalette} onChange={handleChange} />
        )}
      </div>
      {isChanged && (
        <button
          style={{backgroundColor: palette.primary, color: 'white'}}
          className="mt-6 px-4 py-2 rounded hover:bg-[#667eea] transition-colors"
          onClick={() => setShowModal(true)}
        >
          Save Changes
        </button>
      )}
      {showModal && <SaveModal onSave={handleSave} onCancel={() => setShowModal(false)} palette={palette} />}
    </div>
  )
}



export default function Settings() {
    return <Layout children={
        <SettingsPage></SettingsPage>
    }></Layout>
}