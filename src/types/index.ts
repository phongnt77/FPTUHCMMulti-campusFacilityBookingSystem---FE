export type Campus = 'HCM' | 'NVH';

export type FacilityType = 'meeting-room' | 'lab-room' | 'sports-field';

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  studentId?: string;
  employeeId?: string;
}

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  campus: Campus;
  capacity: number;
  location: string;
  description?: string;
  amenities?: string[];
  isActive: boolean;
  imageUrl?: string;
}

export interface Booking {
  id: string;
  facilityId: string;
  facility: Facility;
  userId: string;
  user: User;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  purpose: string;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  approvedBookings: number;
  totalFacilities: number;
  activeFacilities: number;
  bookingsByCampus: {
    HCM: number;
    NVH: number;
  };
  bookingsByType: {
    'meeting-room': number;
    'lab-room': number;
    'sports-field': number;
  };
}

