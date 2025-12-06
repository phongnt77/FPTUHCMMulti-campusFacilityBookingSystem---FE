import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import type { CredentialResponse } from '@react-oauth/google'
import { loginAPI } from './api/loginAPI'
import { loginWithGoogle } from './api/emailLoginApi'
import EmailVerificationModal from './components/EmailVerificationModal'
import ForgotPasswordModal from './components/ForgotPasswordModal'
import ResetPasswordModal from './components/ResetPasswordModal'
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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState('')
  const [pendingIdToken, setPendingIdToken] = useState<string | null>(null)
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false)
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false)
  const [resetPasswordEmail, setResetPasswordEmail] = useState('')

  const navigate = useNavigate()
  const location = useLocation()

  // Get the redirect path from location state, or default to /facilities
  const from = (location.state as LocationState)?.from?.pathname || '/facilities'

  // Check if user is already authenticated (has token in localStorage)
  // Sử dụng useEffect để tránh gọi navigate trong quá trình render
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      navigate(from, { replace: true })
    }
  }, [navigate, from])

  const handleAccountLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!username.trim()) {
      setError('Vui lòng nhập email hoặc tên đăng nhập')
      return
    }

    if (!password) {
      setError('Vui lòng nhập mật khẩu')
      return
    }

    setLoading(true)
    const result = await loginAPI(username.trim(), password)
    setLoading(false)

    if (result.success) {
      setSuccess(result.message)
      // Dispatch event to notify components to refresh user state
      window.dispatchEvent(new Event('auth:loginSuccess'))
      setTimeout(() => {
        navigate(from, { replace: true })
      }, 500)
    } else {
      setError(result.message)
    }
  }

  /**
   * Xử lý khi Google OAuth login thành công
   * GoogleLogin component sẽ gọi callback này với CredentialResponse chứa credential (id_token)
   */
  const handleGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    setError('');
    setSuccess('');

    if (!credentialResponse.credential) {
      setError('Không thể lấy thông tin từ Google. Vui lòng thử lại.');
      return;
    }

    try {
      setLoading(true);
      const result = await loginWithGoogle(credentialResponse.credential);
      setLoading(false);

      if (result.success) {
        // Nếu cần xác thực email
        if (result.needsVerification && result.email) {
          setVerificationEmail(result.email);
          setPendingIdToken(credentialResponse.credential); // Lưu idToken để dùng lại sau khi verify
          setShowVerificationModal(true);
          setSuccess(result.message);
        } 
        // Nếu đã verify, đăng nhập thành công
        else if (result.data) {
          setSuccess(result.message);
          window.dispatchEvent(new Event('auth:loginSuccess'));
          setTimeout(() => {
            navigate(from, { replace: true });
          }, 500);
        }
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Google login error:', error);
      setError('Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  /**
   * Xử lý khi Google OAuth login thất bại
   */
  const handleGoogleLoginError = () => {
    setError('Đăng nhập bằng Google thất bại. Vui lòng thử lại.');
  };

  /**
   * Xử lý sau khi verify email thành công
   * Gọi lại loginWithGoogle để lấy token sau khi verify
   */
  const handleEmailVerified = async () => {
    if (!pendingIdToken) {
      setError('Không tìm thấy thông tin đăng nhập. Vui lòng thử lại.');
      setShowVerificationModal(false);
      return;
    }

    setShowVerificationModal(false);
    setLoading(true);
    setError('');
    setSuccess('Email đã được xác thực! Đang đăng nhập...');
    
    // Gọi lại loginWithGoogle với idToken đã lưu
    const result = await loginWithGoogle(pendingIdToken);
    setLoading(false);
    setPendingIdToken(null);

    if (result.success && result.data) {
      setSuccess('Đăng nhập thành công!');
      window.dispatchEvent(new Event('auth:loginSuccess'));
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 500);
    } else {
      setError(result.message || 'Đăng nhập thất bại sau khi xác thực email.');
    }
  };

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
              Tài khoản được cấp (sinh viên K19+ và quản trị viên)
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
                <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {option === 'account' ? (
            <form className="space-y-4" onSubmit={handleAccountLogin}>
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700" htmlFor="username">
                  Email/Tên đăng nhập
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
                <button 
                  type="button" 
                  onClick={() => setShowForgotPasswordModal(true)}
                  className="font-semibold text-orange-600 hover:text-orange-700"
                >
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
                  'Đăng nhập với tài khoản được cấp'
                )}
              </button>

            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Sử dụng tài khoản email FPT (<strong>@fpt.edu.vn hoặc fe.edu.vn</strong>) để tiếp tục. Tùy chọn này được
                khuyến nghị cho sinh viên K18 và giảng viên.
              </p>
              {loading ? (
                <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang đăng nhập...</span>
                </div>
              ) : (
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleLoginSuccess}
                    onError={handleGoogleLoginError}
                    useOneTap={false}
                    theme="outline"
                    size="large"
                    text="signin_with"
                    shape="rectangular"
                    logo_alignment="left"
                  />
                </div>
              )}
              <p className="text-xs text-gray-500">
                Chúng tôi chỉ chấp nhận tài khoản mà email kết thúc với <strong>@fpt.edu.vn hoặc fe.edu.vn</strong>. Email của bạn được sử dụng để
                xác thực và thông báo đặt phòng.
              </p>

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

        </aside>
      </div>

      {/* Email Verification Modal */}
      {showVerificationModal && verificationEmail && (
        <EmailVerificationModal
          email={verificationEmail}
          onVerified={handleEmailVerified}
          onClose={() => {
            setShowVerificationModal(false);
            setVerificationEmail('');
          }}
        />
      )}

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <ForgotPasswordModal
          onClose={() => {
            setShowForgotPasswordModal(false);
            setResetPasswordEmail('');
          }}
          onCodeSent={(email) => {
            setResetPasswordEmail(email);
            setShowForgotPasswordModal(false);
            setShowResetPasswordModal(true);
          }}
        />
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && resetPasswordEmail && (
        <ResetPasswordModal
          email={resetPasswordEmail}
          onClose={() => {
            setShowResetPasswordModal(false);
            setResetPasswordEmail('');
          }}
          onSuccess={() => {
            setShowResetPasswordModal(false);
            setResetPasswordEmail('');
            setSuccess('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.');
          }}
        />
      )}
    </main>
  )
}

export default LoginPage
