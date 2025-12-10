import axios from 'axios';
import { getToken } from '../../../../utils/auth';

const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:5252';

// Tạo axios instance với baseURL
const notificationApiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm request interceptor để tự động thêm token vào header
notificationApiClient.interceptors.request.use(
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

// Interface cho Notification từ API response
export interface Notification {
  notificationId: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  status: 'Unread' | 'Read';
  bookingId?: string;
  feedbackId?: string;
  createdAt: string;
  readAt?: string;
}

// Interface cho API Response
export interface NotificationResponse {
  success: boolean;
  error: {
    code: number;
    message: string;
  };
  data: Notification[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

// Interface cho Unread Count Response
export interface UnreadCountResponse {
  success: boolean;
  error: {
    code: number;
    message: string;
  };
  data: number;
}

// Interface cho Standard Response
export interface StandardResponse {
  success: boolean;
  error: {
    code: number;
    message: string;
  };
}

// Interface cho Filter Parameters
export interface NotificationFilters {
  userId?: string;
  type?: 'Booking_Pending_Approval' | 'Booking_Approved' | 'Booking_Rejected' | 'Booking_Reminder_Checkin' | 'Booking_Reminder_CheckOut' | 'Feedback_Received' | 'Booking_No_Show';
  status?: 'Unread' | 'Read';
  page?: number;
  limit?: number;
}

/**
 * Lấy danh sách thông báo với filtering và pagination
 */
export const getNotifications = async (filters?: NotificationFilters): Promise<NotificationResponse> => {
  const params = new URLSearchParams();
  
  if (filters?.userId) params.append('UserId', filters.userId);
  if (filters?.type) params.append('Type', filters.type);
  if (filters?.status) params.append('Status', filters.status);
  if (filters?.page !== undefined) params.append('Page', filters.page.toString());
  if (filters?.limit !== undefined) params.append('Limit', filters.limit.toString());

  const response = await notificationApiClient.get<NotificationResponse>(
    `/api/notifications${params.toString() ? `?${params.toString()}` : ''}`
  );
  return response.data;
};

/**
 * Lấy tất cả thông báo chưa đọc của user hiện tại
 */
export const getUnreadNotifications = async (): Promise<NotificationResponse> => {
  const response = await notificationApiClient.get<NotificationResponse>('/api/notifications/unread');
  return response.data;
};

/**
 * Lấy số lượng thông báo chưa đọc của user hiện tại
 */
export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
  const response = await notificationApiClient.get<UnreadCountResponse>('/api/notifications/unread/count');
  return response.data;
};

/**
 * Đánh dấu thông báo là đã đọc
 */
export const markNotificationAsRead = async (notificationId: string): Promise<StandardResponse> => {
  const response = await notificationApiClient.put<StandardResponse>(
    `/api/notifications/${notificationId}/read`
  );
  return response.data;
};

/**
 * Đánh dấu tất cả thông báo của user hiện tại là đã đọc
 */
export const markAllNotificationsAsRead = async (): Promise<StandardResponse> => {
  const response = await notificationApiClient.put<StandardResponse>('/api/notifications/read-all');
  return response.data;
};

/**
 * Xóa thông báo
 */
export const deleteNotification = async (notificationId: string): Promise<StandardResponse> => {
  const response = await notificationApiClient.delete<StandardResponse>(
    `/api/notifications/${notificationId}`
  );
  return response.data;
};

