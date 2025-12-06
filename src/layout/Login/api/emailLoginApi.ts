import axios from 'axios';
import type { AuthUser } from './loginAPI';

const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:5252';

// Tạo axios instance cho email login (không cần token)
const emailApiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interface cho Google login request
export interface GoogleLoginRequest {
  idToken: string;
}

// Interface cho Google login response
export interface GoogleLoginResponse {
  success: boolean;
  error: {
    code: number;
    message: string;
  } | null;
  data: {
    token: string;
    userId: string;
    email: string;
    fullName: string;
    roleId: string;
    isVerified: boolean;
  } | null;
}

// Interface cho verify email response
export interface VerifyEmailResponse {
  success: boolean;
  error: {
    code: number;
    message: string;
  } | null;
}

// Interface cho resend verification email response
export interface ResendVerificationResponse {
  success: boolean;
  error: {
    code: number;
    message: string;
  } | null;
}

/**
 * Đăng nhập bằng Google OAuth
 * @param idToken - Google ID Token từ Google OAuth
 * @returns Promise với kết quả đăng nhập và thông tin user
 * @description
 * - Gửi POST request đến /api/auth/login/google với idToken
 * - Nếu là lần đầu login, hệ thống tự động tạo user mới và gửi mã xác thực qua email
 * - Logic phân role: @fpt.edu.vn → Student, @fe.edu.vn → Lecturer
 */
export const loginWithGoogle = async (
  idToken: string
): Promise<{ 
  success: boolean; 
  message: string; 
  data?: AuthUser;
  needsVerification?: boolean;
  email?: string;
}> => {
  try {
    const response = await emailApiClient.post<GoogleLoginResponse>('/api/auth/login/google', {
      idToken: idToken,
    } as GoogleLoginRequest);

    const result = response.data;

    // Xử lý response thành công (200)
    if (result.success && result.data) {
      const authUser: AuthUser = {
        token: result.data.token,
        userId: result.data.userId,
        email: result.data.email,
        fullName: result.data.fullName,
        roleId: result.data.roleId,
        isVerified: result.data.isVerified,
      };

      // Nếu user chưa verify email, không lưu token vào localStorage
      // Chỉ trả về thông tin để hiển thị form verify
      if (!result.data.isVerified) {
        return {
          success: true,
          message: 'Vui lòng xác thực email để hoàn tất đăng nhập. Mã xác thực đã được gửi đến email của bạn.',
          needsVerification: true,
          email: result.data.email,
        };
      }

      // Nếu đã verify, lưu vào localStorage và đăng nhập thành công
      localStorage.setItem('auth_token', authUser.token);
      localStorage.setItem('auth_user', JSON.stringify(authUser));

      return {
        success: true,
        message: 'Đăng nhập thành công!',
        data: authUser,
        needsVerification: false,
      };
    }

    // Xử lý lỗi từ API
    if (result.error) {
      return {
        success: false,
        message: result.error.message || 'Đăng nhập thất bại',
      };
    }

    return {
      success: false,
      message: 'Đăng nhập thất bại. Vui lòng thử lại.',
    };
  } catch (error) {
    // Xử lý lỗi từ axios
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const result = error.response.data as GoogleLoginResponse;
        if (result?.error) {
          return {
            success: false,
            message: result.error.message || 'Đăng nhập thất bại',
          };
        }
        return {
          success: false,
          message: error.response.statusText || 'Đăng nhập thất bại',
        };
      }
      
      if (error.request) {
        return {
          success: false,
          message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
        };
      }
    }

    console.error('Google login API error:', error);
    return {
      success: false,
      message: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.',
    };
  }
};

/**
 * Xác thực email bằng mã 6 số
 * @param email - Email cần xác thực
 * @param code - Mã xác thực 6 số nhận qua email
 * @returns Promise với kết quả xác thực
 * @description
 * - Gửi POST request đến /api/auth/verify-email với email và code trong query params
 * - Mã có hiệu lực 24 giờ
 */
export const verifyEmail = async (
  email: string,
  code: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await emailApiClient.post<VerifyEmailResponse>(
      `/api/auth/verify-email?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`
    );

    const result = response.data;

    if (result.success) {
      return {
        success: true,
        message: 'Xác thực email thành công!',
      };
    }

    if (result.error) {
      return {
        success: false,
        message: result.error.message || 'Xác thực email thất bại',
      };
    }

    return {
      success: false,
      message: 'Xác thực email thất bại. Vui lòng thử lại.',
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const result = error.response.data as VerifyEmailResponse;
        if (result?.error) {
          return {
            success: false,
            message: result.error.message || 'Xác thực email thất bại',
          };
        }
        return {
          success: false,
          message: error.response.statusText || 'Xác thực email thất bại',
        };
      }
      
      if (error.request) {
        return {
          success: false,
          message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
        };
      }
    }

    console.error('Verify email API error:', error);
    return {
      success: false,
      message: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.',
    };
  }
};

/**
 * Gửi lại mã xác thực email
 * @param email - Email cần gửi lại mã
 * @returns Promise với kết quả gửi lại mã
 * @description
 * - Gửi POST request đến /api/auth/resend-verification-email với email trong query param
 * - Sử dụng khi mã cũ đã hết hạn (24h)
 */
export const resendVerificationEmail = async (
  email: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await emailApiClient.post<ResendVerificationResponse>(
      `/api/auth/resend-verification-email?email=${encodeURIComponent(email)}`
    );

    const result = response.data;

    if (result.success) {
      return {
        success: true,
        message: 'Mã xác thực mới đã được gửi đến email của bạn.',
      };
    }

    if (result.error) {
      return {
        success: false,
        message: result.error.message || 'Gửi lại mã thất bại',
      };
    }

    return {
      success: false,
      message: 'Gửi lại mã thất bại. Vui lòng thử lại.',
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const result = error.response.data as ResendVerificationResponse;
        if (result?.error) {
          return {
            success: false,
            message: result.error.message || 'Gửi lại mã thất bại',
          };
        }
        return {
          success: false,
          message: error.response.statusText || 'Gửi lại mã thất bại',
        };
      }
      
      if (error.request) {
        return {
          success: false,
          message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
        };
      }
    }

    console.error('Resend verification email API error:', error);
    return {
      success: false,
      message: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.',
    };
  }
};

// Interface cho forgot password response
export interface ForgotPasswordResponse {
  success: boolean;
  error: {
    code: number;
    message: string;
  } | null;
}

// Interface cho reset password response
export interface ResetPasswordResponse {
  success: boolean;
  error: {
    code: number;
    message: string;
  } | null;
}

/**
 * Yêu cầu đặt lại mật khẩu - gửi mã 6 số qua email
 * @param email - Email tài khoản cần đặt lại mật khẩu
 * @returns Promise với kết quả gửi mã
 * @description
 * - Gửi POST request đến /api/auth/forgot-password với email trong query param
 * - Mã có hiệu lực 1 giờ
 * - Không áp dụng cho tài khoản đăng nhập Google
 */
export const forgotPassword = async (
  email: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await emailApiClient.post<ForgotPasswordResponse>(
      `/api/auth/forgot-password?email=${encodeURIComponent(email)}`
    );

    const result = response.data;

    if (result.success) {
      return {
        success: true,
        message: 'Mã đặt lại mật khẩu đã được gửi đến email của bạn. Mã có hiệu lực trong 1 giờ.',
      };
    }

    if (result.error) {
      return {
        success: false,
        message: result.error.message || 'Gửi mã thất bại',
      };
    }

    return {
      success: false,
      message: 'Gửi mã thất bại. Vui lòng thử lại.',
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const result = error.response.data as ForgotPasswordResponse;
        if (result?.error) {
          return {
            success: false,
            message: result.error.message || 'Gửi mã thất bại',
          };
        }
        return {
          success: false,
          message: error.response.statusText || 'Gửi mã thất bại',
        };
      }
      
      if (error.request) {
        return {
          success: false,
          message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
        };
      }
    }

    console.error('Forgot password API error:', error);
    return {
      success: false,
      message: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.',
    };
  }
};

/**
 * Đặt lại mật khẩu bằng mã 6 số
 * @param email - Email tài khoản
 * @param code - Mã reset 6 số nhận qua email
 * @param newPassword - Mật khẩu mới
 * @returns Promise với kết quả đặt lại mật khẩu
 * @description
 * - Gửi POST request đến /api/auth/reset-password với email, code và newPassword trong query params
 * - Mã có hiệu lực 1 giờ
 */
export const resetPassword = async (
  email: string,
  code: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await emailApiClient.post<ResetPasswordResponse>(
      `/api/auth/reset-password?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}&newPassword=${encodeURIComponent(newPassword)}`
    );

    const result = response.data;

    if (result.success) {
      return {
        success: true,
        message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.',
      };
    }

    if (result.error) {
      return {
        success: false,
        message: result.error.message || 'Đặt lại mật khẩu thất bại',
      };
    }

    return {
      success: false,
      message: 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.',
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const result = error.response.data as ResetPasswordResponse;
        if (result?.error) {
          return {
            success: false,
            message: result.error.message || 'Đặt lại mật khẩu thất bại',
          };
        }
        return {
          success: false,
          message: error.response.statusText || 'Đặt lại mật khẩu thất bại',
        };
      }
      
      if (error.request) {
        return {
          success: false,
          message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
        };
      }
    }

    console.error('Reset password API error:', error);
    return {
      success: false,
      message: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.',
    };
  }
};

