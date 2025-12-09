import { API_BASE_URL, API_ENDPOINTS, apiFetch, buildUrl } from '../../../../services/api.config';
import type { Facility, Campus, FacilityType } from '../../../../types';

export type BookingStatus = 'Pending' | 'Approved' | 'Rejected' | 'Finish' | 'Cancelled';

export interface Feedback {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface UserBooking {
  id: string;
  lessonBookingId: string;
  lessonBookingDate: string;
  facilityId: string;
  facility: Facility;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  numberOfPeople: number;
  status: BookingStatus;
  createdAt: string;
  feedback?: Feedback;
  rejectionReason?: string;
}

// Backend response types
interface BackendBookingResponse {
  bookingId: string;
  facilityId: string;
  facilityName: string;
  facilityDescription?: string;
  facilityCapacity?: number;
  facilityRoomNumber?: string;
  facilityFloorNumber?: string;
  campusName?: string;
  typeName?: string;
  userId: string;
  userName?: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: string;
  estimatedAttendees: number;
  specialRequirements?: string;
  createdAt: string;
  rejectionReason?: string;
}

interface BackendFeedbackResponse {
  feedbackId: string;
  bookingId: string;
  userId: string;
  rating: number;
  comments: string;
  createdAt: string;
}

export interface FeedbackRequest {
  bookingId: string;
  rating: number;
  comment: string;
}

// Map backend status to frontend status (5 statuses only)
const mapStatus = (status: string): BookingStatus => {
  const statusMap: Record<string, BookingStatus> = {
    'Draft': 'Pending',
    'Pending': 'Pending',
    'Pending_Approval': 'Pending',
    'Approved': 'Approved',
    'Completed': 'Finish',
    'Cancelled': 'Cancelled',
    'Rejected': 'Rejected',
  };
  return statusMap[status] || 'Pending';
};

// Map facility type
const mapFacilityType = (typeName: string): FacilityType => {
  const typeMap: Record<string, FacilityType> = {
    'Classroom': 'Classroom',
    'Meeting Room': 'Meeting Room',
    'Computer Lab': 'Laboratory',
    'Sports Court': 'Sport Facility',
    'Auditorium': 'Auditorium',
    'Laboratory': 'Laboratory',
    'Sport Facility': 'Sport Facility',
    'Library': 'Library',
  };
  return typeMap[typeName] || 'Classroom';
};

// Map backend booking to frontend UserBooking
const mapBookingResponse = (b: BackendBookingResponse, feedback?: BackendFeedbackResponse): UserBooking => {
  const startDate = new Date(b.startTime);
  const endDate = new Date(b.endTime);
  
  return {
    id: b.bookingId,
    lessonBookingId: b.bookingId,
    lessonBookingDate: b.startTime.split('T')[0],
    facilityId: b.facilityId,
    facility: {
      id: b.facilityId,
      name: b.facilityName || 'Unknown Facility',
      campus: (b.campusName?.includes('NVH') || b.campusName?.includes('Nhà Văn Hóa') || b.campusName?.includes('Sinh Viên') ? 'NVH' : 'HCM') as Campus,
      type: mapFacilityType(b.typeName || 'Classroom'),
      capacity: b.facilityCapacity || 0,
      location: `${b.facilityRoomNumber || ''}, Tầng ${b.facilityFloorNumber || ''}`,
      amenities: [],
      imageUrl: '/images/default-facility.jpg',
      isActive: true,
      description: b.facilityDescription || '',
    },
    date: b.startTime.split('T')[0],
    startTime: startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }),
    endTime: endDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }),
    purpose: b.purpose,
    numberOfPeople: b.estimatedAttendees,
    status: mapStatus(b.status),
    createdAt: b.createdAt,
    rejectionReason: b.rejectionReason,
    feedback: feedback ? {
      id: feedback.feedbackId,
      rating: feedback.rating,
      comment: feedback.comments,
      createdAt: feedback.createdAt,
    } : undefined,
  };
};

// Helper to check if backend status matches frontend filter (5 statuses)
const statusMatchesFilter = (backendStatus: string, filterStatus: BookingStatus): boolean => {
  switch (filterStatus) {
    case 'Pending':
      return ['Draft', 'Pending', 'Pending_Approval'].includes(backendStatus);
    case 'Approved':
      return backendStatus === 'Approved';
    case 'Finish':
      return backendStatus === 'Completed';
    case 'Cancelled':
      return backendStatus === 'Cancelled';
    case 'Rejected':
      return backendStatus === 'Rejected';
    default:
      return true;
  }
};

export const myBookingsApi = {
  // Get all bookings for current user - API ONLY
  getMyBookings: async (status?: BookingStatus): Promise<UserBooking[]> => {
    try {
      // Always fetch all bookings, filter on client side
      const params: Record<string, string | number | undefined> = {
        page: 1,
        limit: 100,
      };
      
      const url = buildUrl(API_ENDPOINTS.BOOKING.GET_MY_BOOKINGS, params);
      console.log('Fetching my bookings from:', url);
      
      const response = await apiFetch<BackendBookingResponse[]>(url);
      console.log('My bookings response:', response);
      
      if (response.success && response.data) {
        // Get all feedbacks for these bookings
        const feedbackUrl = buildUrl(API_ENDPOINTS.FEEDBACK.GET_ALL, { limit: 100 });
        const feedbackResponse = await apiFetch<BackendFeedbackResponse[]>(feedbackUrl);
        const feedbacks = feedbackResponse.success && feedbackResponse.data ? feedbackResponse.data : [];
        
        // Filter by status first (using original backend status), then map
        let filteredData = response.data;
        if (status) {
          filteredData = response.data.filter(b => statusMatchesFilter(b.status, status));
        }
        
        // Map bookings with their feedbacks
        const bookings = filteredData.map(booking => {
          const feedback = feedbacks.find(f => f.bookingId === booking.bookingId);
          return mapBookingResponse(booking, feedback);
        });
        
        // Sort by date descending
        bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        return bookings;
      }
      
      console.error('API Error:', response.error);
      return [];
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  },

  // Get booking by ID - API ONLY
  getBookingById: async (id: string): Promise<UserBooking | null> => {
    try {
      const url = `${API_BASE_URL}${API_ENDPOINTS.BOOKING.GET_BY_ID(id)}`;
      const response = await apiFetch<BackendBookingResponse>(url);
      
      if (response.success && response.data) {
        // Get feedback for this booking
        const feedbackUrl = buildUrl(API_ENDPOINTS.FEEDBACK.GET_ALL, { bookingId: id });
        const feedbackResponse = await apiFetch<BackendFeedbackResponse[]>(feedbackUrl);
        const feedback = feedbackResponse.success && feedbackResponse.data?.length 
          ? feedbackResponse.data[0] 
          : undefined;
        
        return mapBookingResponse(response.data, feedback);
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching booking:', error);
      return null;
    }
  },

  // Submit feedback for a completed booking - API ONLY
  submitFeedback: async (request: FeedbackRequest): Promise<{ success: boolean; message: string }> => {
    try {
      const url = `${API_BASE_URL}${API_ENDPOINTS.FEEDBACK.CREATE}`;
      console.log('Submitting feedback:', request);
      
      const response = await apiFetch<BackendFeedbackResponse>(url, {
        method: 'POST',
        body: JSON.stringify({
          bookingId: request.bookingId,
          rating: request.rating,
          comments: request.comment, // Backend uses 'comments' field
        }),
      });
      
      console.log('Feedback response:', response);
      
      if (response.success) {
        return { success: true, message: 'Đánh giá thành công! Cảm ơn bạn đã góp ý.' };
      }
      
      return { 
        success: false, 
        message: response.error?.message || 'Không thể gửi đánh giá. Vui lòng thử lại.' 
      };
    } catch (error) {
      console.error('Error submitting feedback:', error);
      return { 
        success: false, 
        message: 'Không thể kết nối đến server.' 
      };
    }
  },

  // Cancel a pending/approved booking - API ONLY
  cancelBooking: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const url = `${API_BASE_URL}${API_ENDPOINTS.BOOKING.CANCEL(id)}`;
      console.log('Cancelling booking:', id);
      
      const response = await apiFetch(url, {
        method: 'DELETE',
      });
      
      if (response.success) {
        return { success: true, message: 'Đã hủy đặt phòng thành công' };
      }
      
      return { 
        success: false, 
        message: response.error?.message || 'Không thể hủy đặt phòng.' 
      };
    } catch (error) {
      console.error('Error cancelling booking:', error);
      return { 
        success: false, 
        message: 'Không thể kết nối đến server.' 
      };
    }
  },

  // Get booking statistics - API ONLY
  getBookingStats: async (): Promise<{
    total: number;
    pending: number;
    approved: number;
    finish: number;
    rejected: number;
    cancelled: number;
    feedbackGiven: number;
  }> => {
    try {
      // Fetch all bookings to calculate stats
      const url = buildUrl(API_ENDPOINTS.BOOKING.GET_MY_BOOKINGS, { limit: 1000 });
      const response = await apiFetch<BackendBookingResponse[]>(url);
      
      if (response.success && response.data) {
        const bookings = response.data;
        
        // Get feedbacks
        const feedbackUrl = buildUrl(API_ENDPOINTS.FEEDBACK.GET_ALL, { limit: 1000 });
        const feedbackResponse = await apiFetch<BackendFeedbackResponse[]>(feedbackUrl);
        const feedbacks = feedbackResponse.success && feedbackResponse.data ? feedbackResponse.data : [];
        
        // Map backend statuses to frontend statuses for stats
        const mappedBookings = bookings.map(b => mapStatus(b.status));
        
        return {
          total: bookings.length,
          pending: mappedBookings.filter(s => s === 'Pending').length,
          approved: mappedBookings.filter(s => s === 'Approved').length,
          finish: mappedBookings.filter(s => s === 'Finish').length,
          rejected: mappedBookings.filter(s => s === 'Rejected').length,
          cancelled: mappedBookings.filter(s => s === 'Cancelled').length,
          feedbackGiven: feedbacks.length,
        };
      }
      
      return {
        total: 0,
        pending: 0,
        approved: 0,
        finish: 0,
        rejected: 0,
        cancelled: 0,
        feedbackGiven: 0,
      };
    } catch (error) {
      console.error('Error fetching booking stats:', error);
      return {
        total: 0,
        pending: 0,
        approved: 0,
        finish: 0,
        rejected: 0,
        cancelled: 0,
        feedbackGiven: 0,
      };
    }
  }
};
