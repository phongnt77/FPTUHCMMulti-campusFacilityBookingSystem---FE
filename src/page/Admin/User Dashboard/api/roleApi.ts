import axios from 'axios';
import { getToken } from '../../../../utils/auth';

const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:5252';

// Tạo axios instance với baseURL
const roleApiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm request interceptor để tự động thêm token vào header (mặc dù API có thể public)
roleApiClient.interceptors.request.use(
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

// Interface cho Role từ API response
export interface Role {
  roleId: string;
  roleName: string;
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
}

// Interface cho API Response
export interface RoleResponse {
  success: boolean;
  error: {
    code: number;
    message: string;
  } | null;
  data?: Role;
}

/**
 * Lấy chi tiết role
 * @param roleId - ID của role (VD: RL0001, RL0002, RL0003)
 * @returns Promise với role detail
 * @description
 * - GET /api/roles/{id}
 * - Công khai - Không cần đăng nhập
 */
export const getRoleById = async (roleId: string): Promise<RoleResponse> => {
  try {
    const response = await roleApiClient.get<RoleResponse>(`/api/roles/${roleId}`);

    return response.data;
  } catch (error: any) {
    if (error.response) {
      const result = error.response.data as RoleResponse;
      if (result?.error) {
        throw new Error(result.error.message || 'Lỗi khi lấy chi tiết role');
      }
      throw new Error(error.response.statusText || 'Lỗi khi lấy chi tiết role');
    }
    
    if (error.request) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
    }
    
    console.error('Get role by ID API error:', error);
    throw new Error('Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
  }
};

