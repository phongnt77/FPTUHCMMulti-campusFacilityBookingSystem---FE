import axios from 'axios';
import { getToken } from '../../../../utils/auth';

const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:5252';

// Tạo axios instance với baseURL
const myFeedbacksApiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm request interceptor để tự động thêm token vào header
myFeedbacksApiClient.interceptors.request.use(
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

// Interface cho Feedback từ API response
export interface MyFeedback {
  feedbackId: string;
  bookingId: string;
  userId: string;
  userName: string;
  facilityName: string;
  rating: number;
  comments: string;
  reportIssue: boolean;
  issueDescription: string | null;
  createdAt: string; // ISO 8601 format
  resolvedAt: string | null; // ISO 8601 format
  isResolved: boolean;
}

// Interface cho API Response
export interface MyFeedbacksResponse {
  success: boolean;
  error: {
    code: number;
    message: string;
  } | null;
  data: MyFeedback[];
}

/**
 * Lấy feedbacks của riêng mình
 * @returns Promise với danh sách feedbacks
 * @description
 * - GET /api/feedbacks/my-feedbacks
 * - Tất cả user đã đăng nhập có thể truy cập
 * - User xem lại tất cả feedback mình đã tạo
 */
export const getMyFeedbacks = async (): Promise<MyFeedbacksResponse> => {
  try {
    const response = await myFeedbacksApiClient.get<MyFeedbacksResponse>('/api/feedbacks/my-feedbacks');

    return response.data;
  } catch (error: any) {
    if (error.response) {
      const result = error.response.data as MyFeedbacksResponse;
      if (result?.error) {
        throw new Error(result.error.message || 'Lỗi khi lấy danh sách feedbacks');
      }
      throw new Error(error.response.statusText || 'Lỗi khi lấy danh sách feedbacks');
    }
    
    if (error.request) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
    }
    
    console.error('Get my feedbacks API error:', error);
    throw new Error('Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
  }
};

