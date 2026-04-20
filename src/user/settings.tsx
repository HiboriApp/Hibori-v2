import { useCallback, useEffect, useRef, useState } from "react"
import { Bell, BellOff, Camera, Check, Palette, Paintbrush, RefreshCw, Save, Trash2, Type, UserRound } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { getUser, type UserData, setUser as setUserInDB } from "../api/db"
import { Avatar, GenerateIcons, type Icon, IconType } from "../api/icons"
import { DefaultPallate, type Pallate } from "../api/settings"
import { uploadString } from "../api/cloudinary"
import Loading from "../components/Loading"
import Layout from "../components/layout"
import Toast from "../components/Toast"

const paletteFields: Array<{
  key: "primary" | "text"
  label: string
  hint: string
  icon: typeof Paintbrush
}> = [
  { key: "primary", label: "צבע ראשי", hint: "כפתורים והדגשות", icon: Paintbrush },
  { key: "text", label: "צבע טקסט", hint: "כותרות ותוכן", icon: Type },
]

function PaletteLab({
  colors,
  onChange,
  onReset,
}: {
  colors: Pallate
  onChange: (colors: Pallate) => void
  onReset: () => void
}) {
  const [selectedKey, setSelectedKey] = useState<"primary" | "text">("primary")

  const selectedField = paletteFields.find((field) => field.key === selectedKey) ?? paletteFields[0]
  const swatches = {
    primary: ["#4caf50", "#22c55e", "#0ea5e9", "#0047AB", "#f97316", "#FF0000"],
    text: ["#000000", "#0f172a", "#1f2937", "#334155", "#ffffff", "#f8fafc"],
  }

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
            <field.icon className="h-4 w-4" style={{ color: selectedKey === field.key ? colors.primary : colors.text }} />
            <span className="h-4 w-4 rounded-full border" style={{ backgroundColor: colors[field.key], borderColor: `${colors.text}14` }} />
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
              {swatches[selectedKey].map((swatch) => (
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

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border px-4 py-3" style={{ backgroundColor: colors.background, borderColor: `${colors.primary}14` }}>
            <div className="flex items-center gap-2 text-sm font-medium" style={{ color: colors.text }}>
              <Paintbrush className="h-4 w-4" style={{ color: colors.primary }} />
              צבע ראשי
            </div>
            <p className="mt-2 text-xs opacity-70" style={{ color: colors.text }}>{colors.primary}</p>
          </div>
          <div className="rounded-2xl border px-4 py-3" style={{ backgroundColor: colors.background, borderColor: `${colors.primary}14` }}>
            <div className="flex items-center gap-2 text-sm font-medium" style={{ color: colors.text }}>
              <Type className="h-4 w-4" style={{ color: colors.primary }} />
              צבע טקסט
            </div>
            <p className="mt-2 text-xs opacity-70" style={{ color: colors.text }}>{colors.text}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function getIconSnapshot(icon: Icon | null) {
  if (!icon) {
    return null
  }

  return `${icon.type}:${icon.content}`
}

function getSettingsSnapshot(user: UserData, colors: Pallate, pfp: Icon | null, profileRemoved: boolean) {
  return JSON.stringify({
    name: user.name,
    email: user.email,
    bio: user.bio,
    wantsNotifications: user.wantsNotifications,
    colors,
    icon: profileRemoved ? null : getIconSnapshot(pfp),
  })
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [pfp, setPFP] = useState<Icon | null>(null)
  const [profileRemoved, setProfileRemoved] = useState(false)
  const [colors, setColors] = useState(DefaultPallate())
  const [isSaving, setIsSaving] = useState(false)
  const [initialSnapshot, setInitialSnapshot] = useState("")
  const [showSavedState, setShowSavedState] = useState(false)
  const [toastState, setToastState] = useState<{ open: boolean; message: string; variant: "notifications-on" | "notifications-off" }>({
    open: false,
    message: "",
    variant: "notifications-on",
  })
  const fileRef = useRef<HTMLInputElement>(null)
  const savedStateTimeout = useRef<number | null>(null)
  const navigate = useNavigate()

  const closeToast = useCallback(() => {
    setToastState((current) => ({ ...current, open: false }))
  }, [])

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

  const handleToggleNotifications = () => {
    if (!user) return

    const wantsNotifications = !user.wantsNotifications
    setUser({ ...user, wantsNotifications })
    setToastState({
      open: true,
      message: wantsNotifications ? "ההתראות הופעלו" : "ההתראות כובו",
      variant: wantsNotifications ? "notifications-on" : "notifications-off",
    })
  }

  const handleSave = async () => {
    if (!user) return

    const hasChanges = getSettingsSnapshot(user, colors, pfp, profileRemoved) !== initialSnapshot
    if (!hasChanges) return

    setIsSaving(true)
    const nextIcon = pfp ?? (profileRemoved ? await GenerateIcons(user.id) : user.icon ?? await GenerateIcons(user.id))

    const nextUser = {
      ...user,
      pallate: colors,
      icon: nextIcon,
    }

    await setUserInDB(nextUser)

    if (typeof window !== "undefined") {
      window.localStorage.setItem("hibori-theme-primary", colors.primary)
    }

    if (savedStateTimeout.current) {
      window.clearTimeout(savedStateTimeout.current)
    }

    setUser(nextUser)
    setPFP(nextIcon)
    setProfileRemoved(false)
    setInitialSnapshot(getSettingsSnapshot(nextUser, colors, nextIcon, false))
    setIsSaving(false)
    setShowSavedState(true)
    savedStateTimeout.current = window.setTimeout(() => {
      setShowSavedState(false)
      savedStateTimeout.current = null
    }, 1800)
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
      const nextColors = userData.pallate ?? DefaultPallate()
      setColors(nextColors)
      setInitialSnapshot(getSettingsSnapshot(userData, nextColors, userData.icon ?? null, false))
    }

    fetchData()
  }, [navigate])

  useEffect(() => {
    return () => {
      if (savedStateTimeout.current) {
        window.clearTimeout(savedStateTimeout.current)
      }
    }
  }, [])

  if (!user) {
    return <Loading />
  }

  const hasChanges = getSettingsSnapshot(user, colors, pfp, profileRemoved) !== initialSnapshot
  const saveLabel = isSaving ? "שומר" : showSavedState ? "נשמר" : hasChanges ? "שמור" : "ללא שינוי"
  const saveIcon = isSaving ? <RefreshCw className="h-4 w-4 animate-spin" /> : showSavedState ? <Check className="h-4 w-4 animate-pulse" /> : hasChanges ? <Save className="h-4 w-4" /> : <Check className="h-4 w-4" />
  const saveStyles = isSaving
    ? { backgroundColor: colors.text, borderColor: colors.text, color: colors.main }
    : showSavedState
      ? { backgroundColor: "#22c55e", borderColor: "#16a34a", color: "#ffffff" }
      : hasChanges
        ? { backgroundColor: "#ef4444", borderColor: "#dc2626", color: "#ffffff" }
        : { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}18`, color: colors.text }

  return (
    <Layout>
      <Toast open={toastState.open} message={toastState.message} variant={toastState.variant} tone="success" onClose={closeToast} />
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
            className="overflow-hidden rounded-[34px] border shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
            style={{ backgroundColor: colors.main, borderColor: `${colors.primary}14` }}
          >
            <div
              className="relative px-5 py-6 sm:px-8"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}16 0%, ${colors.background} 60%, ${colors.main} 100%)`,
              }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.38),transparent_55%)]" />
              <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: `${colors.primary}14`, color: colors.primary }}>
                    <Palette className="h-5 w-5" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold sm:text-3xl">הגדרות פרופיל</h1>
                    <p className="mt-1 text-sm opacity-70">ערוך פרטים, תמונה וצבעים.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleNotifications}
                  className="inline-flex items-center justify-center rounded-[20px] border px-4 py-3 transition hover:-translate-y-0.5"
                  style={{
                    backgroundColor: user.wantsNotifications ? "#22c55e" : "#9ca3af",
                    borderColor: user.wantsNotifications ? "#16a34a" : "#9ca3af",
                    color: "#ffffff",
                  }}
                  aria-label={user.wantsNotifications ? "כבה התראות" : "הפעל התראות"}
                >
                  {user.wantsNotifications ? (
                    <Bell className="h-5 w-5 shrink-0" />
                  ) : (
                    <BellOff className="h-5 w-5 shrink-0" />
                  )}
                </button>
              </div>
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)] xl:items-start">
            <aside className="space-y-6 xl:sticky xl:top-6 self-start">
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

              <section className="rounded-[26px] border p-3 shadow-[0_14px_36px_rgba(15,23,42,0.08)]" style={{ backgroundColor: colors.main, borderColor: `${colors.primary}16` }}>
                <button
                  onClick={handleSave}
                  type="button"
                  disabled={isSaving || !hasChanges}
                  className="flex w-full items-center justify-center gap-2 rounded-[20px] border px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  style={saveStyles}
                  aria-label={hasChanges ? "שמור שינויים" : "אין שינויים לשמירה"}
                >
                  {saveIcon}
                  {saveLabel}
                </button>
              </section>

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
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5" style={{ color: colors.primary }} />
                  <h2 className="text-2xl font-semibold" style={{ color: colors.primary }}>צבעים</h2>
                </div>
                <p className="mt-2 text-sm leading-6 opacity-75">
                  שנה את הצבע הראשי ואת צבע הטקסט, ראה את התוצאה מיד, ואם צריך אפשר לאפס בלחיצה אחת.
                </p>

                <div className="mt-6">
                  <PaletteLab colors={colors} onChange={setColors} onReset={() => setColors(DefaultPallate())} />
                </div>
              </section>
            </main>
          </div>
        </div>
      </div>
    </Layout>
  )
}
