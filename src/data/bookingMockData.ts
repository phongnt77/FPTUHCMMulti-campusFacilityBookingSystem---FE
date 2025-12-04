// Mock booking data based on database schema
import type { Booking, Facility, User } from '../types'
import { mockFacilities, mockUsers } from './adminMockData'

export interface BookingDetail extends Booking {
  category?: string
  estimated_attendees?: number
  special_requirements?: Record<string, any>
  rejection_reason?: string
  approved_by?: string
  approved_at?: Date
}

export const mockBookingDetails: BookingDetail[] = [
  {
    id: 'b1',
    facilityId: 'f1',
    facility: mockFacilities[0],
    userId: '1',
    user: mockUsers[0],
    startTime: new Date('2025-01-20T09:00:00'),
    endTime: new Date('2025-01-20T11:00:00'),
    status: 'pending',
    purpose: 'Họp nhóm dự án cuối kỳ',
    category: 'Academic',
    estimated_attendees: 8,
    special_requirements: {
      projector: true,
      whiteboard: true,
      wifi: true
    },
    createdAt: new Date('2025-01-18T10:00:00'),
    updatedAt: new Date('2025-01-18T10:00:00')
  },
  {
    id: 'b2',
    facilityId: 'f3',
    facility: mockFacilities[2],
    userId: '3',
    user: mockUsers[2],
    startTime: new Date('2025-01-20T14:00:00'),
    endTime: new Date('2025-01-20T16:00:00'),
    status: 'pending',
    purpose: 'Thực hành lập trình Java',
    category: 'Teaching',
    estimated_attendees: 35,
    special_requirements: {
      computers: 35,
      projector: true,
      software: ['IntelliJ IDEA', 'JDK 17']
    },
    createdAt: new Date('2025-01-19T15:00:00'),
    updatedAt: new Date('2025-01-19T15:00:00')
  },
  {
    id: 'b3',
    facilityId: 'f7',
    facility: mockFacilities[6],
    userId: '4',
    user: mockUsers[3],
    startTime: new Date('2025-01-22T13:00:00'),
    endTime: new Date('2025-01-22T15:00:00'),
    status: 'pending',
    purpose: 'Họp khoa định kỳ tháng 1',
    category: 'Administrative',
    estimated_attendees: 20,
    special_requirements: {
      projector: true,
      video_conference: true,
      refreshments: true
    },
    createdAt: new Date('2025-01-19T16:00:00'),
    updatedAt: new Date('2025-01-19T16:00:00')
  },
  {
    id: 'b4',
    facilityId: 'f5',
    facility: mockFacilities[4],
    userId: '2',
    user: mockUsers[1],
    startTime: new Date('2025-01-21T08:00:00'),
    endTime: new Date('2025-01-21T10:00:00'),
    status: 'pending',
    purpose: 'Tập luyện bóng đá cho giải đấu sinh viên',
    category: 'Sports',
    estimated_attendees: 22,
    special_requirements: {
      equipment: 'Bóng đá, cọc cờ',
      changing_room: true
    },
    createdAt: new Date('2025-01-19T08:00:00'),
    updatedAt: new Date('2025-01-19T08:00:00')
  },
  {
    id: 'b5',
    facilityId: 'f2',
    facility: mockFacilities[1],
    userId: '1',
    user: mockUsers[0],
    startTime: new Date('2025-01-23T10:00:00'),
    endTime: new Date('2025-01-23T12:00:00'),
    status: 'pending',
    purpose: 'Thuyết trình bảo vệ đồ án',
    category: 'Academic',
    estimated_attendees: 15,
    special_requirements: {
      projector: true,
      microphone: true,
      video_recording: true
    },
    createdAt: new Date('2025-01-20T09:00:00'),
    updatedAt: new Date('2025-01-20T09:00:00')
  },
  {
    id: 'b6',
    facilityId: 'f8',
    facility: mockFacilities[7],
    userId: '3',
    user: mockUsers[2],
    startTime: new Date('2025-01-24T09:00:00'),
    endTime: new Date('2025-01-24T11:00:00'),
    status: 'pending',
    purpose: 'Nghiên cứu và training mô hình AI',
    category: 'Research',
    estimated_attendees: 5,
    special_requirements: {
      gpu_servers: true,
      high_performance_computing: true
    },
    createdAt: new Date('2025-01-20T14:00:00'),
    updatedAt: new Date('2025-01-20T14:00:00')
  }
]

export const getPendingBookings = (): BookingDetail[] => {
  return mockBookingDetails.filter((booking) => booking.status === 'pending')
}

export const getBookingById = (bookingId: string): BookingDetail | undefined => {
  return mockBookingDetails.find((booking) => booking.id === bookingId)
}

