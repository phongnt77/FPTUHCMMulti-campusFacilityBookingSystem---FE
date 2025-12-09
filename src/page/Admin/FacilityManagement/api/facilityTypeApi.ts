import axios from 'axios';
import { getToken } from '../../../../utils/auth';

const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:5252';

// Tạo axios instance với baseURL
const facilityTypeApiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm request interceptor để tự động thêm token vào header
facilityTypeApiClient.interceptors.request.use(
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

// Interface cho FacilityType từ API response
export interface FacilityType {
  typeId: string;
  name: string;
  description: string;
  defaultAmenities: string;
  defaultCapacity: number;
  typicalDurationHours: number;
  iconUrl: string;
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
export interface FacilityTypesResponse {
  success: boolean;
  error: {
    code: number;
    message: string;
  } | null;
  code?: number;
  message?: string;
  data: FacilityType[];
  pagination?: Pagination;
}

// Interface cho Create/Update FacilityType Request
export interface FacilityTypeRequest {
  name: string;
  description: string;
  defaultAmenities: string;
  defaultCapacity: number;
  typicalDurationHours: number;
  iconUrl: string;
}

// Interface cho Create/Update FacilityType Response
export interface FacilityTypeActionResponse {
  success: boolean;
  error: {
    code: number;
    message: string;
  } | null;
  data?: FacilityType;
}

// Query parameters cho getFacilityTypes
export interface GetFacilityTypesParams {
  page?: number;
  limit?: number;
}

/**
 * Lấy danh sách tất cả loại cơ sở vật chất
 * @param params - Query parameters: page, limit
 * @returns Promise với danh sách facility types và pagination info
 * @description
 * - GET /api/facility-types
 * - Công khai - Không cần đăng nhập
 */
export const getFacilityTypes = async (params?: GetFacilityTypesParams): Promise<FacilityTypesResponse> => {
  try {
    const queryParams: Record<string, number> = {};
    
    if (params?.page !== undefined) {
      queryParams.Page = params.page;
    }
    
    if (params?.limit !== undefined) {
      queryParams.Limit = params.limit;
    }

    const response = await facilityTypeApiClient.get<FacilityTypesResponse>('/api/facility-types', {
      params: queryParams,
    });

    return response.data;
  } catch (error: any) {
    if (error.response) {
      const result = error.response.data as FacilityTypesResponse;
      if (result?.error) {
        throw new Error(result.error.message || 'Lỗi khi lấy danh sách facility types');
      }
      throw new Error(error.response.statusText || 'Lỗi khi lấy danh sách facility types');
    }
    
    if (error.request) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
    }
    
    console.error('Get facility types API error:', error);
    throw new Error('Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
  }
};

/**
 * Lấy chi tiết loại cơ sở vật chất
 * @param typeId - ID của facility type
 * @returns Promise với facility type
 * @description
 * - GET /api/facility-types/{id}
 * - Công khai - Không cần đăng nhập
 */
export const getFacilityTypeById = async (typeId: string): Promise<FacilityTypeActionResponse> => {
  try {
    const response = await facilityTypeApiClient.get<FacilityTypeActionResponse>(`/api/facility-types/${typeId}`);

    return response.data;
  } catch (error: any) {
    if (error.response) {
      const result = error.response.data as FacilityTypeActionResponse;
      if (result?.error) {
        throw new Error(result.error.message || 'Lỗi khi lấy chi tiết facility type');
      }
      throw new Error(error.response.statusText || 'Lỗi khi lấy chi tiết facility type');
    }
    
    if (error.request) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
    }
    
    console.error('Get facility type by ID API error:', error);
    throw new Error('Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
  }
};

/**
 * Tạo loại cơ sở vật chất mới
 * @param facilityTypeData - Thông tin facility type cần tạo
 * @returns Promise với facility type đã được tạo
 * @description
 * - POST /api/facility-types
 * - Chỉ Facility_Admin (RL0003) có thể tạo
 */
export const createFacilityType = async (facilityTypeData: FacilityTypeRequest): Promise<FacilityTypeActionResponse> => {
  try {
    const response = await facilityTypeApiClient.post<FacilityTypeActionResponse>('/api/facility-types', facilityTypeData);

    return response.data;
  } catch (error: any) {
    if (error.response) {
      const result = error.response.data as FacilityTypeActionResponse;
      if (result?.error) {
        throw new Error(result.error.message || 'Lỗi khi tạo facility type');
      }
      throw new Error(error.response.statusText || 'Lỗi khi tạo facility type');
    }
    
    if (error.request) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
    }
    
    console.error('Create facility type API error:', error);
    throw new Error('Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
  }
};

/**
 * Cập nhật thông tin loại cơ sở vật chất
 * @param typeId - ID của facility type cần cập nhật
 * @param facilityTypeData - Thông tin facility type cần cập nhật
 * @returns Promise với facility type đã được cập nhật
 * @description
 * - PUT /api/facility-types/{id}
 * - Chỉ Facility_Admin (RL0003) có thể cập nhật
 */
export const updateFacilityType = async (
  typeId: string,
  facilityTypeData: FacilityTypeRequest
): Promise<FacilityTypeActionResponse> => {
  try {
    const response = await facilityTypeApiClient.put<FacilityTypeActionResponse>(
      `/api/facility-types/${typeId}`,
      facilityTypeData
    );

    return response.data;
  } catch (error: any) {
    if (error.response) {
      const result = error.response.data as FacilityTypeActionResponse;
      if (result?.error) {
        throw new Error(result.error.message || 'Lỗi khi cập nhật facility type');
      }
      throw new Error(error.response.statusText || 'Lỗi khi cập nhật facility type');
    }
    
    if (error.request) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
    }
    
    console.error('Update facility type API error:', error);
    throw new Error('Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
  }
};

