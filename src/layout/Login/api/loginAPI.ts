import axios from 'axios';

const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:5252';

// Tạo axios instance với baseURL
const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm request interceptor để tự động thêm token vào header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
    const response = await apiClient.post<LoginResponse>('/api/auth/login', {
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

      // Lưu vào localStorage
      localStorage.setItem('auth_token', authUser.token);
      localStorage.setItem('auth_user', JSON.stringify(authUser));

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
    // Xử lý lỗi từ axios
    if (axios.isAxiosError(error)) {
      // Lỗi từ server (401, 400, 500, etc.)
      if (error.response) {
        const result = error.response.data as LoginResponse;
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
      
      // Lỗi network (không kết nối được đến server)
      if (error.request) {
        return {
          success: false,
          message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
        };
      }
    }

    // Lỗi khác
    console.error('Login API error:', error);
    return {
      success: false,
      message: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.',
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
  try {
    const response = await apiClient.post<LogoutResponse>('/api/auth/logout');

    const result = response.data;

    // Xử lý response thành công (200)
    if (result.success) {
      // Xóa token và user info khỏi localStorage theo yêu cầu của API
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');

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
      // Lỗi từ server (401, 400, 500, etc.)
      if (error.response) {
        // Nếu là lỗi 401 (Unauthorized), có thể token đã hết hạn
        // Vẫn xóa token và user info để đảm bảo client side clean
        if (error.response.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          return {
            success: false,
            message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
          };
        }

        const result = error.response.data as LogoutResponse;
        if (result?.error) {
          return {
            success: false,
            message: result.error.message || 'Đăng xuất thất bại',
          };
        }
        return {
          success: false,
          message: error.response.statusText || 'Đăng xuất thất bại',
        };
      }
      
      // Lỗi network (không kết nối được đến server)
      if (error.request) {
        // Ngay cả khi không kết nối được, vẫn xóa token ở client side
        // để đảm bảo user có thể logout ngay cả khi server không phản hồi
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        return {
          success: false,
          message: 'Không thể kết nối đến server. Đã xóa thông tin đăng nhập ở client.',
        };
      }
    }

    // Lỗi khác
    console.error('Logout API error:', error);
    // Vẫn xóa token để đảm bảo client side clean
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    return {
      success: false,
      message: 'Đã xảy ra lỗi không xác định. Đã xóa thông tin đăng nhập ở client.',
    };
  }
};
