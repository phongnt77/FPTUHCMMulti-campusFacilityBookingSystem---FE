import axios from 'axios';
import { publicApiClient, apiClient, handleApiError } from '../../../services/apiClient';

// Interface cho request body
export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

// Interface cho response từ API
export interface LoginResponse {
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

// Interface cho user info được lưu trong localStorage
export interface AuthUser {
  token: string;
  userId: string;
  email: string;
  fullName: string;
  roleId: string;
  isVerified: boolean;
}

// Interface cho logout response
export interface LogoutResponse {
  success: boolean;
  error: {
    code: number;
    message: string;
  } | null;
}

/**
 * Gọi API đăng nhập
 * @param emailOrUsername - Email hoặc username của người dùng
 * @param password - Mật khẩu
 * @returns Promise với kết quả đăng nhập
 */
export const loginAPI = async (
  emailOrUsername: string,
  password: string
): Promise<{ success: boolean; message: string; data?: AuthUser }> => {
  try {
    const response = await publicApiClient.post<LoginResponse>('/api/auth/login', {
      emailOrUsername: emailOrUsername.trim(),
      password: password,
    } as LoginRequest);

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

      // Lưu vào sessionStorage (riêng biệt cho mỗi tab)
      sessionStorage.setItem('auth_token', authUser.token);
      sessionStorage.setItem('auth_user', JSON.stringify(authUser));
      // Xóa flag Google login nếu có (user đăng nhập bằng email/password)
      sessionStorage.removeItem('is_google_login');

      return {
        success: true,
        message: 'Đăng nhập thành công!',
        data: authUser,
      };
    }

    // Xử lý lỗi từ API (khi success = false nhưng status 200)
    if (result.error) {
      return {
        success: false,
        message: result.error.message || 'Đăng nhập thất bại',
      };
    }

    // Trường hợp không có error object nhưng success = false
    return {
      success: false,
      message: 'Đăng nhập thất bại. Vui lòng thử lại.',
    };
  } catch (error) {
    const errorMessage = handleApiError(error, 'Đăng nhập thất bại');
    return {
      success: false,
      message: errorMessage.message,
    };
  }
};

/**
 * Gọi API đăng xuất
 * @returns Promise với kết quả đăng xuất
 * @description 
 * - Gửi POST request đến /api/auth/logout với Authorization header chứa JWT token
 * - Sau khi nhận 200 OK, xóa token và user info khỏi localStorage
 * - API yêu cầu authentication (token phải có trong header)
 */
export const logoutAPI = async (): Promise<{ success: boolean; message: string }> => {
  const clearAuthData = () => {
    const wasGoogleLogin = sessionStorage.getItem('is_google_login') === 'true';
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');
    sessionStorage.removeItem('is_google_login');
    
    // Revoke Google session nếu user đăng nhập bằng Google
    if (wasGoogleLogin && typeof window.google !== 'undefined' && window.google.accounts) {
      try {
        window.google.accounts.id.disableAutoSelect();
      } catch (error) {
        console.warn('Error revoking Google session:', error);
      }
    }
  };

  try {
    const response = await apiClient.post<LogoutResponse>('/api/auth/logout');
    const result = response.data;

    // Xử lý response thành công (200)
    if (result.success) {
      clearAuthData();
      return {
        success: true,
        message: 'Đăng xuất thành công!',
      };
    }

    // Xử lý trường hợp success = false
    if (result.error) {
      return {
        success: false,
        message: result.error.message || 'Đăng xuất thất bại',
      };
    }

    return {
      success: false,
      message: 'Đăng xuất thất bại. Vui lòng thử lại.',
    };
  } catch (error) {
    // Xử lý lỗi từ axios
    if (axios.isAxiosError(error)) {
      // Nếu là lỗi 401 (Unauthorized), có thể token đã hết hạn
      // Vẫn xóa token và user info để đảm bảo client side clean
      if (error.response?.status === 401) {
        clearAuthData();
        return {
          success: false,
          message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
        };
      }
    }

    // Ngay cả khi không kết nối được, vẫn xóa token ở client side
    clearAuthData();
    const errorMessage = handleApiError(error, 'Đăng xuất thất bại');
    return {
      success: false,
      message: errorMessage.message || 'Đã xóa thông tin đăng nhập ở client.',
    };
  }
};
