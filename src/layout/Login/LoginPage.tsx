import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { loginAPI } from './api/loginAPI'
import { loginWithGoogle } from './api/emailLoginApi'
import { useToast } from '../../components/toast'
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
  const { showSuccess, showError } = useToast()
  
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
  // QUAN TRỌNG: Nếu from là admin route, chỉ dùng nếu user là Admin/Facility_Manager
  // Nếu không, dùng default route dựa trên role
  const getDefaultRoute = (userRole?: string): string => {
    if (userRole === 'Admin' || userRole === 'Facility_Manager') {
      return '/admin/dashboard';
    }
    return '/facilities';
  };

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

    // QUAN TRỌNG: Đảm bảo clear tất cả token cũ trước khi login
    // Điều này ngăn chặn race condition với các request đang pending
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('is_google_login');

    setLoading(true)
    const result = await loginAPI(username.trim(), password)
    setLoading(false)

    if (result.success) {
      setSuccess(result.message)
      showSuccess(result.message)
      // Dispatch event to notify components to refresh user state
      window.dispatchEvent(new Event('auth:loginSuccess'))
      
      // Đợi một chút để đảm bảo localStorage và state đều được update
      setTimeout(() => {
        // Lấy user từ localStorage sau khi đã lưu
        const savedUser = localStorage.getItem('auth_user');
        let userRole = 'Student';
        
        if (savedUser) {
          try {
            const authUser = JSON.parse(savedUser);
            // Map roleId sang role
            const roleMap: Record<string, string> = {
              'RL0001': 'Student',
              'RL0002': 'Lecturer',
              'RL0003': 'Facility_Manager',
              // Có thể có roleId khác cho Admin, cần kiểm tra với backend
            };
            userRole = roleMap[authUser.roleId] || 'Student';
          } catch (e) {
            console.error('Error parsing user role:', e);
          }
        }
        
        // Xác định route redirect dựa trên role
        // Nếu from là admin route nhưng user không phải Admin/Facility_Manager, redirect về route mặc định
        let redirectPath = from;
        if (from.startsWith('/admin') && userRole !== 'Admin' && userRole !== 'Facility_Manager') {
          redirectPath = getDefaultRoute(userRole);
        } else if (!from.startsWith('/admin') && (userRole === 'Admin' || userRole === 'Facility_Manager')) {
          // Nếu user là Admin/Facility_Manager nhưng from không phải admin route, redirect về admin dashboard
          redirectPath = '/admin/dashboard';
        }
        
        navigate(redirectPath, { replace: true })
      }, 500)
    } else {
      setError(result.message)
      showError(result.message)
    }
  }

  // Load Google Identity Services script
  const googleScriptLoaded = useRef(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  /**
   * Initialize Google Sign In
   * QUAN TRỌNG: ClientID ở frontend PHẢI KHỚP với ClientID trong appsettings.json của backend
   * Nếu không khớp sẽ gây lỗi "JWT contains untrusted 'aud' claim"
   * Backend đã config ClientID, frontend chỉ cần lấy idToken và gửi lên backend để verify
   */
  const initializeGoogleSignIn = () => {
    if (typeof window.google === 'undefined' || !window.google.accounts || !googleButtonRef.current) {
      return;
    }

    // Lấy ClientID từ env - PHẢI KHỚP với backend
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    
    if (!clientId) {
      console.warn('Google Client ID chưa được cấu hình trong .env');
      setError('Google Client ID chưa được cấu hình. Vui lòng liên hệ quản trị viên.');
      return;
    }

    try {
      // Clear button trước khi render lại
      googleButtonRef.current.innerHTML = '';

      // Initialize Google Identity Services
      // Không verify JWT ở frontend, chỉ lấy idToken và gửi lên backend
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleLoginSuccess,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Render button vào div
      window.google.accounts.id.renderButton(
        googleButtonRef.current,
        {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
        }
      );
    } catch (error) {
      console.error('Google initialization error:', error);
    }
  };

  useEffect(() => {
    if (option === 'google' && !googleScriptLoaded.current) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        googleScriptLoaded.current = true;
        // Đợi một chút để đảm bảo Google API đã sẵn sàng
        setTimeout(() => {
          initializeGoogleSignIn();
        }, 100);
      };
      document.body.appendChild(script);

      return () => {
        // Cleanup script if component unmounts
        const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
        if (existingScript && existingScript.parentNode) {
          existingScript.parentNode.removeChild(existingScript);
        }
      };
    } else if (option === 'google' && googleScriptLoaded.current && googleButtonRef.current) {
      // Nếu script đã load, initialize ngay
      // Đảm bảo disable auto-select trước khi initialize lại để tránh sử dụng session cũ
      if (typeof window.google !== 'undefined' && window.google.accounts) {
        try {
          window.google.accounts.id.disableAutoSelect();
        } catch (error) {
          console.warn('Error disabling Google auto-select:', error);
        }
      }
      initializeGoogleSignIn();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [option]);

  /**
   * Xử lý khi Google OAuth login thành công
   * Nhận idToken từ Google và gửi lên backend (backend sẽ verify)
   */
  const handleGoogleLoginSuccess = async (response: { credential: string }) => {
    if (!response.credential) {
      setError('Không thể lấy thông tin từ Google. Vui lòng thử lại.');
      setLoading(false);
      return;
    }

    // QUAN TRỌNG: Đảm bảo clear tất cả token cũ trước khi login
    // Điều này ngăn chặn race condition với các request đang pending
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('is_google_login');

    // idToken đã được Google trả về, gửi trực tiếp lên backend
    // Backend sẽ verify JWT với ClientID của nó
    try {
      setLoading(true);
      const result = await loginWithGoogle(response.credential);
      setLoading(false);

      if (result.success) {
        // Nếu cần xác thực email
        if (result.needsVerification && result.email) {
          setVerificationEmail(result.email);
          setPendingIdToken(response.credential); // Lưu idToken để dùng lại sau khi verify
          setShowVerificationModal(true);
          setSuccess(result.message);
          showSuccess(result.message);
        } 
        // Nếu đã verify, đăng nhập thành công
        else if (result.data) {
          setSuccess(result.message);
          showSuccess(result.message);
          // Dispatch event để update tất cả components
          window.dispatchEvent(new Event('auth:loginSuccess'));
          
          // Đợi một chút để đảm bảo localStorage và state đều được update
          setTimeout(() => {
            // Lấy user từ localStorage sau khi đã lưu
            const savedUser = localStorage.getItem('auth_user');
            let userRole = 'Student';
            
            if (savedUser) {
              try {
                const authUser = JSON.parse(savedUser);
                // Map roleId sang role
                const roleMap: Record<string, string> = {
                  'RL0001': 'Student',
                  'RL0002': 'Lecturer',
                  'RL0003': 'Facility_Manager',
                  // Có thể có roleId khác cho Admin, cần kiểm tra với backend
                };
                userRole = roleMap[authUser.roleId] || 'Student';
              } catch (e) {
                console.error('Error parsing user role:', e);
              }
            }
            
            // Xác định route redirect dựa trên role
            // Nếu from là admin route nhưng user không phải Admin/Facility_Manager, redirect về route mặc định
            let redirectPath = from;
            if (from.startsWith('/admin') && userRole !== 'Admin' && userRole !== 'Facility_Manager') {
              redirectPath = getDefaultRoute(userRole);
            } else if (!from.startsWith('/admin') && (userRole === 'Admin' || userRole === 'Facility_Manager')) {
              // Nếu user là Admin/Facility_Manager nhưng from không phải admin route, redirect về admin dashboard
              redirectPath = '/admin/dashboard';
            }
            
            navigate(redirectPath, { replace: true });
          }, 500);
        }
      } else {
        setError(result.message);
        showError(result.message);
      }
    } catch (error) {
      console.error('Google login API error:', error);
      const errorMsg = 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.';
      setError(errorMsg);
      showError(errorMsg);
      setLoading(false);
    }
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

    // QUAN TRỌNG: Đảm bảo clear tất cả token cũ trước khi login
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('is_google_login');

    setShowVerificationModal(false);
    setLoading(true);
    setError('');
    setSuccess('Email đã được xác thực! Đang đăng nhập...');
    
    // Gọi lại loginWithGoogle với idToken đã lưu
    const result = await loginWithGoogle(pendingIdToken);
    setLoading(false);
    setPendingIdToken(null);

    if (result.success && result.data) {
      setSuccess(result.message);
      showSuccess(result.message);
      window.dispatchEvent(new Event('auth:loginSuccess'));
      
      // Đợi một chút để đảm bảo localStorage và state đều được update
      setTimeout(() => {
        // Lấy user từ localStorage sau khi đã lưu
        const savedUser = localStorage.getItem('auth_user');
        let userRole = 'Student';
        
        if (savedUser) {
          try {
            const authUser = JSON.parse(savedUser);
            // Map roleId sang role
            const roleMap: Record<string, string> = {
              'RL0001': 'Student',
              'RL0002': 'Lecturer',
              'RL0003': 'Facility_Manager',
              // Có thể có roleId khác cho Admin, cần kiểm tra với backend
            };
            userRole = roleMap[authUser.roleId] || 'Student';
          } catch (e) {
            console.error('Error parsing user role:', e);
          }
        }
        
        // Xác định route redirect dựa trên role
        // Nếu from là admin route nhưng user không phải Admin/Facility_Manager, redirect về route mặc định
        let redirectPath = from;
        if (from.startsWith('/admin') && userRole !== 'Admin' && userRole !== 'Facility_Manager') {
          redirectPath = getDefaultRoute(userRole);
        } else if (!from.startsWith('/admin') && (userRole === 'Admin' || userRole === 'Facility_Manager')) {
          // Nếu user là Admin/Facility_Manager nhưng from không phải admin route, redirect về admin dashboard
          redirectPath = '/admin/dashboard';
        }
        
        navigate(redirectPath, { replace: true });
      }, 500);
    } else {
      setError(result.message);
      showError(result.message);
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
                Sử dụng tài khoản email FPT (<strong>@fpt.edu.vn hoặc @fe.edu.vn</strong>) để tiếp tục. Tùy chọn này được
                khuyến nghị cho sinh viên K18 và giảng viên.
              </p>
              {loading ? (
                <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Đang đăng nhập...</span>
                </div>
              ) : (
                <div className="flex justify-center">
                  {/* Google sẽ render button vào đây */}
                  <div ref={googleButtonRef} id="google-signin-button"></div>
                </div>
              )}
              <p className="text-xs text-gray-500">
                Chúng tôi chỉ chấp nhận tài khoản mà email kết thúc với <strong>@fpt.edu.vn hoặc @fe.edu.vn</strong>. Email của bạn được sử dụng để
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
