import type { Booking, Facility, User, DashboardStats } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@fpt.edu.vn',
    role: 'student',
    studentId: 'SE123456'
  },
  {
    id: '2',
    name: 'Trần Thị B',
    email: 'tranthib@fpt.edu.vn',
    role: 'student',
    studentId: 'SE123457'
  },
  {
    id: '3',
    name: 'Lê Văn C',
    email: 'levanc@fpt.edu.vn',
    role: 'teacher',
    employeeId: 'EMP001'
  },
  {
    id: '4',
    name: 'Phạm Thị D',
    email: 'phamthid@fpt.edu.vn',
    role: 'teacher',
    employeeId: 'EMP002'
  }
];

export const mockFacilities: Facility[] = [
  // HCM Campus
  {
    id: 'f1',
    name: 'Phòng họp A1',
    type: 'meeting-room',
    campus: 'HCM',
    capacity: 20,
    location: 'Tầng 3, Tòa A',
    description: 'Phòng họp hiện đại với thiết bị trình chiếu',
    amenities: ['Projector', 'Whiteboard', 'WiFi', 'AC'],
    isActive: true
  },
  {
    id: 'f2',
    name: 'Phòng họp B2',
    type: 'meeting-room',
    campus: 'HCM',
    capacity: 30,
    location: 'Tầng 4, Tòa B',
    description: 'Phòng họp lớn cho các cuộc họp quan trọng',
    amenities: ['Projector', 'Video Conference', 'WiFi', 'AC'],
    isActive: true
  },
  {
    id: 'f3',
    name: 'Lab Máy tính 1',
    type: 'lab-room',
    campus: 'HCM',
    capacity: 40,
    location: 'Tầng 2, Tòa C',
    description: 'Phòng lab với 40 máy tính cấu hình cao',
    amenities: ['40 PCs', 'Projector', 'WiFi', 'AC'],
    isActive: true
  },
  {
    id: 'f4',
    name: 'Lab Điện tử',
    type: 'lab-room',
    campus: 'HCM',
    capacity: 25,
    location: 'Tầng 1, Tòa D',
    description: 'Phòng lab điện tử với thiết bị chuyên dụng',
    amenities: ['Equipment', 'Oscilloscope', 'WiFi'],
    isActive: true
  },
  {
    id: 'f5',
    name: 'Sân bóng đá',
    type: 'sports-field',
    campus: 'HCM',
    capacity: 22,
    location: 'Khu thể thao',
    description: 'Sân bóng đá cỏ nhân tạo tiêu chuẩn',
    amenities: ['Artificial Turf', 'Lighting', 'Changing Room'],
    isActive: true
  },
  {
    id: 'f6',
    name: 'Sân tennis',
    type: 'sports-field',
    campus: 'HCM',
    capacity: 4,
    location: 'Khu thể thao',
    description: 'Sân tennis trong nhà',
    amenities: ['Indoor', 'Lighting', 'Net'],
    isActive: true
  },
  // NVH Campus
  {
    id: 'f7',
    name: 'Phòng họp X1',
    type: 'meeting-room',
    campus: 'NVH',
    capacity: 25,
    location: 'Tầng 5, Tòa X',
    description: 'Phòng họp với view đẹp',
    amenities: ['Projector', 'Whiteboard', 'WiFi', 'AC'],
    isActive: true
  },
  {
    id: 'f8',
    name: 'Lab AI',
    type: 'lab-room',
    campus: 'NVH',
    capacity: 35,
    location: 'Tầng 3, Tòa Y',
    description: 'Phòng lab AI với GPU servers',
    amenities: ['GPU Servers', 'Projector', 'WiFi', 'AC'],
    isActive: true
  },
  {
    id: 'f9',
    name: 'Sân bóng rổ',
    type: 'sports-field',
    campus: 'NVH',
    capacity: 10,
    location: 'Khu thể thao',
    description: 'Sân bóng rổ trong nhà',
    amenities: ['Indoor', 'Lighting', 'Basketball Hoops'],
    isActive: true
  }
];

export const mockBookings: Booking[] = [
  {
    id: 'b1',
    facilityId: 'f1',
    facility: mockFacilities[0],
    userId: '1',
    user: mockUsers[0],
    startTime: new Date('2024-12-20T09:00:00'),
    endTime: new Date('2024-12-20T11:00:00'),
    status: 'approved',
    purpose: 'Họp nhóm dự án',
    createdAt: new Date('2024-12-18T10:00:00'),
    updatedAt: new Date('2024-12-18T10:30:00')
  },
  {
    id: 'b2',
    facilityId: 'f3',
    facility: mockFacilities[2],
    userId: '3',
    user: mockUsers[2],
    startTime: new Date('2024-12-20T14:00:00'),
    endTime: new Date('2024-12-20T16:00:00'),
    status: 'pending',
    purpose: 'Thực hành lập trình',
    createdAt: new Date('2024-12-19T15:00:00'),
    updatedAt: new Date('2024-12-19T15:00:00')
  },
  {
    id: 'b3',
    facilityId: 'f5',
    facility: mockFacilities[4],
    userId: '2',
    user: mockUsers[1],
    startTime: new Date('2024-12-21T08:00:00'),
    endTime: new Date('2024-12-21T10:00:00'),
    status: 'approved',
    purpose: 'Tập luyện bóng đá',
    createdAt: new Date('2024-12-19T08:00:00'),
    updatedAt: new Date('2024-12-19T08:15:00')
  },
  {
    id: 'b4',
    facilityId: 'f7',
    facility: mockFacilities[6],
    userId: '4',
    user: mockUsers[3],
    startTime: new Date('2024-12-22T13:00:00'),
    endTime: new Date('2024-12-22T15:00:00'),
    status: 'pending',
    purpose: 'Họp khoa',
    createdAt: new Date('2024-12-19T16:00:00'),
    updatedAt: new Date('2024-12-19T16:00:00')
  },
  {
    id: 'b5',
    facilityId: 'f2',
    facility: mockFacilities[1],
    userId: '1',
    user: mockUsers[0],
    startTime: new Date('2024-12-19T10:00:00'),
    endTime: new Date('2024-12-19T12:00:00'),
    status: 'completed',
    purpose: 'Thuyết trình dự án',
    createdAt: new Date('2024-12-17T09:00:00'),
    updatedAt: new Date('2024-12-19T12:00:00')
  },
  {
    id: 'b6',
    facilityId: 'f8',
    facility: mockFacilities[7],
    userId: '3',
    user: mockUsers[2],
    startTime: new Date('2024-12-23T09:00:00'),
    endTime: new Date('2024-12-23T11:00:00'),
    status: 'approved',
    purpose: 'Nghiên cứu AI',
    createdAt: new Date('2024-12-18T14:00:00'),
    updatedAt: new Date('2024-12-18T14:30:00')
  }
];

export const getDashboardStats = (): DashboardStats => {
  const totalBookings = mockBookings.length;
  const pendingBookings = mockBookings.filter(b => b.status === 'pending').length;
  const approvedBookings = mockBookings.filter(b => b.status === 'approved').length;
  const totalFacilities = mockFacilities.length;
  const activeFacilities = mockFacilities.filter(f => f.isActive).length;

  const bookingsByCampus = {
    HCM: mockBookings.filter(b => b.facility.campus === 'HCM').length,
    NVH: mockBookings.filter(b => b.facility.campus === 'NVH').length
  };

  const bookingsByType = {
    'meeting-room': mockBookings.filter(b => b.facility.type === 'meeting-room').length,
    'lab-room': mockBookings.filter(b => b.facility.type === 'lab-room').length,
    'sports-field': mockBookings.filter(b => b.facility.type === 'sports-field').length
  };

  return {
    totalBookings,
    pendingBookings,
    approvedBookings,
    totalFacilities,
    activeFacilities,
    bookingsByCampus,
    bookingsByType
  };
};

