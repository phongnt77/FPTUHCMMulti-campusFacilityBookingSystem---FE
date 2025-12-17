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

// System Settings types
export interface SystemSettings {
  minimumBookingHoursBeforeStart: number;
  checkInMinutesBeforeStart: number;
  checkInMinutesAfterStart: number;
  checkoutMinRatio: number;
  checkOutMinutesAfterCheckIn: number;
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
    'Laboratory': 'Laboratory',
    'Sport Facility': 'Sport Facility',
  };
  return typeMap[typeName] || 'Classroom';
};

// Generate time slots for a facility
// minimumBookingHours must be provided (from system settings)
const generateTimeSlots = (date: string, bookedSlots: string[] = [], minimumBookingHours: number): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  
  // Parse the date string (format: YYYY-MM-DD)
  const baseDate = new Date(date + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const now = new Date();
  
  // Normalize dates to compare only the date part (ignore time)
  const baseDateOnly = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  // Check if the selected date is in the past
  const isPastDate = baseDateOnly.getTime() < todayOnly.getTime();
  const isToday = baseDateOnly.getTime() === todayOnly.getTime();
  
  // Get current hour and minute
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Operating hours: 7:00 - 21:00
  for (let hour = 7; hour < 21; hour++) {
    // Calculate the slot start time
    const slotStartTime = new Date(baseDate);
    slotStartTime.setHours(hour, 0, 0, 0);
    
    // Calculate time difference in hours between slot start time and current time
    const hoursUntilSlot = (slotStartTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // Past time slots are always unavailable
    // - If the date is in the past, all slots are unavailable
    // - If it's today, only slots that have already passed are unavailable
    let isPastSlot = false;
    if (isPastDate) {
      isPastSlot = true; // Entire day is in the past
    } else if (isToday) {
      // Same day - disable only slots that have already passed (slot start time < current time)
      // If current time is 7:36, slot 7:00 is in the past (7:00 < 7:36)
      // If current time is 7:36, slot 8:00 is in the future (8:00 > 7:36)
      if (slotStartTime.getTime() < now.getTime()) {
        isPastSlot = true; // Slot has already passed
      }
    }
    
    // Check if slot is within minimum booking hours (must book at least X hours in advance)
    // Example: If minimumBookingHours = 3, current time is 7:36, slot 10:00 is disabled (10:00 - 7:36 = 2.4 hours < 3 hours)
    // Example: If minimumBookingHours = 3, current time is 7:36, slot 11:00 is available (11:00 - 7:36 = 3.4 hours >= 3 hours)
    // Only check for future slots (hoursUntilSlot > 0)
    const isWithinMinimumHours = hoursUntilSlot > 0 && hoursUntilSlot < minimumBookingHours;
    
    const isBooked = bookedSlots.includes(`${hour.toString().padStart(2, '0')}:00`);
    
    slots.push({
      id: `slot-${hour}`,
      startTime: `${hour.toString().padStart(2, '0')}:00`,
      endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
      isAvailable: !isPastSlot && !isWithinMinimumHours && !isBooked,
    });
  }
  
  return slots;
};

export const bookingApi = {
  // Get system settings (public endpoint)
  getSystemSettings: async (): Promise<SystemSettings | null> => {
    try {
      const url = `${API_BASE_URL}${API_ENDPOINTS.SYSTEM_SETTINGS.GET}`;
      console.log('Fetching system settings:', url);
      
      const response = await apiFetch<SystemSettings>(url);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      console.error('Failed to fetch system settings:', response.error);
      // Return null if API fails - let caller handle the error
      return null;
    } catch (error) {
      console.error('Error fetching system settings:', error);
      // Return null if API fails - let caller handle the error
      return null;
    }
  },

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
  // minimumBookingHours must be provided (from system settings)
  getAvailableTimeSlots: async (facilityId: string, date: string, minimumBookingHours: number): Promise<TimeSlot[]> => {
    try {
      // Get existing bookings for this facility
      const url = buildUrl(API_ENDPOINTS.BOOKING.GET_ALL, {
        facilityId,
        page: 1,
        limit: 100,
      });
      
      const response = await apiFetch<BackendBookingResponse[]>(url);
      
      // Extract booked time slots - mark all hours that overlap with bookings
      const bookedSlots: string[] = [];
      if (response.success && response.data) {
        response.data.forEach(booking => {
          // Only consider active bookings (not cancelled or rejected)
          if (booking.status !== 'Cancelled' && booking.status !== 'Rejected') {
            const bookingStart = new Date(booking.startTime);
            const bookingEnd = new Date(booking.endTime);
            const bookingDate = bookingStart.toISOString().split('T')[0];
            
            // Check if booking is on the selected date
            if (bookingDate === date) {
              // Get start and end hours
              const startHour = bookingStart.getHours();
              const endHour = bookingEnd.getHours();
              const endMinute = bookingEnd.getMinutes();
              
              // Mark all hours that overlap with this booking
              // If booking is 8:00-10:00, disable slots 8:00 and 9:00
              for (let hour = startHour; hour < endHour; hour++) {
                const slotTime = `${hour.toString().padStart(2, '0')}:00`;
                if (!bookedSlots.includes(slotTime)) {
                  bookedSlots.push(slotTime);
                }
              }
              
              // Also check if the booking extends into the next hour
              // If booking ends at 10:30, we should also disable 10:00 slot
              if (endMinute > 0 && endHour < 21) {
                const slotTime = `${endHour.toString().padStart(2, '0')}:00`;
                if (!bookedSlots.includes(slotTime)) {
                  bookedSlots.push(slotTime);
                }
              }
            }
          }
        });
      }
      
      return generateTimeSlots(date, bookedSlots, minimumBookingHours);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      // Return empty slots if API fails - caller should handle the error
      throw error;
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
