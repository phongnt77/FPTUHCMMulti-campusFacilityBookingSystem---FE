import axios from 'axios';
import { getToken } from '../../../../utils/auth';

const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:5252';

// Tạo axios instance với baseURL
const userApiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm request interceptor để tự động thêm token vào header
userApiClient.interceptors.request.use(
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

// Interface cho User từ API response
export interface User {
  userId: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  userName: string;
  roleId: string;
  roleName: string;
  status: 'Active' | 'Inactive';
  isVerify: string; // Có thể là boolean hoặc string
  avatarUrl: string | null;
  lastLogin: string | null; // ISO 8601 format
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
  campusId?: string; // Có thể có hoặc không
  campusName?: string; // Có thể có hoặc không
}

// Interface cho Pagination
export interface Pagination {
  page: number;
  limit: number;
  total: number;
}

// Interface cho API Response với pagination
export interface UsersResponse {
  success: boolean;
  error: {
    code: number;
    message: string;
  } | null;
  data: User[];
  pagination?: Pagination;
}

// Interface cho User Detail Response
export interface UserDetailResponse {
  success: boolean;
  error: {
    code: number;
    message: string;
  } | null;
  data?: User;
}

// Interface cho Delete Response
export interface DeleteUserResponse {
  success: boolean;
  error: {
    code: string;
  } | null;
  message?: string;
}

// Query parameters cho getUsers
export interface GetUsersParams {
  name?: string;
  email?: string;
  roleId?: string;
  campusId?: string;
  status?: 'Active' | 'Inactive';
  page?: number;
  limit?: number;
}

/**
 * Lấy danh sách tất cả users với filtering (Admin only)
 * @param params - Query parameters: name, email, roleId, campusId, status, page, limit
 * @returns Promise với danh sách users và pagination info
 * @description
 * - GET /api/users
 * - Chỉ Facility_Admin (RL0003) có thể truy cập
 */
export const getUsers = async (params?: GetUsersParams): Promise<UsersResponse> => {
  try {
    const queryParams: Record<string, string | number> = {};
    
    if (params?.name) {
      queryParams.name = params.name;
    }
    
    if (params?.email) {
      queryParams.email = params.email;
    }
    
    if (params?.roleId) {
      queryParams.roleId = params.roleId;
    }
    
    if (params?.campusId) {
      queryParams.campusId = params.campusId;
    }
    
    if (params?.status) {
      queryParams.status = params.status;
    }
    
    if (params?.page !== undefined) {
      queryParams.page = params.page;
    }
    
    if (params?.limit !== undefined) {
      queryParams.limit = params.limit;
    }

    const response = await userApiClient.get<UsersResponse>('/api/users', {
      params: queryParams,
    });

    return response.data;
  } catch (error: any) {
    if (error.response) {
      const result = error.response.data as UsersResponse;
      if (result?.error) {
        throw new Error(result.error.message || 'Lỗi khi lấy danh sách users');
      }
      throw new Error(error.response.statusText || 'Lỗi khi lấy danh sách users');
    }
    
    if (error.request) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
    }
    
    console.error('Get users API error:', error);
    throw new Error('Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
  }
};

/**
 * Lấy chi tiết user (Admin only)
 * @param userId - ID của user
 * @returns Promise với user detail
 * @description
 * - GET /api/users/{id}
 * - Chỉ Facility_Admin (RL0003) có thể truy cập
 */
export const getUserById = async (userId: string): Promise<UserDetailResponse> => {
  try {
    const response = await userApiClient.get<UserDetailResponse>(`/api/users/${userId}`);

    return response.data;
  } catch (error: any) {
    if (error.response) {
      const result = error.response.data as UserDetailResponse;
      if (result?.error) {
        throw new Error(result.error.message || 'Lỗi khi lấy chi tiết user');
      }
      throw new Error(error.response.statusText || 'Lỗi khi lấy chi tiết user');
    }
    
    if (error.request) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
    }
    
    console.error('Get user by ID API error:', error);
    throw new Error('Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
  }
};

/**
 * Xóa user (Admin only)
 * @param userId - ID của user cần xóa
 * @returns Promise với kết quả
 * @description
 * - DELETE /api/users/{id}
 * - Chỉ Facility_Admin (RL0003) có thể xóa
 */
export const deleteUser = async (userId: string): Promise<DeleteUserResponse> => {
  try {
    const response = await userApiClient.delete<DeleteUserResponse>(`/api/users/${userId}`);

    return response.data;
  } catch (error: any) {
    if (error.response) {
      const result = error.response.data as DeleteUserResponse;
      if (result?.error) {
        throw new Error(result.error.code || result.message || 'Lỗi khi xóa user');
      }
      throw new Error(error.response.statusText || 'Lỗi khi xóa user');
    }
    
    if (error.request) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
    }
    
    console.error('Delete user API error:', error);
    throw new Error('Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
  }
};

