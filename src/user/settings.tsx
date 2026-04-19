import { useEffect, useRef, useState } from "react"
import { Bell, Camera, Check, Palette, RefreshCw, Trash2, UserRound } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { getUser, type UserData, setUser as setUserInDB } from "../api/db"
import { Avatar, GenerateIcons, type Icon, IconType } from "../api/icons"
import { DefaultPallate, type Pallate } from "../api/settings"
import { uploadString } from "../api/cloudinary"
import Loading from "../components/Loading"
import Layout from "../components/layout"

const paletteFields: Array<{ key: keyof Pallate; label: string; hint: string }> = [
  { key: "primary", label: "צבע ראשי", hint: "כפתורים והדגשות" },
  { key: "tertiary", label: "צבע משני", hint: "אלמנטים משלימים" },
  { key: "secondary", label: "משטח רך", hint: "קלטים וכרטיסים פנימיים" },
  { key: "background", label: "רקע עמוד", hint: "הרקע הכללי של המסך" },
  { key: "main", label: "כרטיסים", hint: "משטחים ראשיים" },
  { key: "text", label: "טקסט", hint: "כותרות ותוכן" },
]

function ThemePreview({ palette, userName }: { palette: Pallate; userName: string }) {
  return (
    <div
      className="overflow-hidden rounded-[30px] border shadow-[0_24px_70px_rgba(15,23,42,0.12)]"
      style={{ backgroundColor: palette.main, borderColor: `${palette.primary}20`, color: palette.text }}
    >
      <div
        className="relative h-36"
        style={{
          background: `linear-gradient(140deg, ${palette.primary}32 0%, ${palette.tertiary}26 50%, ${palette.secondary}90 100%)`,
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.45),transparent_55%)]" />
      </div>

      <div className="px-5 pb-5 pt-4">
        <div className="-mt-12 flex items-end gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-[26px] border-4 bg-white shadow-lg" style={{ borderColor: palette.main }}>
            <UserRound size={34} style={{ color: palette.primary }} />
          </div>
          <div className="pb-2">
            <p className="text-lg font-semibold">{userName}</p>
            <p className="text-sm opacity-75">תצוגה מקדימה</p>
          </div>
        </div>

        <div className="mt-5 rounded-[22px] border p-4" style={{ backgroundColor: palette.background, borderColor: `${palette.primary}18` }}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-2">
              <span className="h-8 w-8 rounded-full border" style={{ backgroundColor: palette.primary, borderColor: `${palette.text}12` }} />
              <span className="h-8 w-8 rounded-full border" style={{ backgroundColor: palette.tertiary, borderColor: `${palette.text}12` }} />
              <span className="h-8 w-8 rounded-full border" style={{ backgroundColor: palette.secondary, borderColor: `${palette.text}12` }} />
            </div>
            <button type="button" className="rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: palette.primary }}>
              שמור
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function PaletteLab({
  colors,
  onChange,
  onReset,
}: {
  colors: Pallate
  onChange: (colors: Pallate) => void
  onReset: () => void
}) {
  const [selectedKey, setSelectedKey] = useState<keyof Pallate>("primary")

  const selectedField = paletteFields.find((field) => field.key === selectedKey) ?? paletteFields[0]
  const swatches = ["#4caf50", "#22c55e", "#0ea5e9", "#6366f1", "#f97316", "#f43f5e", "#111827", "#f8fafc"]

  const updateColor = (key: keyof Pallate, value: string) => {
    onChange({ ...colors, [key]: value })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {paletteFields.map((field) => (
          <button
            key={field.key}
            type="button"
            onClick={() => setSelectedKey(field.key)}
            className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition"
            style={{
              backgroundColor: selectedKey === field.key ? `${colors.primary}14` : colors.background,
              borderColor: selectedKey === field.key ? colors.primary : `${colors.primary}18`,
              color: colors.text,
            }}
          >
            <span className="h-4 w-4 rounded-full" style={{ backgroundColor: colors[field.key] }} />
            {field.label}
          </button>
        ))}
      </div>

      <div className="rounded-[28px] border p-5" style={{ backgroundColor: colors.main, borderColor: `${colors.primary}18` }}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-base font-semibold" style={{ color: colors.text }}>{selectedField.label}</p>
            <p className="mt-1 text-xs opacity-70" style={{ color: colors.text }}>{selectedField.hint}</p>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold"
            style={{ backgroundColor: `${colors.primary}14`, color: colors.primary }}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            איפוס
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
          <input
            type="color"
            value={colors[selectedKey]}
            onChange={(event) => updateColor(selectedKey, event.target.value)}
            className="h-20 w-full cursor-pointer rounded-[24px] border p-2 sm:w-24"
            style={{ backgroundColor: colors.background, borderColor: `${colors.primary}18` }}
          />
          <div className="flex-1">
            <input
              type="text"
              value={colors[selectedKey]}
              onChange={(event) => updateColor(selectedKey, event.target.value)}
              className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition"
              style={{ backgroundColor: colors.background, borderColor: `${colors.primary}18`, color: colors.text }}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {swatches.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => updateColor(selectedKey, swatch)}
                  className="h-9 w-9 rounded-full border transition hover:scale-105"
                  style={{ backgroundColor: swatch, borderColor: swatch === colors[selectedKey] ? colors.text : "rgba(255,255,255,0.35)" }}
                  aria-label={`Choose ${swatch}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [pfp, setPFP] = useState<Icon | null>(null)
  const [profileRemoved, setProfileRemoved] = useState(false)
  const [colors, setColors] = useState(DefaultPallate())
  const [isSaving, setIsSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const handleChangePFP = async () => {
    if (!fileRef.current) return

    fileRef.current.click()
    fileRef.current.onchange = () => {
      const file = fileRef.current?.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = async () => {
        const icon = reader.result as string
        setPFP({ type: IconType.image, content: await uploadString(icon) })
        setProfileRemoved(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemovePFP = () => {
    setPFP(null)
    setProfileRemoved(true)
  }

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    const nextIcon = pfp ?? (profileRemoved ? await GenerateIcons(user.id) : user.icon ?? await GenerateIcons(user.id))

    await setUserInDB({
      ...user,
      pallate: colors,
      icon: nextIcon,
    })

    setIsSaving(false)
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
      setPFP(userData.icon ?? null)
      if (userData.pallate) {
        setColors(userData.pallate)
      }
    }

    fetchData()
  }, [navigate])

  if (!user) {
    return <Loading />
  }

  return (
    <Layout>
      <div
        dir="rtl"
        className="min-h-screen px-4 py-8 sm:px-6 lg:px-8"
        style={{
          color: colors.text,
          backgroundColor: colors.background,
          backgroundImage: `radial-gradient(circle at top right, ${colors.primary}18 0%, transparent 34%), radial-gradient(circle at bottom left, ${colors.tertiary}16 0%, transparent 28%)`,
        }}
      >
        <div className="mx-auto max-w-6xl space-y-6">
          <section
            className="overflow-hidden rounded-[34px] border shadow-[0_24px_80px_rgba(15,23,42,0.1)]"
            style={{ backgroundColor: colors.main, borderColor: `${colors.primary}16` }}
          >
            <div
              className="relative px-5 pb-8 pt-8 sm:px-8"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}22 0%, ${colors.tertiary}16 40%, ${colors.main} 100%)`,
              }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.45),transparent_55%)]" />
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold" style={{ backgroundColor: `${colors.primary}16`, color: colors.primary }}>
                    <Palette className="h-4 w-4" />
                    הגדרות מותאמות אישית
                  </div>
                  <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">בנה פרופיל שנראה כמו שלך</h1>
                  <p className="mt-3 max-w-2xl text-sm leading-7 opacity-80 sm:text-base">
                    שדרג את הפרופיל, התמונה והצבעים במקום אחד. כל שינוי כאן ישפיע על האווירה של כל האפליקציה.
                  </p>
                </div>

                <div className="rounded-[28px] border p-4" style={{ backgroundColor: `${colors.main}cc`, borderColor: `${colors.primary}16` }}>
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5" style={{ color: colors.primary }} />
                    <div>
                      <p className="text-sm font-semibold">התראות</p>
                      <p className="text-xs opacity-75">{user.wantsNotifications ? "פעילות" : "כבויות כרגע"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            <aside className="space-y-6">
              <section className="rounded-[30px] border p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]" style={{ backgroundColor: colors.main, borderColor: `${colors.primary}16` }}>
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <div className="overflow-hidden rounded-[30px] border-4 bg-white shadow-xl" style={{ borderColor: colors.main }}>
                      {pfp ? (
                        <Avatar icon={pfp} className="h-32 w-32 object-cover" />
                      ) : (
                        <div className="flex h-32 w-32 items-center justify-center" style={{ backgroundColor: colors.secondary }}>
                          <UserRound size={40} style={{ color: colors.primary }} />
                        </div>
                      )}
                    </div>
                    {pfp && (
                      <button
                        type="button"
                        onClick={handleRemovePFP}
                        className="absolute -bottom-2 -left-2 rounded-full p-3 text-white shadow-lg transition hover:opacity-90"
                        style={{ backgroundColor: "#ef4444" }}
                        aria-label="הסר תמונה"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <p className="mt-5 text-xl font-semibold">{user.name}</p>
                  <p className="mt-1 text-sm opacity-75">{user.email}</p>

                  <input type="file" accept="image/*" ref={fileRef} className="hidden" />
                  <button
                    type="button"
                    onClick={handleChangePFP}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Camera className="h-4 w-4" />
                    {pfp ? "החלף תמונת פרופיל" : "הוסף תמונת פרופיל"}
                  </button>
                </div>
              </section>

              <ThemePreview palette={colors} userName={user.name || "השם שלך"} />
            </aside>

            <main className="space-y-6">
              <section className="rounded-[30px] border p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]" style={{ backgroundColor: colors.main, borderColor: `${colors.primary}16` }}>
                <h2 className="text-2xl font-semibold" style={{ color: colors.primary }}>פרטי פרופיל</h2>
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-2 block text-sm font-medium">שם</label>
                    <input
                      id="name"
                      type="text"
                      value={user.name}
                      onChange={(event) => setUser({ ...user, name: event.target.value })}
                      className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition"
                      style={{ borderColor: `${colors.primary}18`, color: colors.text, backgroundColor: colors.background }}
                      placeholder="הכנס את השם שלך"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-medium">דוא"ל</label>
                    <input
                      id="email"
                      type="email"
                      value={user.email}
                      onChange={(event) => setUser({ ...user, email: event.target.value })}
                      className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition"
                      style={{ borderColor: `${colors.primary}18`, color: colors.text, backgroundColor: colors.background }}
                      placeholder='הכנס כתובת דוא"ל'
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <label htmlFor="bio" className="mb-2 block text-sm font-medium">ביוגרפיה</label>
                  <textarea
                    id="bio"
                    rows={5}
                    value={user.bio}
                    onChange={(event) => setUser({ ...user, bio: event.target.value })}
                    className="w-full rounded-[24px] border px-4 py-3 text-sm leading-7 outline-none transition"
                    style={{ borderColor: `${colors.primary}18`, color: colors.text, backgroundColor: colors.background }}
                    placeholder="ספר קצת על עצמך"
                  />
                </div>
              </section>

              <section className="rounded-[30px] border p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]" style={{ backgroundColor: colors.main, borderColor: `${colors.primary}16` }}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold" style={{ color: colors.primary }}>התראות</h2>
                    <p className="mt-2 text-sm opacity-75">קבע אם לקבל התראות על הודעות ופעילות חדשה.</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      checked={user.wantsNotifications}
                      onChange={(event) => setUser({ ...user, wantsNotifications: event.target.checked })}
                      type="checkbox"
                      className="peer sr-only"
                    />
                    <div
                      className="h-7 w-14 rounded-full after:absolute after:right-[3px] after:top-[3px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:after:-translate-x-7"
                      style={{ backgroundColor: user.wantsNotifications ? colors.primary : "#d1d5db" }}
                    />
                  </label>
                </div>
              </section>

              <section className="rounded-[30px] border p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]" style={{ backgroundColor: colors.main, borderColor: `${colors.primary}16` }}>
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5" style={{ color: colors.primary }} />
                  <h2 className="text-2xl font-semibold" style={{ color: colors.primary }}>סטודיו צבעים</h2>
                </div>
                <p className="mt-2 text-sm leading-6 opacity-75">
                  ערוך כל צבע בנפרד, נסה ערכות מוכנות, וראה את התוצאה בזמן אמת לפני השמירה.
                </p>

                <div className="mt-6">
                  <PaletteLab colors={colors} onChange={setColors} onReset={() => setColors(DefaultPallate())} />
                </div>
              </section>

              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  type="button"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Check className="h-4 w-4" />
                  {isSaving ? "שומר..." : "שמור שינויים"}
                </button>
              </div>
            </main>
          </div>
        </div>
      </div>
    </Layout>
  )
}
