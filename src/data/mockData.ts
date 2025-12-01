// Types
export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
export type UserRole = 'student' | 'lecturer' | 'admin';
export type FacilityStatus = 'available' | 'maintenance' | 'occupied';

export interface Campus {
  id: string;
  name: string;
  code: string;
  address: string;
}

export interface FacilityType {
  id: string;
  name: string;
  icon: string;
}

export interface Facility {
  id: string;
  name: string;
  campusId: string;
  typeId: string;
  capacity: number;
  status: FacilityStatus;
  imageUrl: string;
  equipment: string[];
  description: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  avatarUrl?: string;
  isBanned: boolean;
  banReason?: string;
}

export interface Booking {
  id: string;
  userId: string;
  facilityId: string;
  startTime: string;
  endTime: string;
  purpose: string;
  attendeeCount: number;
  status: BookingStatus;
  equipmentRequests: string[];
  createdAt: string;
  updatedAt: string;
  rejectReason?: string;
  approvedBy?: string;
  approvedAt?: string;
}

// Mock Data
export const campuses: Campus[] = [
  {
    id: 'campus-q9',
    name: 'FPT University HCM - Quận 9',
    code: 'Q9',
    address: 'Lô E2a-7, Đường D1, Khu Công nghệ cao, P. Long Thạnh Mỹ, TP. Thủ Đức, TP. HCM'
  },
  {
    id: 'campus-nvh',
    name: 'FPT University HCM - Nguyễn Văn Hưởng',
    code: 'NVH',
    address: '778 Nguyễn Văn Hưởng, P. Thảo Điền, TP. Thủ Đức, TP. HCM'
  }
];

export const facilityTypes: FacilityType[] = [
  { id: 'type-meeting', name: 'Phòng họp', icon: '🏢' },
  { id: 'type-lab', name: 'Phòng Lab', icon: '💻' },
  { id: 'type-football', name: 'Sân bóng đá', icon: '⚽' },
  { id: 'type-badminton', name: 'Sân cầu lông', icon: '🏸' },
  { id: 'type-basketball', name: 'Sân bóng rổ', icon: '🏀' },
  { id: 'type-auditorium', name: 'Hội trường', icon: '🎭' }
];

export const facilities: Facility[] = [
  {
    id: 'fac-101',
    name: 'Phòng họp R.101',
    campusId: 'campus-q9',
    typeId: 'type-meeting',
    capacity: 20,
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
    equipment: ['Projector', 'Whiteboard', 'AC', 'Video Conference'],
    description: 'Phòng họp hiện đại với đầy đủ trang thiết bị'
  },
  {
    id: 'fac-102',
    name: 'Phòng họp R.102',
    campusId: 'campus-q9',
    typeId: 'type-meeting',
    capacity: 15,
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
    equipment: ['Projector', 'Whiteboard', 'AC'],
    description: 'Phòng họp nhỏ phù hợp cho các cuộc họp team'
  },
  {
    id: 'fac-lab-a',
    name: 'Lab A - Lập trình',
    campusId: 'campus-q9',
    typeId: 'type-lab',
    capacity: 40,
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
    equipment: ['40 máy tính', 'Projector', 'AC'],
    description: 'Phòng Lab với 40 máy tính cấu hình cao'
  },
  {
    id: 'fac-football-a',
    name: 'Sân bóng đá A',
    campusId: 'campus-q9',
    typeId: 'type-football',
    capacity: 22,
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=400',
    equipment: ['Đèn chiếu sáng', 'Ghế khán đài'],
    description: 'Sân cỏ nhân tạo tiêu chuẩn 5 người'
  },
  {
    id: 'fac-badminton-1',
    name: 'Sân cầu lông 1',
    campusId: 'campus-q9',
    typeId: 'type-badminton',
    capacity: 4,
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400',
    equipment: ['Lưới', 'Đèn chiếu sáng'],
    description: 'Sân cầu lông tiêu chuẩn trong nhà'
  },
  {
    id: 'fac-nvh-101',
    name: 'Phòng họp NVH-101',
    campusId: 'campus-nvh',
    typeId: 'type-meeting',
    capacity: 25,
    status: 'maintenance',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
    equipment: ['Projector', 'Whiteboard', 'AC', 'Sound System'],
    description: 'Phòng họp lớn tại campus NVH'
  }
];

export const users: User[] = [
  {
    id: 'user-1',
    email: 'student1@fpt.edu.vn',
    name: 'Nguyễn Văn An',
    role: 'student',
    department: 'SE1801',
    isBanned: false
  },
  {
    id: 'user-2',
    email: 'lecturer1@fpt.edu.vn',
    name: 'TS. Trần Thị Bình',
    role: 'lecturer',
    department: 'Khoa CNTT',
    isBanned: false
  },
  {
    id: 'user-3',
    email: 'admin@fpt.edu.vn',
    name: 'Lê Văn Cường',
    role: 'admin',
    department: 'Phòng CSVC',
    isBanned: false
  },
  {
    id: 'user-4',
    email: 'student2@fpt.edu.vn',
    name: 'Phạm Thị Dung',
    role: 'student',
    department: 'SE1802',
    isBanned: true,
    banReason: 'Hủy đặt phòng quá 3 lần trong tháng'
  }
];

export const bookings: Booking[] = [
  {
    id: 'booking-001',
    userId: 'user-1',
    facilityId: 'fac-101',
    startTime: '2024-12-02T09:00:00',
    endTime: '2024-12-02T11:00:00',
    purpose: 'Họp nhóm đồ án SWP391',
    attendeeCount: 6,
    status: 'approved',
    equipmentRequests: ['Projector'],
    createdAt: '2024-11-28T10:30:00',
    updatedAt: '2024-11-28T14:00:00',
    approvedBy: 'user-3',
    approvedAt: '2024-11-28T14:00:00'
  },
  {
    id: 'booking-002',
    userId: 'user-1',
    facilityId: 'fac-football-a',
    startTime: '2024-12-03T17:00:00',
    endTime: '2024-12-03T18:30:00',
    purpose: 'Đá bóng giao lưu CLB IT',
    attendeeCount: 14,
    status: 'pending',
    equipmentRequests: [],
    createdAt: '2024-11-29T08:00:00',
    updatedAt: '2024-11-29T08:00:00'
  },
  {
    id: 'booking-003',
    userId: 'user-1',
    facilityId: 'fac-badminton-1',
    startTime: '2024-11-25T18:00:00',
    endTime: '2024-11-25T19:00:00',
    purpose: 'Luyện tập cầu lông',
    attendeeCount: 2,
    status: 'completed',
    equipmentRequests: [],
    createdAt: '2024-11-20T15:00:00',
    updatedAt: '2024-11-25T19:00:00'
  },
  {
    id: 'booking-004',
    userId: 'user-1',
    facilityId: 'fac-102',
    startTime: '2024-11-22T14:00:00',
    endTime: '2024-11-22T16:00:00',
    purpose: 'Phỏng vấn thực tập',
    attendeeCount: 4,
    status: 'rejected',
    equipmentRequests: ['Video Conference'],
    createdAt: '2024-11-18T09:00:00',
    updatedAt: '2024-11-19T10:00:00',
    rejectReason: 'Trùng lịch với cuộc họp ưu tiên của giảng viên'
  },
  {
    id: 'booking-005',
    userId: 'user-1',
    facilityId: 'fac-lab-a',
    startTime: '2024-11-20T08:00:00',
    endTime: '2024-11-20T10:00:00',
    purpose: 'Workshop lập trình Python',
    attendeeCount: 30,
    status: 'cancelled',
    equipmentRequests: ['Projector'],
    createdAt: '2024-11-15T11:00:00',
    updatedAt: '2024-11-18T16:00:00'
  },
  {
    id: 'booking-006',
    userId: 'user-2',
    facilityId: 'fac-101',
    startTime: '2024-12-02T14:00:00',
    endTime: '2024-12-02T16:00:00',
    purpose: 'Họp khoa định kỳ',
    attendeeCount: 12,
    status: 'approved',
    equipmentRequests: ['Projector', 'Video Conference'],
    createdAt: '2024-11-27T09:00:00',
    updatedAt: '2024-11-27T10:30:00',
    approvedBy: 'user-3',
    approvedAt: '2024-11-27T10:30:00'
  },
  {
    id: 'booking-007',
    userId: 'user-2',
    facilityId: 'fac-lab-a',
    startTime: '2024-12-05T08:00:00',
    endTime: '2024-12-05T12:00:00',
    purpose: 'Hướng dẫn thực hành PRF192',
    attendeeCount: 35,
    status: 'pending',
    equipmentRequests: ['Projector'],
    createdAt: '2024-11-30T14:00:00',
    updatedAt: '2024-11-30T14:00:00'
  },
  {
    id: 'booking-008',
    userId: 'user-4',
    facilityId: 'fac-badminton-1',
    startTime: '2024-12-04T18:00:00',
    endTime: '2024-12-04T19:00:00',
    purpose: 'Tập luyện cầu lông',
    attendeeCount: 2,
    status: 'pending',
    equipmentRequests: [],
    createdAt: '2024-11-30T16:00:00',
    updatedAt: '2024-11-30T16:00:00'
  }
];

// Helper functions
export const getBookingsByUserId = (userId: string): Booking[] => {
  return bookings.filter(booking => booking.userId === userId);
};

export const getFacilityById = (facilityId: string): Facility | undefined => {
  return facilities.find(facility => facility.id === facilityId);
};

export const getUserById = (userId: string): User | undefined => {
  return users.find(user => user.id === userId);
};

export const getCampusById = (campusId: string): Campus | undefined => {
  return campuses.find(campus => campus.id === campusId);
};

export const getFacilityTypeById = (typeId: string): FacilityType | undefined => {
  return facilityTypes.find(type => type.id === typeId);
};

export const getBookingStatusLabel = (status: BookingStatus): string => {
  const labels: Record<BookingStatus, string> = {
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
    rejected: 'Từ chối',
    cancelled: 'Đã hủy',
    completed: 'Hoàn thành'
  };
  return labels[status];
};

export const getBookingStatusColor = (status: BookingStatus): string => {
  const colors: Record<BookingStatus, string> = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200'
  };
  return colors[status];
};

// Current logged in user (mock)
export const currentUser = users[0]; // Student user for testing
export const adminUser = users[2]; // Admin user for testing

