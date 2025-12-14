import axios from 'axios';
import { getToken } from '../../../../utils/auth';

const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:5252';

// Tạo axios instance với baseURL
const systemSettingApiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm request interceptor để tự động thêm token vào header
systemSettingApiClient.interceptors.request.use(
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

// Interface cho System Settings
export interface SystemSettings {
  minimumBookingHoursBeforeStart: number;
  checkInMinutesBeforeStart: number;
  checkInMinutesAfterStart: number;
}

// Interface cho API Response
export interface SystemSettingsResponse {
  success: boolean;
  error: {
    code: number;
    message: string;
  } | null;
  data: SystemSettings;
}

// Interface cho Update Request
export interface UpdateSystemSettingsRequest {
  minimumBookingHoursBeforeStart?: number;
  checkInMinutesBeforeStart?: number;
  checkInMinutesAfterStart?: number;
}

/**
 * Lấy cấu hình hệ thống hiện tại (Admin only)
 * @returns Promise với system settings
 * @description
 * - GET /api/system-settings
 * - Chỉ Facility_Admin (RL0003) có thể truy cập
 */
export const getSystemSettings = async (): Promise<SystemSettingsResponse> => {
  try {
    const response = await systemSettingApiClient.get<SystemSettingsResponse>('/api/system-settings');

    return response.data;
  } catch (error: any) {
    if (error.response) {
      const result = error.response.data as SystemSettingsResponse;
      if (result?.error) {
        throw new Error(result.error.message || 'Lỗi khi lấy cấu hình hệ thống');
      }
      throw new Error(error.response.statusText || 'Lỗi khi lấy cấu hình hệ thống');
    }
    
    if (error.request) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
    }
    
    console.error('Get system settings API error:', error);
    throw new Error('Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
  }
};

/**
 * Cập nhật cấu hình hệ thống (Admin only)
 * @param settings - Các cấu hình cần cập nhật (chỉ cần gửi các field muốn cập nhật)
 * @returns Promise với kết quả cập nhật
 * @description
 * - PUT /api/system-settings
 * - Chỉ Facility_Admin (RL0003) có thể truy cập
 * - Chỉ cần gửi các field muốn cập nhật
 * - Các giá trị phải >= 0
 */
export const updateSystemSettings = async (
  settings: UpdateSystemSettingsRequest
): Promise<SystemSettingsResponse> => {
  try {
    const response = await systemSettingApiClient.put<SystemSettingsResponse>(
      '/api/system-settings',
      settings
    );

    return response.data;
  } catch (error: any) {
    if (error.response) {
      const result = error.response.data as SystemSettingsResponse;
      if (result?.error) {
        throw new Error(result.error.message || 'Lỗi khi cập nhật cấu hình hệ thống');
      }
      throw new Error(error.response.statusText || 'Lỗi khi cập nhật cấu hình hệ thống');
    }
    
    if (error.request) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
    }
    
    console.error('Update system settings API error:', error);
    throw new Error('Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
  }
};
