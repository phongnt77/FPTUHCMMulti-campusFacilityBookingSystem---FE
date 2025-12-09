import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
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
            Đăng nhập để đặt phòng phòng học, phòng lab và sân thể thao trên các campus Khu Công Nghệ Cao & NVH.
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
              Tài khoản đại học (sinh viên K19+)
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
              Email FPT (sinh viên K18 & giảng viên)
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
                  Tên đăng nhập
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="VD: SE1001"
                  disabled={loading}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-orange-500 focus:border-orange-400 focus:ring-1 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700" htmlFor="password">
                  Mật khẩu
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu của bạn"
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
                  <span>Nhớ thiết bị này</span>
                </label>
                <button type="button" className="font-semibold text-orange-600 hover:text-orange-700">
                  Quên mật khẩu?
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
                  'Đăng nhập với tài khoản đại học'
                )}
              </button>

              {/* Demo hint */}
              <div className="mt-4 rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
                <strong>Demo:</strong> Nhập tên đăng nhập (VD: SE1001, LEC001) và bất kỳ mật khẩu nào để đăng nhập.
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Sử dụng tài khoản email FPT (<strong>@fpt.edu.vn</strong>) để tiếp tục. Tùy chọn này được
                khuyến nghị cho sinh viên K18 và giảng viên.
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
                    <span>Đăng nhập với email FPT</span>
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500">
                Chúng tôi chỉ chấp nhận tài khoản mà email kết thúc với <strong>@fpt.edu.vn</strong>. Email của bạn được sử dụng để
                xác thực và thông báo đặt phòng.
              </p>

              {/* Demo hint */}
              <div className="mt-4 rounded-lg bg-blue-50 p-3 text-xs text-blue-800">
                <strong>Demo:</strong> Nhấp vào nút trên và nhập email (VD: student1@fpt.edu.vn, lecturer1@fpt.edu.vn)
              </div>
            </div>
          )}
        </section>

        <aside className="hidden flex-col justify-between rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-purple-600 p-6 text-xs text-orange-50 sm:flex">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-orange-100">
              Nổi bật của hệ thống
            </p>
            <ul className="space-y-2">
              <li className="flex gap-2">
                <span className="mt-0.5 text-orange-200">•</span>
                <span>Đặt phòng phòng học, phòng lab và sân thể thao với sự sẵn sàng thời gian thực.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 text-orange-200">•</span>
                <span>Dòng phê duyệt tích hợp cho sự kiện đặc biệt và hoạt động bên ngoài.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 text-orange-200">•</span>
                <span>Lịch sử sử dụng và thống kê đặt phòng để cải thiện kế hoạch campus.</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 rounded-lg bg-white/10 p-4 backdrop-blur">
            <p className="mb-1 text-sm font-semibold text-white">Tài khoản Demo</p>
            <ul className="space-y-1">
              <li>• <strong>Students:</strong> SE1001, SE1002, SE1003</li>
              <li>• <strong>Lecturers:</strong> LEC001, LEC002, LEC003</li>
              <li>• <strong>Mật khẩu:</strong> bất kỳ (chế độ demo)</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  )
}

export default LoginPage
