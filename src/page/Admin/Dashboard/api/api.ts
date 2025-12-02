import type { Booking, Facility, DashboardStats, BookingStatus, Campus, FacilityType } from '../../../../types';
import { mockBookings, mockFacilities, getDashboardStats } from '../../../../data/adminMockData';

export const adminApi = {
  // Get dashboard statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getDashboardStats());
      }, 300);
    });
  },

  // Get all bookings
  getBookings: async (filters?: {
    campus?: Campus;
    status?: BookingStatus;
    facilityType?: FacilityType;
  }): Promise<Booking[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = [...mockBookings];
        
        if (filters?.campus) {
          filtered = filtered.filter(b => b.facility.campus === filters.campus);
        }
        
        if (filters?.status) {
          filtered = filtered.filter(b => b.status === filters.status);
        }
        
        if (filters?.facilityType) {
          filtered = filtered.filter(b => b.facility.type === filters.facilityType);
        }
        
        resolve(filtered);
      }, 300);
    });
  },

  // Get all facilities
  getFacilities: async (campus?: Campus): Promise<Facility[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = [...mockFacilities];
        
        if (campus) {
          filtered = filtered.filter(f => f.campus === campus);
        }
        
        resolve(filtered);
      }, 300);
    });
  },

  // Update booking status
  updateBookingStatus: async (bookingId: string, status: BookingStatus): Promise<Booking> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const booking = mockBookings.find(b => b.id === bookingId);
        if (booking) {
          booking.status = status;
          booking.updatedAt = new Date();
          resolve(booking);
        } else {
          reject(new Error('Booking not found'));
        }
      }, 300);
    });
  },

  // Delete booking
  deleteBooking: async (bookingId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockBookings.findIndex(b => b.id === bookingId);
        if (index !== -1) {
          mockBookings.splice(index, 1);
          resolve();
        } else {
          reject(new Error('Booking not found'));
        }
      }, 300);
    });
  }
};

