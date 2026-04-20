import { useEffect, useState } from "react"
import { Login } from "../api/auth"
import { Link, useNavigate } from "react-router-dom"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../api/firebase"
import { ArrowLeft, Lock, LogIn, Mail, Sparkles } from "lucide-react"

const LoginForm = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [focusedField, setFocusedField] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/home")
      }
    })
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      const res = await Login(email, password)
      if (res) {
        navigate("/home")
      } else {
        setError("דוא\"ל או סיסמה שגויים")
      }
    } catch {
      setError("דוא\"ל או סיסמה שגויים")
    }
  }

  return (
    <div
      className="min-h-screen px-4 py-10 sm:px-6"
      dir="rtl"
      style={{
        backgroundColor: "#f7faf7",
        backgroundImage: "radial-gradient(circle at top right, rgba(76,175,80,0.18) 0%, transparent 46%), radial-gradient(circle at bottom left, rgba(102,187,106,0.2) 0%, transparent 38%)",
      }}
    >
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-600">Hibori Login</p>
          <h1 className="mt-2 text-4xl font-semibold text-slate-900">ברוך הבא חזרה</h1>
          <p className="mt-2 text-sm text-slate-700/80">התחברות מהירה עם העיצוב החדש.</p>
        </header>

        <main className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <form onSubmit={handleSubmit} className="space-y-5">
            <section className="overflow-hidden rounded-[26px] border border-green-200 bg-white/85 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm">
              <div
                className="flex items-center gap-3 px-4 py-3 transition"
                style={{ backgroundColor: focusedField === "email" ? "rgba(76,175,80,0.08)" : "transparent" }}
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl transition"
                  style={{
                    backgroundColor: focusedField === "email" ? "rgba(76,175,80,0.2)" : "rgba(76,175,80,0.12)",
                    color: focusedField === "email" ? "#4caf50" : "#3f3f46",
                  }}
                >
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField("")}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="אימייל"
                  className="auth-modern-input w-full bg-transparent text-sm text-slate-900 outline-none"
                  required
                />
              </div>

              <div className="h-px bg-green-100" />

              <div
                className="flex items-center gap-3 px-4 py-3 transition"
                style={{ backgroundColor: focusedField === "password" ? "rgba(76,175,80,0.08)" : "transparent" }}
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl transition"
                  style={{
                    backgroundColor: focusedField === "password" ? "rgba(76,175,80,0.2)" : "rgba(76,175,80,0.12)",
                    color: focusedField === "password" ? "#4caf50" : "#3f3f46",
                  }}
                >
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField("")}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="סיסמה"
                  className="auth-modern-input w-full bg-transparent text-sm text-slate-900 outline-none"
                  required
                />
              </div>
            </section>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-green-500 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <LogIn className="h-4 w-4" />
              התחבר
              <ArrowLeft className="h-4 w-4" />
            </button>

            {error && <p className="text-sm font-medium text-red-600">{error}</p>}

            <p className="text-sm text-slate-700">
              אין לך חשבון?{" "}
              <Link to="/signup/credentials" className="font-semibold text-green-600 hover:underline">
                הירשם עכשיו
              </Link>
            </p>
          </form>

          <section className="rounded-[28px] border border-green-200 bg-white/70 p-6 shadow-[0_18px_52px_rgba(15,23,42,0.06)] backdrop-blur-sm">
            <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              <Sparkles className="h-3.5 w-3.5" />
              זרימה חדשה ונקייה
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-slate-900">הכל מחובר על מסך אחד</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700/80">
              טופס מודרני עם שדות מחוברים, פוקוס אינטראקטיבי ואותה שפה עיצובית של ההרשמה החדשה.
            </p>
          </section>
        </main>
      </div>
    </div>
  )
}

export default LoginForm
