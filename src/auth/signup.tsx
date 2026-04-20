import { useEffect, useMemo, useState } from "react"
import type { ComponentType, ReactNode } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { onAuthStateChanged } from "firebase/auth"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  KeyRound,
  Lock,
  Mail,
  Paintbrush,
  PenSquare,
  School,
  Sparkles,
  Type,
  UserRound,
} from "lucide-react"
import { SignUp } from "../api/auth"
import { auth } from "../api/firebase"
import { DefaultPallate, type Pallate } from "../api/settings"

type SignupDraft = {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  classroomId: string
  bio: string
  pallate: Pallate
}

const STORAGE_KEY = "hibori-signup-draft"

const defaultDraft = (): SignupDraft => ({
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  classroomId: "",
  bio: "",
  pallate: DefaultPallate(),
})

const primarySwatches = ["#4caf50", "#22c55e", "#0ea5e9", "#f97316", "#ef4444", "#8b5cf6"]
const textSwatches = ["#000000", "#0f172a", "#1f2937", "#334155", "#ffffff", "#f8fafc"]

const stageRoutes = {
  credentials: "/signup/credentials",
  classroom: "/signup/classroom",
  profileTheme: "/signup/profile-theme",
} as const

const stageMeta = [
  { key: "credentials", label: "חשבון", icon: UserRound },
  { key: "classroom", label: "כיתה", icon: School },
  { key: "profileTheme", label: "פרופיל", icon: Sparkles },
] as const

function readDraftFromStorage() {
  if (typeof window === "undefined") return defaultDraft()

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultDraft()

    const parsed = JSON.parse(raw) as Partial<SignupDraft>
    return {
      ...defaultDraft(),
      ...parsed,
      pallate: {
        ...DefaultPallate(),
        ...(parsed.pallate || {}),
      },
    }
  } catch {
    return defaultDraft()
  }
}

type FieldShellProps = {
  icon: ComponentType<{ className?: string }>
  active: boolean
  colors: Pallate
  children: ReactNode
}

function FieldShell({ icon: Icon, active, colors, children }: FieldShellProps) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 transition"
      style={{ backgroundColor: active ? `${colors.primary}10` : colors.main }}
    >
      <div
        className="flex h-9 w-9 items-center justify-center rounded-xl transition"
        style={{
          backgroundColor: active ? `${colors.primary}22` : `${colors.primary}12`,
          color: active ? colors.primary : `${colors.text}aa`,
        }}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}

export function SignUpPage() {
  const [draft, setDraft] = useState<SignupDraft>(() => readDraftFromStorage())
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [focusedField, setFocusedField] = useState("")
  const location = useLocation()
  const navigate = useNavigate()

  const stage = useMemo<"credentials" | "classroom" | "profileTheme">(() => {
    if (location.pathname.endsWith("/classroom")) return "classroom"
    if (location.pathname.endsWith("/profile-theme")) return "profileTheme"
    return "credentials"
  }, [location.pathname])

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/home")
      }
    })
  }, [navigate])

  useEffect(() => {
    if (typeof window === "undefined") return
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  }, [draft])

  useEffect(() => {
    if (stage === "classroom") {
      if (!draft.fullName.trim() || !draft.email.trim() || !draft.password.trim() || !draft.confirmPassword.trim()) {
        navigate(stageRoutes.credentials, { replace: true })
      }
    }

    if (stage === "profileTheme") {
      if (!draft.classroomId.trim()) {
        navigate(stageRoutes.classroom, { replace: true })
      }
    }
  }, [draft.classroomId, draft.confirmPassword, draft.email, draft.fullName, draft.password, navigate, stage])

  const setField = <K extends keyof SignupDraft>(field: K, value: SignupDraft[K]) => {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  const goToClassroom = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (draft.password !== draft.confirmPassword) {
      setError("הסיסמאות לא תואמות")
      return
    }

    navigate(stageRoutes.classroom)
  }

  const goToProfileTheme = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!draft.classroomId.trim()) {
      setError("יש להזין מזהה כיתה")
      return
    }

    navigate(stageRoutes.profileTheme)
  }

  const completeSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!draft.bio.trim()) {
      setError("תיאור הוא שדה חובה")
      return
    }

    setIsSubmitting(true)
    try {
      await SignUp(draft.email, draft.password, draft.fullName, draft.classroomId.trim(), draft.bio.trim(), draft.pallate)
      if (typeof window !== "undefined") {
        window.localStorage.setItem("hibori-theme-primary", draft.pallate.primary)
        window.sessionStorage.removeItem(STORAGE_KEY)
      }
      navigate("/home")
    } catch {
      setError("אירעה שגיאה בהרשמה, נסה שוב")
    } finally {
      setIsSubmitting(false)
    }
  }

  const stepNumber = stage === "credentials" ? 1 : stage === "classroom" ? 2 : 3

  return (
    <div
      className="min-h-screen px-4 pb-28 pt-8 sm:px-6"
      style={{
        backgroundColor: draft.pallate.background,
        backgroundImage: `radial-gradient(circle at top right, ${draft.pallate.primary}20 0%, transparent 48%), radial-gradient(circle at bottom left, ${draft.pallate.tertiary}18 0%, transparent 38%)`,
      }}
      dir="rtl"
    >
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: draft.pallate.primary }}>
              Hibori Sign Up
            </p>
            <h1 className="mt-2 text-4xl font-semibold" style={{ color: draft.pallate.text }}>
              הרשמה בשלושה שלבים
            </h1>
            <p className="mt-2 text-sm opacity-75" style={{ color: draft.pallate.text }}>
              בונים חשבון חדש, כיתה, ואז טאץ׳ אישי לפרופיל.
            </p>
          </div>

          <span
            className="inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold"
            style={{ backgroundColor: `${draft.pallate.primary}16`, color: draft.pallate.primary }}
          >
            <Sparkles className="h-4 w-4" />
            שלב {stepNumber} מתוך 3
          </span>
        </header>

        {stage === "credentials" && (
          <form className="space-y-5" onSubmit={goToClassroom}>
            <section
              className="overflow-hidden rounded-[26px] border"
              style={{ borderColor: `${draft.pallate.primary}22`, backgroundColor: `${draft.pallate.main}e8` }}
            >
              <FieldShell icon={UserRound} active={focusedField === "fullName"} colors={draft.pallate}>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={draft.fullName}
                  onFocus={() => setFocusedField("fullName")}
                  onBlur={() => setFocusedField("")}
                  onChange={(e) => setField("fullName", e.target.value)}
                  placeholder="שם משתמש"
                  className="auth-modern-input w-full bg-transparent text-sm outline-none"
                  style={{ color: draft.pallate.text }}
                />
              </FieldShell>
              <div className="h-px" style={{ backgroundColor: `${draft.pallate.primary}18` }} />

              <FieldShell icon={Mail} active={focusedField === "email"} colors={draft.pallate}>
                <input
                  id="email"
                  type="email"
                  required
                  value={draft.email}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField("")}
                  onChange={(e) => setField("email", e.target.value)}
                  placeholder="אימייל"
                  className="auth-modern-input w-full bg-transparent text-sm outline-none"
                  style={{ color: draft.pallate.text }}
                />
              </FieldShell>
              <div className="h-px" style={{ backgroundColor: `${draft.pallate.primary}18` }} />

              <FieldShell icon={Lock} active={focusedField === "password"} colors={draft.pallate}>
                <input
                  id="password"
                  type="password"
                  required
                  value={draft.password}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField("")}
                  onChange={(e) => setField("password", e.target.value)}
                  placeholder="סיסמה"
                  className="auth-modern-input w-full bg-transparent text-sm outline-none"
                  style={{ color: draft.pallate.text }}
                />
              </FieldShell>
              <div className="h-px" style={{ backgroundColor: `${draft.pallate.primary}18` }} />

              <FieldShell icon={KeyRound} active={focusedField === "confirmPassword"} colors={draft.pallate}>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={draft.confirmPassword}
                  onFocus={() => setFocusedField("confirmPassword")}
                  onBlur={() => setFocusedField("")}
                  onChange={(e) => setField("confirmPassword", e.target.value)}
                  placeholder="אימות סיסמה"
                  className="auth-modern-input w-full bg-transparent text-sm outline-none"
                  style={{ color: draft.pallate.text }}
                />
              </FieldShell>
            </section>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: draft.pallate.primary }}
            >
              המשך
              <ArrowLeft className="h-4 w-4" />
            </button>
          </form>
        )}

        {stage === "classroom" && (
          <form className="space-y-5" onSubmit={goToProfileTheme}>
            <section
              className="overflow-hidden rounded-[26px] border"
              style={{ borderColor: `${draft.pallate.primary}22`, backgroundColor: `${draft.pallate.main}e8` }}
            >
              <FieldShell icon={School} active={focusedField === "classroomId"} colors={draft.pallate}>
                <input
                  id="classroomId"
                  type="text"
                  required
                  value={draft.classroomId}
                  onFocus={() => setFocusedField("classroomId")}
                  onBlur={() => setFocusedField("")}
                  onChange={(e) => setField("classroomId", e.target.value)}
                  placeholder="Classroom ID"
                  className="auth-modern-input w-full bg-transparent text-sm outline-none"
                  style={{ color: draft.pallate.text }}
                />
              </FieldShell>
            </section>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate(stageRoutes.credentials)}
                className="inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
                style={{ borderColor: `${draft.pallate.primary}26`, color: draft.pallate.text }}
              >
                <ArrowRight className="h-4 w-4" />
                חזרה
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: draft.pallate.primary }}
              >
                המשך
                <ArrowLeft className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}

        {stage === "profileTheme" && (
          <form className="space-y-6" onSubmit={completeSignup}>
            <section
              className="overflow-hidden rounded-[26px] border"
              style={{ borderColor: `${draft.pallate.primary}22`, backgroundColor: `${draft.pallate.main}e8` }}
            >
              <FieldShell icon={PenSquare} active={focusedField === "bio"} colors={draft.pallate}>
                <textarea
                  id="bio"
                  rows={4}
                  required
                  value={draft.bio}
                  onFocus={() => setFocusedField("bio")}
                  onBlur={() => setFocusedField("")}
                  onChange={(e) => setField("bio", e.target.value)}
                  placeholder="תיאור קצר עליך"
                  className="w-full resize-none bg-transparent text-sm leading-6 outline-none"
                  style={{ color: draft.pallate.text }}
                />
              </FieldShell>
            </section>

            <section
              className="rounded-[24px] border p-5"
              style={{ borderColor: `${draft.pallate.primary}24`, backgroundColor: `${draft.pallate.main}e8` }}
            >
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold" style={{ color: draft.pallate.primary }}>
                <Paintbrush className="h-4 w-4" />
                צבעים לפרופיל
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-xs font-semibold" style={{ color: draft.pallate.text }}>
                    <Sparkles className="h-3.5 w-3.5" />
                    צבע ראשי
                  </label>
                  <input
                    type="color"
                    value={draft.pallate.primary}
                    onChange={(e) => setField("pallate", { ...draft.pallate, primary: e.target.value })}
                    className="h-12 w-full cursor-pointer rounded-xl border p-1"
                    style={{ borderColor: `${draft.pallate.primary}25` }}
                  />
                  <div className="mt-2 flex gap-2">
                    {primarySwatches.map((swatch) => (
                      <button
                        key={swatch}
                        type="button"
                        onClick={() => setField("pallate", { ...draft.pallate, primary: swatch })}
                        className="h-7 w-7 rounded-full border transition hover:scale-110"
                        style={{ backgroundColor: swatch, borderColor: swatch === draft.pallate.primary ? draft.pallate.text : "transparent" }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-xs font-semibold" style={{ color: draft.pallate.text }}>
                    <Type className="h-3.5 w-3.5" />
                    צבע טקסט
                  </label>
                  <input
                    type="color"
                    value={draft.pallate.text}
                    onChange={(e) => setField("pallate", { ...draft.pallate, text: e.target.value })}
                    className="h-12 w-full cursor-pointer rounded-xl border p-1"
                    style={{ borderColor: `${draft.pallate.primary}25` }}
                  />
                  <div className="mt-2 flex gap-2">
                    {textSwatches.map((swatch) => (
                      <button
                        key={swatch}
                        type="button"
                        onClick={() => setField("pallate", { ...draft.pallate, text: swatch })}
                        className="h-7 w-7 rounded-full border transition hover:scale-110"
                        style={{ backgroundColor: swatch, borderColor: swatch === draft.pallate.text ? draft.pallate.primary : "transparent" }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div
                className="mt-4 rounded-2xl border px-4 py-4"
                style={{ borderColor: `${draft.pallate.primary}20`, backgroundColor: draft.pallate.main, color: draft.pallate.text }}
              >
                <p className="text-sm font-semibold">תצוגה</p>
                <div
                  className="mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-white"
                  style={{ backgroundColor: draft.pallate.primary }}
                >
                  <UserRound className="h-3.5 w-3.5" />
                  Hibori
                </div>
              </div>
            </section>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate(stageRoutes.classroom)}
                className="inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
                style={{ borderColor: `${draft.pallate.primary}26`, color: draft.pallate.text }}
              >
                <ArrowRight className="h-4 w-4" />
                חזרה
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-65"
                style={{ backgroundColor: draft.pallate.primary }}
              >
                <Check className="h-4 w-4" />
                {isSubmitting ? "יוצר חשבון..." : "סיום והרשמה"}
              </button>
            </div>
          </form>
        )}

        {error && <p className="mt-5 text-sm font-medium text-red-600">{error}</p>}

        <div className="mt-7 text-sm" style={{ color: draft.pallate.text }}>
          כבר יש לך חשבון?{" "}
          <Link to="/login" className="font-semibold" style={{ color: draft.pallate.primary }}>
            התחבר
          </Link>
        </div>
      </div>

      <div className="fixed bottom-4 left-4 right-4 z-20">
        <div
          className="mx-auto max-w-5xl rounded-2xl border px-3 py-3 backdrop-blur-sm"
          style={{ backgroundColor: `${draft.pallate.main}d8`, borderColor: `${draft.pallate.primary}2a` }}
        >
          <div className="grid grid-cols-3 gap-2">
            {stageMeta.map((meta, index) => {
              const step = index + 1
              const active = step === stepNumber
              const complete = step < stepNumber
              const Icon = meta.icon
              return (
                <div
                  key={meta.key}
                  className="flex items-center justify-center gap-2 py-2 text-xs font-semibold transition"
                  style={{
                    color: complete || active ? "#ffffff" : draft.pallate.text,
                    backgroundColor: complete || active ? draft.pallate.primary : `${draft.pallate.primary}16`,
                    clipPath: "polygon(12px 0, 100% 0, calc(100% - 12px) 50%, 100% 100%, 12px 100%, 0 50%)",
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {meta.label}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage
