import { API_BASE_URL, API_ENDPOINTS, apiFetch, buildUrl } from '../../../../services/api.config';
import type { Facility, Campus, FacilityType } from '../../../../types';

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface BookingRequest {
  facilityId: string;
  userId: string;
  date: string;
  timeSlotId: string;
  startTime: string;
  endTime: string;
  purpose: string;
  numberOfPeople: number;
  notes?: string;
}

export interface BookingResponse {
  id: string;
  status: 'pending' | 'confirmed' | 'rejected';
  message: string;
}

// Backend response types
interface FacilityResponse {
  facilityId: string;
  name: string;
  description: string;
  capacity: number;
  roomNumber: string;
  floorNumber: string;
  campusId: string;
  campusName: string;
  typeId: string;
  typeName: string;
  status: string;
  amenities: string;
  imageUrl?: string;
}

interface BackendBookingResponse {
  bookingId: string;
  facilityId: string;
  userId: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: string;
  estimatedAttendees: number;
  specialRequirements: string;
}

// Map backend facility response to frontend type
const mapFacilityResponse = (f: FacilityResponse): Facility => ({
  id: f.facilityId,
  name: f.name,
  campus: (f.campusName?.includes('NVH') || f.campusName?.includes('Nhà Văn Hóa') || f.campusName?.includes('Sinh Viên') ? 'NVH' : 'HCM') as Campus,
  type: mapFacilityType(f.typeName),
  capacity: f.capacity,
  location: `${f.roomNumber}, Tầng ${f.floorNumber}`,
  amenities: f.amenities ? f.amenities.split(',').map(a => a.trim()) : [],
  imageUrl: f.imageUrl || '/images/default-facility.jpg',
  isActive: f.status === 'Available',
  description: f.description,
});

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

// Generate time slots for a facility
const generateTimeSlots = (date: string, bookedSlots: string[] = []): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const baseDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Operating hours: 7:00 - 21:00
  for (let hour = 7; hour < 21; hour++) {
    const slotDate = new Date(baseDate);
    slotDate.setHours(hour, 0, 0, 0);
    
    // Past time slots are always unavailable
    const isPastSlot = baseDate.getTime() === today.getTime() && hour <= new Date().getHours();
    const isBooked = bookedSlots.includes(`${hour.toString().padStart(2, '0')}:00`);
    
    slots.push({
      id: `slot-${hour}`,
      startTime: `${hour.toString().padStart(2, '0')}:00`,
      endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
      isAvailable: !isPastSlot && !isBooked,
    });
  }
  
  return slots;
};

export const bookingApi = {
  // Get facility details by ID - API ONLY
  getFacilityById: async (id: string): Promise<Facility | null> => {
    try {
      const url = `${API_BASE_URL}${API_ENDPOINTS.FACILITY.GET_BY_ID(id)}`;
      console.log('Fetching facility:', url);
      
      const response = await apiFetch<FacilityResponse>(url);
      
      if (response.success && response.data) {
        return mapFacilityResponse(response.data);
      }
      
      console.error('Facility not found:', response.error);
      return null;
    } catch (error) {
      console.error('Error fetching facility:', error);
      return null;
    }
  },

  // Get available time slots for a facility on a specific date - API ONLY
  getAvailableTimeSlots: async (facilityId: string, date: string): Promise<TimeSlot[]> => {
    try {
      // Get existing bookings for this facility
      const url = buildUrl(API_ENDPOINTS.BOOKING.GET_ALL, {
        facilityId,
        page: 1,
        limit: 100,
      });
      
      const response = await apiFetch<BackendBookingResponse[]>(url);
      
      // Extract booked time slots
      const bookedSlots: string[] = [];
      if (response.success && response.data) {
        response.data.forEach(booking => {
          if (booking.status !== 'Cancelled' && booking.status !== 'Rejected') {
            const bookingDate = booking.startTime.split('T')[0];
            if (bookingDate === date) {
              const hour = new Date(booking.startTime).getHours();
              bookedSlots.push(`${hour.toString().padStart(2, '0')}:00`);
            }
          }
        });
      }
      
      return generateTimeSlots(date, bookedSlots);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      // Return slots with no bookings if API fails
      return generateTimeSlots(date, []);
    }
  },

  // Submit a booking request - API ONLY
  submitBooking: async (booking: BookingRequest): Promise<BookingResponse> => {
    try {
      const url = `${API_BASE_URL}${API_ENDPOINTS.BOOKING.CREATE}`;
      
      // Format dates for backend
      const startDateTime = `${booking.date}T${booking.startTime}:00`;
      const endDateTime = `${booking.date}T${booking.endTime}:00`;
      
      console.log('Submitting booking:', { url, booking });
      
      const response = await apiFetch<BackendBookingResponse>(url, {
        method: 'POST',
        body: JSON.stringify({
          facilityId: booking.facilityId,
          userId: booking.userId,
          startTime: startDateTime,
          endTime: endDateTime,
          purpose: booking.purpose,
          estimatedAttendees: booking.numberOfPeople,
          specialRequirements: booking.notes || '',
        }),
      });
      
      console.log('Booking response:', response);
      
      if (response.success && response.data) {
        return {
          id: response.data.bookingId,
          status: 'pending',
          message: 'Yêu cầu đặt phòng đã được gửi thành công! Vui lòng chờ phê duyệt.',
        };
      }
      
      // Return error
      return {
        id: '',
        status: 'rejected',
        message: response.error?.message || 'Đã xảy ra lỗi khi đặt phòng. Vui lòng thử lại.',
      };
    } catch (error) {
      console.error('Error submitting booking:', error);
      return {
        id: '',
        status: 'rejected',
        message: 'Không thể kết nối đến server. Vui lòng kiểm tra Backend đang chạy.',
      };
    }
  },
};
