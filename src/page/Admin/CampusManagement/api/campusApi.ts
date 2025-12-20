import { apiClient, handleApiError } from '../../../../services/apiClient';
import type { PaginatedResponse, ActionResponse, DeleteResponse } from '../../../../types/api';

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

// Import Pagination from shared types
import type { Pagination } from '../../../../types/api';

// Interface cho Create/Update Campus Request
export interface CampusRequest {
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  status: 'Active' | 'Inactive';
}

// Interface cho API Response với pagination
export interface CampusesResponse extends PaginatedResponse<Campus> {
  code: number;
  message: string;
}

// Interface cho Create/Update Campus Response
export interface CampusActionResponse extends ActionResponse<Campus> {
  code?: number;
  message?: string;
}

// Interface cho Delete Response
export type DeleteCampusResponse = DeleteResponse;

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

    const response = await apiClient.get<CampusesResponse>('/api/campuses/paged', {
      params: queryParams,
    });

    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Lỗi khi lấy danh sách campuses');
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
    const response = await apiClient.post<CampusActionResponse>('/api/campuses', campusData);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Lỗi khi tạo campus');
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

    const response = await apiClient.put<CampusActionResponse>(
      `/api/campuses/${campusId}`,
      campusData,
      { params: queryParams }
    );

    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Lỗi khi cập nhật campus');
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
    const response = await apiClient.delete<DeleteCampusResponse>(`/api/campuses/${campusId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'Lỗi khi vô hiệu hóa campus');
  }
};

