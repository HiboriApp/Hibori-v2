import { Pallate } from "../../api/settings"

interface PaletteSectionProps {
  palette: Pallate
  setPalette: React.Dispatch<React.SetStateAction<Pallate>>
  onChange: () => void
}

export function PaletteSection({ palette, setPalette, onChange }: PaletteSectionProps) {
  const handleColorChange = (key: string, value: string) => {
    setPalette((prev) => ({ ...prev, [key]: value }))
    onChange()
  }

  const handleGrayColorChange = (key: string, value: string) => {
    setPalette((prev) => ({ ...prev, gray: { ...prev.gray, [key]: value } }))
    onChange()
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(palette).map(([key, value]) => {
          if (key === 'gray') return null
          return (
            <div key={key} className="space-y-2">
              <label htmlFor={key} className="block font-medium">
                {key}
              </label>
              <div className="flex space-x-2">
                <input
                  id={key}
                  type="color"
                  value={value}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="w-12 h-12 p-1 rounded"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="flex-grow px-3 py-2 border rounded min-h-[48px]"
                  style={{ borderColor: palette.gray[300] }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <div>
        <h3 className="font-medium mb-2">Gray Shades</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(palette.gray).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <label htmlFor={`gray-${key}`} className="block font-medium">
                {key}
              </label>
              <div className="flex space-x-2">
                <input
                  id={`gray-${key}`}
                  type="color"
                  value={value}
                  onChange={(e) => handleGrayColorChange(key, e.target.value)}
                  className="w-12 h-12 p-1 rounded"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleGrayColorChange(key, e.target.value)}
                  className="flex-grow px-3 py-2 border rounded min-h-[48px]"
                  style={{ borderColor: palette.gray[300] }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

