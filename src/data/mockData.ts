// Mock data for Facility Booking System

export interface Facility {
  id: string;
  name: string;
  type: 'Phòng họp' | 'Phòng Lab' | 'Sân bóng đá' | 'Sân cầu lông' | 'Phòng học';
  campus: 'Q9' | 'NVH' | 'HCM';
  location: string;
  capacity: number;
  description: string;
  amenities: string[];
  images: string[];
  operatingHours: {
    open: string; // "08:00"
    close: string; // "22:00"
  };
  status: 'available' | 'maintenance' | 'closed';
}

export interface TimeSlot {
  id: string;
  facilityId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: 'available' | 'booked' | 'maintenance' | 'pending';
  bookedBy?: string;
}

export interface Booking {
  id: string;
  facilityId: string;
  userId: string;
  userName: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  numberOfPeople: number;
  equipmentRequests?: string[];
  status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';
  rejectionReason?: string;
  qrCode?: string;
  createdAt: string;
}

export const facilities: Facility[] = [
  {
    id: 'f1',
    name: 'Phòng họp A1.01',
    type: 'Phòng họp',
    campus: 'Q9',
    location: 'Tòa A, Tầng 1',
    capacity: 20,
    description: 'Phòng họp hiện đại với hệ thống âm thanh và màn hình trình chiếu. Phù hợp cho các cuộc họp nhóm, thuyết trình.',
    amenities: ['Máy chiếu', 'Loa', 'Micro', 'Bảng trắng', 'WiFi'],
    images: ['/images/meeting-room-1.jpg'],
    operatingHours: { open: '08:00', close: '22:00' },
    status: 'available'
  },
  {
    id: 'f2',
    name: 'Phòng Lab CNTT B2.05',
    type: 'Phòng Lab',
    campus: 'Q9',
    location: 'Tòa B, Tầng 2',
    capacity: 40,
    description: 'Phòng lab máy tính với 40 máy cấu hình cao, phục vụ cho các môn học lập trình và thực hành CNTT.',
    amenities: ['Máy tính', 'Máy chiếu', 'Bảng tương tác', 'WiFi'],
    images: ['/images/lab-1.jpg'],
    operatingHours: { open: '07:00', close: '21:00' },
    status: 'available'
  },
  {
    id: 'f3',
    name: 'Sân bóng đá Sân vận động',
    type: 'Sân bóng đá',
    campus: 'Q9',
    location: 'Khu thể thao',
    capacity: 22,
    description: 'Sân bóng đá cỏ nhân tạo tiêu chuẩn, có hệ thống chiếu sáng ban đêm.',
    amenities: ['Cỏ nhân tạo', 'Đèn chiếu sáng', 'Phòng thay đồ', 'Nhà vệ sinh'],
    images: ['/images/football-field-1.jpg'],
    operatingHours: { open: '06:00', close: '22:00' },
    status: 'available'
  },
  {
    id: 'f4',
    name: 'Sân cầu lông Nhà thi đấu',
    type: 'Sân cầu lông',
    campus: 'Q9',
    location: 'Nhà thi đấu đa năng',
    capacity: 4,
    description: 'Sân cầu lông trong nhà với sàn gỗ chuyên dụng, có 2 sân.',
    amenities: ['Sàn gỗ', 'Lưới', 'Đèn chiếu sáng', 'Quạt'],
    images: ['/images/badminton-1.jpg'],
    operatingHours: { open: '06:00', close: '22:00' },
    status: 'available'
  },
  {
    id: 'f5',
    name: 'Phòng họp C3.10',
    type: 'Phòng họp',
    campus: 'NVH',
    location: 'Tòa C, Tầng 3',
    capacity: 15,
    description: 'Phòng họp nhỏ gọn, phù hợp cho các cuộc họp nhóm nhỏ.',
    amenities: ['Máy chiếu', 'Bảng trắng', 'WiFi'],
    images: ['/images/meeting-room-2.jpg'],
    operatingHours: { open: '08:00', close: '20:00' },
    status: 'available'
  },
  {
    id: 'f6',
    name: 'Phòng Lab Điện tử D1.02',
    type: 'Phòng Lab',
    campus: 'HCM',
    location: 'Tòa D, Tầng 1',
    capacity: 30,
    description: 'Phòng lab điện tử với các thiết bị đo lường và mạch điện tử.',
    amenities: ['Oscilloscope', 'Multimeter', 'Breadboard', 'Máy tính'],
    images: ['/images/lab-2.jpg'],
    operatingHours: { open: '08:00', close: '20:00' },
    status: 'maintenance'
  }
];

export const timeSlots: TimeSlot[] = [
  // Today's slots for f1
  { id: 'ts1', facilityId: 'f1', date: new Date().toISOString().split('T')[0], startTime: '08:00', endTime: '09:00', status: 'booked', bookedBy: 'user1' },
  { id: 'ts2', facilityId: 'f1', date: new Date().toISOString().split('T')[0], startTime: '09:00', endTime: '10:00', status: 'available' },
  { id: 'ts3', facilityId: 'f1', date: new Date().toISOString().split('T')[0], startTime: '10:00', endTime: '11:00', status: 'available' },
  { id: 'ts4', facilityId: 'f1', date: new Date().toISOString().split('T')[0], startTime: '11:00', endTime: '12:00', status: 'booked', bookedBy: 'user2' },
  { id: 'ts5', facilityId: 'f1', date: new Date().toISOString().split('T')[0], startTime: '14:00', endTime: '15:00', status: 'available' },
  { id: 'ts6', facilityId: 'f1', date: new Date().toISOString().split('T')[0], startTime: '15:00', endTime: '16:00', status: 'available' },
  { id: 'ts7', facilityId: 'f1', date: new Date().toISOString().split('T')[0], startTime: '16:00', endTime: '17:00', status: 'pending' },
  { id: 'ts8', facilityId: 'f1', date: new Date().toISOString().split('T')[0], startTime: '17:00', endTime: '18:00', status: 'available' },
  
  // Tomorrow's slots for f1
  { id: 'ts9', facilityId: 'f1', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], startTime: '08:00', endTime: '09:00', status: 'available' },
  { id: 'ts10', facilityId: 'f1', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], startTime: '09:00', endTime: '10:00', status: 'available' },
  { id: 'ts11', facilityId: 'f1', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], startTime: '10:00', endTime: '11:00', status: 'available' },
  { id: 'ts12', facilityId: 'f1', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], startTime: '14:00', endTime: '15:00', status: 'available' },
  { id: 'ts13', facilityId: 'f1', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], startTime: '15:00', endTime: '16:00', status: 'available' },
  
  // f2 slots
  { id: 'ts14', facilityId: 'f2', date: new Date().toISOString().split('T')[0], startTime: '08:00', endTime: '10:00', status: 'booked', bookedBy: 'user3' },
  { id: 'ts15', facilityId: 'f2', date: new Date().toISOString().split('T')[0], startTime: '10:00', endTime: '12:00', status: 'available' },
  { id: 'ts16', facilityId: 'f2', date: new Date().toISOString().split('T')[0], startTime: '14:00', endTime: '16:00', status: 'available' },
  
  // f3 slots
  { id: 'ts17', facilityId: 'f3', date: new Date().toISOString().split('T')[0], startTime: '06:00', endTime: '08:00', status: 'booked', bookedBy: 'user4' },
  { id: 'ts18', facilityId: 'f3', date: new Date().toISOString().split('T')[0], startTime: '18:00', endTime: '20:00', status: 'available' },
  { id: 'ts19', facilityId: 'f3', date: new Date().toISOString().split('T')[0], startTime: '20:00', endTime: '22:00', status: 'available' },
];

export const bookings: Booking[] = [
  {
    id: 'b1',
    facilityId: 'f1',
    userId: 'user1',
    userName: 'Nguyễn Văn A',
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '09:00',
    purpose: 'Họp nhóm dự án',
    numberOfPeople: 8,
    equipmentRequests: ['Máy chiếu', 'Micro'],
    status: 'confirmed',
    qrCode: 'QR123456',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'b2',
    facilityId: 'f1',
    userId: 'user2',
    userName: 'Trần Thị B',
    date: new Date().toISOString().split('T')[0],
    startTime: '11:00',
    endTime: '12:00',
    purpose: 'Thuyết trình',
    numberOfPeople: 15,
    equipmentRequests: ['Máy chiếu'],
    status: 'confirmed',
    qrCode: 'QR123457',
    createdAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 'b3',
    facilityId: 'f1',
    userId: 'user5',
    userName: 'Lê Văn C',
    date: new Date().toISOString().split('T')[0],
    startTime: '16:00',
    endTime: '17:00',
    purpose: 'Họp lớp',
    numberOfPeople: 20,
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

// Helper functions
export const getFacilityById = (id: string): Facility | undefined => {
  return facilities.find(f => f.id === id);
};

export const getTimeSlotsByFacility = (facilityId: string, date?: string): TimeSlot[] => {
  let filtered = timeSlots.filter(ts => ts.facilityId === facilityId);
  if (date) {
    filtered = filtered.filter(ts => ts.date === date);
  }
  return filtered.sort((a, b) => a.startTime.localeCompare(b.startTime));
};

export const getBookingsByFacility = (facilityId: string): Booking[] => {
  return bookings.filter(b => b.facilityId === facilityId);
};

export const getAvailableTimeSlots = (facilityId: string, date: string): TimeSlot[] => {
  return timeSlots.filter(ts => 
    ts.facilityId === facilityId && 
    ts.date === date && 
    ts.status === 'available'
  );
};

