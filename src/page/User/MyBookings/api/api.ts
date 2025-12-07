import type { Facility } from '../../../../types';
import { mockFacilities } from '../../../../data/adminMockData';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';

export interface Feedback {
  id: string;
  rating: number; // 1-5
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

// Mock bookings data
const mockUserBookings: UserBooking[] = [
  {
    id: 'BK001',
    lessonBookingId: 'LB001',
    lessonBookingDate: '2024-12-01',
    facilityId: 'f1',
    facility: mockFacilities[0],
    date: '2024-12-01',
    startTime: '09:00',
    endTime: '10:00',
    purpose: 'Họp nhóm dự án SWP391',
    numberOfPeople: 8,
    status: 'completed',
    createdAt: '2024-11-28T10:00:00Z',
    feedback: {
      id: 'FB001',
      rating: 5,
      comment: 'Phòng rất sạch sẽ, thiết bị hoạt động tốt!',
      createdAt: '2024-12-01T11:00:00Z'
    }
  },
  {
    id: 'BK002',
    lessonBookingId: 'LB002',
    lessonBookingDate: '2024-12-03',
    facilityId: 'f3',
    facility: mockFacilities[2],
    date: '2024-12-03',
    startTime: '14:00',
    endTime: '16:00',
    purpose: 'Thực hành lập trình Java',
    numberOfPeople: 25,
    status: 'completed',
    createdAt: '2024-12-01T08:00:00Z'
    // No feedback yet
  },
  {
    id: 'BK003',
    lessonBookingId: 'LB003',
    lessonBookingDate: '2024-12-10',
    facilityId: 'f2',
    facility: mockFacilities[1],
    date: '2024-12-10',
    startTime: '10:00',
    endTime: '11:00',
    purpose: 'Thuyết trình môn học',
    numberOfPeople: 15,
    status: 'confirmed',
    createdAt: '2024-12-04T09:00:00Z'
  },
  {
    id: 'BK004',
    lessonBookingId: 'LB004',
    lessonBookingDate: '2024-12-15',
    facilityId: 'f5',
    facility: mockFacilities[4],
    date: '2024-12-15',
    startTime: '18:00',
    endTime: '20:00',
    purpose: 'Tập luyện bóng đá CLB',
    numberOfPeople: 20,
    status: 'pending',
    createdAt: '2024-12-04T14:00:00Z'
  },
  {
    id: 'BK005',
    lessonBookingId: 'LB005',
    lessonBookingDate: '2024-12-05',
    facilityId: 'f1',
    facility: mockFacilities[0],
    date: '2024-12-05',
    startTime: '15:00',
    endTime: '16:00',
    purpose: 'Họp ban cán sự lớp',
    numberOfPeople: 5,
    status: 'rejected',
    createdAt: '2024-12-03T10:00:00Z',
    rejectionReason: 'Phòng đã được đặt cho sự kiện khác'
  },
  {
    id: 'BK006',
    lessonBookingId: 'LB006',
    lessonBookingDate: '2024-12-02',
    facilityId: 'f7',
    facility: mockFacilities[6],
    date: '2024-12-02',
    startTime: '08:00',
    endTime: '10:00',
    purpose: 'Workshop AI/ML',
    numberOfPeople: 20,
    status: 'completed',
    createdAt: '2024-11-30T16:00:00Z'
    // No feedback yet - can be reviewed
  }
];

export interface FeedbackRequest {
  bookingId: string;
  rating: number;
  comment: string;
}

export const myBookingsApi = {
  // Get all bookings for current user
  getMyBookings: async (status?: BookingStatus): Promise<UserBooking[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let bookings = [...mockUserBookings];
        
        if (status) {
          bookings = bookings.filter(b => b.status === status);
        }
        
        // Sort by date descending (newest first)
        bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        resolve(bookings);
      }, 300);
    });
  },

  // Get booking by ID
  getBookingById: async (id: string): Promise<UserBooking | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const booking = mockUserBookings.find(b => b.id === id);
        resolve(booking || null);
      }, 200);
    });
  },

  // Submit feedback for a completed booking
  submitFeedback: async (request: FeedbackRequest): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const booking = mockUserBookings.find(b => b.id === request.bookingId);
        
        if (!booking) {
          resolve({ success: false, message: 'Không tìm thấy đơn đặt phòng' });
          return;
        }
        
        if (booking.status !== 'completed') {
          resolve({ success: false, message: 'Chỉ có thể đánh giá sau khi đã sử dụng phòng' });
          return;
        }
        
        if (booking.feedback) {
          resolve({ success: false, message: 'Bạn đã đánh giá đơn đặt phòng này rồi' });
          return;
        }
        
        // Add feedback to booking
        booking.feedback = {
          id: `FB${Date.now()}`,
          rating: request.rating,
          comment: request.comment,
          createdAt: new Date().toISOString()
        };
        
        resolve({ success: true, message: 'Đánh giá thành công! Cảm ơn bạn đã góp ý.' });
      }, 500);
    });
  },

  // Cancel a pending booking
  cancelBooking: async (id: string): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const booking = mockUserBookings.find(b => b.id === id);
        
        if (!booking) {
          resolve({ success: false, message: 'Không tìm thấy đơn đặt phòng' });
          return;
        }
        
        if (booking.status !== 'pending' && booking.status !== 'confirmed') {
          resolve({ success: false, message: 'Không thể hủy đơn đặt phòng này' });
          return;
        }
        
        booking.status = 'cancelled';
        resolve({ success: true, message: 'Đã hủy đặt phòng thành công' });
      }, 300);
    });
  },

  // Get booking statistics
  getBookingStats: async (): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    feedbackGiven: number;
  }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          total: mockUserBookings.length,
          pending: mockUserBookings.filter(b => b.status === 'pending').length,
          confirmed: mockUserBookings.filter(b => b.status === 'confirmed').length,
          completed: mockUserBookings.filter(b => b.status === 'completed').length,
          cancelled: mockUserBookings.filter(b => b.status === 'cancelled' || b.status === 'rejected').length,
          feedbackGiven: mockUserBookings.filter(b => b.feedback).length,
        });
      }, 200);
    });
  }
};


