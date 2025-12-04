import type { Facility } from '../../../../types';
import { mockFacilities } from '../../../../data/adminMockData';

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface BookingRequest {
  facilityId: string;
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

// Generate time slots for a facility
const generateTimeSlots = (date: string): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const baseDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Operating hours: 7:00 - 21:00
  for (let hour = 7; hour < 21; hour++) {
    const slotDate = new Date(baseDate);
    slotDate.setHours(hour, 0, 0, 0);
    
    // Randomly mark some slots as unavailable (for demo purposes)
    // Past time slots are always unavailable
    const isPastSlot = baseDate.getTime() === today.getTime() && hour <= new Date().getHours();
    const randomUnavailable = Math.random() < 0.3; // 30% chance of being booked
    
    slots.push({
      id: `slot-${hour}`,
      startTime: `${hour.toString().padStart(2, '0')}:00`,
      endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
      isAvailable: !isPastSlot && !randomUnavailable,
    });
  }
  
  return slots;
};

export const bookingApi = {
  // Get facility details by ID
  getFacilityById: async (id: string): Promise<Facility | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const facility = mockFacilities.find(f => f.id === id && f.isActive);
        resolve(facility || null);
      }, 300);
    });
  },

  // Get available time slots for a facility on a specific date
  getAvailableTimeSlots: async (facilityId: string, date: string): Promise<TimeSlot[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Check if facility exists
        const facility = mockFacilities.find(f => f.id === facilityId);
        if (!facility) {
          resolve([]);
          return;
        }
        
        const slots = generateTimeSlots(date);
        resolve(slots);
      }, 400);
    });
  },

  // Submit a booking request
  submitBooking: async (booking: BookingRequest): Promise<BookingResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate booking submission
        const bookingId = `BK${Date.now()}`;
        resolve({
          id: bookingId,
          status: 'pending',
          message: 'Yêu cầu đặt phòng đã được gửi thành công! Vui lòng chờ phê duyệt.',
        });
      }, 500);
    });
  },
};
