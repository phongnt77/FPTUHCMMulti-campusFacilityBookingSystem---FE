import axios from 'axios';
import { getToken } from '../../../../utils/auth';

const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:5252';

// Tạo axios instance với baseURL
const profileApiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm request interceptor để tự động thêm token vào header
profileApiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interface cho User Profile từ API response
export interface UserProfile {
  userId: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  userName: string;
  roleId: string;
  roleName: string;
  status: 'Active' | 'Inactive';
  isVerify: string;
  avatarUrl: string | null;
  lastLogin: string | null; // ISO 8601 format
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
}

// Interface cho API Response
export interface ProfileResponse {
  success: boolean;
  error: {
    code: number;
    message: string;
  } | null;
  code?: number;
  message?: string;
  data?: UserProfile;
}

// Interface cho Update Profile Request
export interface UpdateProfileRequest {
  phoneNumber?: string;
  avatarUrl?: string;
}

// Interface cho Change Password Request
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Interface cho Change Password Response
export interface ChangePasswordResponse {
  success: boolean;
  error: {
    code: number;
    message: string;
  } | null;
  message?: string;
}

/**
 * Lấy thông tin profile của user hiện tại
 * @returns Promise với user profile
 * @description
 * - GET /api/users/profile
 * - Tất cả user đã đăng nhập có thể truy cập
 * - User ID lấy từ JWT token
 */
export const getProfile = async (): Promise<ProfileResponse> => {
  try {
    const response = await profileApiClient.get<ProfileResponse>('/api/users/profile');

    return response.data;
  } catch (error: any) {
    if (error.response) {
      const result = error.response.data as ProfileResponse;
      if (result?.error) {
        throw new Error(result.error.message || 'Lỗi khi lấy thông tin profile');
      }
      throw new Error(error.response.statusText || 'Lỗi khi lấy thông tin profile');
    }
    
    if (error.request) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
    }
    
    console.error('Get profile API error:', error);
    throw new Error('Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
  }
};

/**
 * Cập nhật thông tin profile
 * @param profileData - Thông tin cần cập nhật (phoneNumber, avatarUrl)
 * @returns Promise với profile đã được cập nhật
 * @description
 * - PUT /api/users/profile
 * - Tất cả user đã đăng nhập có thể truy cập
 * - User chỉ có thể cập nhật profile của chính mình
 */
export const updateProfile = async (profileData: UpdateProfileRequest): Promise<ProfileResponse> => {
  try {
    const response = await profileApiClient.put<ProfileResponse>('/api/users/profile', profileData);

    return response.data;
  } catch (error: any) {
    if (error.response) {
      const result = error.response.data as ProfileResponse;
      if (result?.error) {
        throw new Error(result.error.message || 'Lỗi khi cập nhật profile');
      }
      throw new Error(error.response.statusText || 'Lỗi khi cập nhật profile');
    }
    
    if (error.request) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
    }
    
    console.error('Update profile API error:', error);
    throw new Error('Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
  }
};

/**
 * Đổi mật khẩu
 * @param passwordData - Mật khẩu cũ và mới
 * @returns Promise với kết quả
 * @description
 * - PUT /api/users/change-password
 * - Tất cả user đã đăng nhập có thể đổi mật khẩu
 * - Chỉ áp dụng cho user đăng nhập bằng email/password (không áp dụng cho Google login)
 */
export const changePassword = async (passwordData: ChangePasswordRequest): Promise<ChangePasswordResponse> => {
  try {
    const response = await profileApiClient.put<ChangePasswordResponse>('/api/users/change-password', {
      oldPassword: passwordData.oldPassword,
      newPassword: passwordData.newPassword,
      confirmPassword: passwordData.confirmPassword,
    });

    return response.data;
  } catch (error: any) {
    if (error.response) {
      const result = error.response.data as ChangePasswordResponse;
      if (result?.error) {
        throw new Error(result.error.message || 'Lỗi khi đổi mật khẩu');
      }
      throw new Error(error.response.statusText || 'Lỗi khi đổi mật khẩu');
    }
    
    if (error.request) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
    }
    
    console.error('Change password API error:', error);
    throw new Error('Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
  }
};

