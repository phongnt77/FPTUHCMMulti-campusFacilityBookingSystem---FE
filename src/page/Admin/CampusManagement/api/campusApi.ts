import axios from 'axios';
import { getToken } from '../../../../utils/auth';

const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:5252';

// Tạo axios instance với baseURL
const campusApiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm request interceptor để tự động thêm token vào header
campusApiClient.interceptors.request.use(
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

// Interface cho Campus từ API response
export interface Campus {
  campusId: string;
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  status: 'Active' | 'Inactive';
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
}

// Interface cho Pagination
export interface Pagination {
  page: number;
  limit: number;
  total: number;
}

// Interface cho API Response với pagination
export interface CampusesResponse {
  success: boolean;
  error: {
    code: number;
    message: string;
  } | null;
  code: number;
  message: string;
  data: Campus[];
  pagination?: Pagination;
}

// Interface cho Create/Update Campus Request
export interface CampusRequest {
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  status: 'Active' | 'Inactive';
}

// Interface cho Create/Update Campus Response
export interface CampusActionResponse {
  success: boolean;
  error: {
    code: number;
    message: string;
  } | null;
  code?: number;
  message?: string;
  data?: Campus;
}

// Interface cho Delete Response
export interface DeleteCampusResponse {
  success: boolean;
  error: {
    code: number;
    message: string;
  } | null;
}

// Query parameters cho getCampuses
export interface GetCampusesParams {
  page?: number;
  limit?: number;
}

/**
 * Lấy danh sách campuses với pagination (Admin view)
 * @param params - Query parameters: page, limit
 * @returns Promise với danh sách campuses và pagination info
 * @description
 * - GET /api/campuses/paged
 * - Có pagination (page, limit)
 * - Tất cả user đã đăng nhập có thể truy cập
 */
export const getCampuses = async (params?: GetCampusesParams): Promise<CampusesResponse> => {
  try {
    const queryParams: Record<string, number> = {};
    
    if (params?.page !== undefined) {
      queryParams.Page = params.page;
    }
    
    if (params?.limit !== undefined) {
      queryParams.Limit = params.limit;
    }

    const response = await campusApiClient.get<CampusesResponse>('/api/campuses/paged', {
      params: queryParams,
    });

    return response.data;
  } catch (error: any) {
    if (error.response) {
      const result = error.response.data as CampusesResponse;
      if (result) {
        throw new Error(result.error?.message || result.message || 'Lỗi khi lấy danh sách campuses');
      }
      throw new Error(error.response.statusText || 'Lỗi khi lấy danh sách campuses');
    }
    
    if (error.request) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
    }
    
    console.error('Get campuses API error:', error);
    throw new Error('Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
  }
};

/**
 * Tạo campus mới
 * @param campusData - Thông tin campus cần tạo
 * @returns Promise với campus đã được tạo
 * @description
 * - POST /api/campuses
 * - Chỉ Facility_Admin (RL0003) có thể tạo
 */
export const createCampus = async (campusData: CampusRequest): Promise<CampusActionResponse> => {
  try {
    const response = await campusApiClient.post<CampusActionResponse>('/api/campuses', campusData);

    return response.data;
  } catch (error: any) {
    if (error.response) {
      const result = error.response.data as CampusActionResponse;
      if (result?.error) {
        throw new Error(result.error.message || 'Lỗi khi tạo campus');
      }
      throw new Error(error.response.statusText || 'Lỗi khi tạo campus');
    }
    
    if (error.request) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
    }
    
    console.error('Create campus API error:', error);
    throw new Error('Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
  }
};

/**
 * Cập nhật thông tin campus
 * @param campusId - ID của campus cần cập nhật
 * @param campusData - Thông tin campus cần cập nhật
 * @param status - Trạng thái campus (optional query parameter)
 * @returns Promise với campus đã được cập nhật
 * @description
 * - PUT /api/campuses/{id}
 * - Chỉ Facility_Admin (RL0003) có thể cập nhật
 * - Có thể cập nhật status qua query parameter
 */
export const updateCampus = async (
  campusId: string,
  campusData: CampusRequest,
  status?: 'Active' | 'Inactive'
): Promise<CampusActionResponse> => {
  try {
    const queryParams: Record<string, string> = {};
    if (status) {
      queryParams.status = status;
    }

    const response = await campusApiClient.put<CampusActionResponse>(
      `/api/campuses/${campusId}`,
      campusData,
      { params: queryParams }
    );

    return response.data;
  } catch (error: any) {
    if (error.response) {
      const result = error.response.data as CampusActionResponse;
      if (result?.error) {
        throw new Error(result.error.message || 'Lỗi khi cập nhật campus');
      }
      throw new Error(error.response.statusText || 'Lỗi khi cập nhật campus');
    }
    
    if (error.request) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
    }
    
    console.error('Update campus API error:', error);
    throw new Error('Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
  }
};

/**
 * Vô hiệu hóa campus (soft delete - set status = Inactive)
 * @param campusId - ID của campus cần vô hiệu hóa
 * @returns Promise với kết quả
 * @description
 * - DELETE /api/campuses/{id}
 * - Chỉ Facility_Admin (RL0003) có thể vô hiệu hóa
 * - Soft delete: chỉ set status = Inactive, không xóa dữ liệu
 */
export const deleteCampus = async (campusId: string): Promise<DeleteCampusResponse> => {
  try {
    const response = await campusApiClient.delete<DeleteCampusResponse>(`/api/campuses/${campusId}`);

    return response.data;
  } catch (error: any) {
    if (error.response) {
      const result = error.response.data as DeleteCampusResponse;
      if (result?.error) {
        throw new Error(result.error.message || 'Lỗi khi vô hiệu hóa campus');
      }
      throw new Error(error.response.statusText || 'Lỗi khi vô hiệu hóa campus');
    }
    
    if (error.request) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
    }
    
    console.error('Delete campus API error:', error);
    throw new Error('Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
  }
};

