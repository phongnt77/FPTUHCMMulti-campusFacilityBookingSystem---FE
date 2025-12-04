import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

type LoginOption = 'account' | 'google'

interface LocationState {
  from?: {
    pathname: string;
  };
}

const LoginPage = () => {
  const [option, setOption] = useState<LoginOption>('account')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { login, loginWithGoogle, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Get the redirect path from location state, or default to /facilities
  const from = (location.state as LocationState)?.from?.pathname || '/facilities'

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate(from, { replace: true })
    return null
  }

  const handleAccountLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!username.trim()) {
      setError('Vui lòng nhập tên đăng nhập')
      return
    }

    if (!password) {
      setError('Vui lòng nhập mật khẩu')
      return
    }

    setLoading(true)
    const result = await login(username.trim(), password)
    setLoading(false)

    if (result.success) {
      setSuccess(result.message)
      setTimeout(() => {
        navigate(from, { replace: true })
      }, 500)
    } else {
      setError(result.message)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setSuccess('')

    // Simulate Google OAuth popup - in real app, this would open Google OAuth
    // For demo, we'll use a prompt or predefined email
    const testEmail = prompt(
      'Nhập email FPT để đăng nhập (demo):\n\nVí dụ:\n- student1@fpt.edu.vn\n- lecturer1@fpt.edu.vn',
      'student1@fpt.edu.vn'
    )

    if (!testEmail) return

    setLoading(true)
    const result = await loginWithGoogle(testEmail)
    setLoading(false)

    if (result.success) {
      setSuccess(result.message)
      setTimeout(() => {
        navigate(from, { replace: true })
      }, 500)
    } else {
      setError(result.message)
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl gap-10 rounded-2xl bg-white p-8 shadow-xl sm:grid-cols-[1.1fr,1fr] sm:p-10">
        <section>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            FPTU Multi‑campus Facility Booking
          </h1>
          <p className="mb-6 text-sm text-gray-600">
            Sign in to book classrooms, labs, and sport areas across HCM & NVH campuses.
          </p>

          <div className="mb-6 inline-flex rounded-full bg-gray-100 p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setOption('account')
                setError('')
                setSuccess('')
              }}
              className={`rounded-full px-4 py-2 transition ${
                option === 'account' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600'
              }`}
            >
              University account (K19+ students)
            </button>
            <button
              type="button"
              onClick={() => {
                setOption('google')
                setError('')
                setSuccess('')
              }}
              className={`rounded-full px-4 py-2 transition ${
                option === 'google' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600'
              }`}
            >
              FPT email (K18 students & lecturers)
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {option === 'account' ? (
            <form className="space-y-4" onSubmit={handleAccountLogin}>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. SE1001"
                  disabled={loading}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-orange-500 focus:border-orange-400 focus:ring-1 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-orange-500 focus:border-orange-400 focus:ring-1 disabled:bg-gray-100"
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-gray-600">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-3 w-3 rounded border-gray-300 text-orange-500" 
                  />
                  <span>Remember this device</span>
                </label>
                <button type="button" className="font-semibold text-orange-600 hover:text-orange-700">
                  Forgot password?
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang đăng nhập...</span>
                  </>
                ) : (
                  'Sign in with university account'
                )}
              </button>

              {/* Demo hint */}
              <div className="mt-4 rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
                <strong>Demo:</strong> Nhập username (VD: SE1001, LEC001) và bất kỳ password nào để đăng nhập.
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Use your official FPT email account (<strong>@fpt.edu.vn</strong>) to continue. This option is
                recommended for K18 students and lecturers.
              </p>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang đăng nhập...</span>
                  </>
                ) : (
                  <>
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-red-500 text-[10px] font-bold text-white">
                      G
                    </span>
                    <span>Sign in with FPT email</span>
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500">
                We only accept accounts that end with <strong>@fpt.edu.vn</strong>. Your email is used for
                authentication and booking notifications.
              </p>

              {/* Demo hint */}
              <div className="mt-4 rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
                <strong>Demo:</strong> Click nút trên và nhập email (VD: student1@fpt.edu.vn, lecturer1@fpt.edu.vn)
              </div>
            </div>
          )}
        </section>

        <aside className="hidden flex-col justify-between rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-purple-600 p-6 text-xs text-orange-50 sm:flex">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-orange-100">
              System highlights
            </p>
            <ul className="space-y-2">
              <li className="flex gap-2">
                <span className="mt-0.5 text-orange-200">•</span>
                <span>Book classrooms, labs, and sport facilities with real‑time availability.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 text-orange-200">•</span>
                <span>Integrated approval flow for special events and external activities.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 text-orange-200">•</span>
                <span>Usage history and booking statistics for better campus planning.</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 rounded-lg bg-white/10 p-4 backdrop-blur">
            <p className="mb-1 text-sm font-semibold text-white">Demo Accounts</p>
            <ul className="space-y-1">
              <li>• <strong>Students:</strong> SE1001, SE1002, SE1003</li>
              <li>• <strong>Lecturers:</strong> LEC001, LEC002, LEC003</li>
              <li>• <strong>Password:</strong> bất kỳ (demo mode)</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  )
}

export default LoginPage
