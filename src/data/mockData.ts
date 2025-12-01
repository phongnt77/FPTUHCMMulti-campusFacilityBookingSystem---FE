// src/data/mockData.ts

// --- 1. Dữ liệu Người dùng (Dùng cho Login & Phân quyền) ---
export const MOCK_USERS = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    email: "student@fpt.edu.vn",
    role: "student", // hoặc "lecturer"
    avatar: "https://ui-avatars.com/api/?name=Nguyen+Van+A&background=random"
  },
  {
    id: 99,
    name: "Admin Quản Trị",
    email: "admin@fpt.edu.vn",
    role: "admin",
    avatar: "https://ui-avatars.com/api/?name=Admin&background=F27024&color=fff"
  }
];

// --- 2. Dữ liệu Phòng/Sân (Facilities) ---
export const MOCK_FACILITIES = [
  {
    id: 1,
    name: "Phòng Lab IoT 204",
    type: "Lab", // Lab, Meeting, Sport, Hall
    campus: "Campus 2 (Q9)",
    capacity: 30,
    status: "Available", // Available, Maintenance, Busy
    image: "https://images.unsplash.com/photo-1581092921461-eab62e97a782?auto=format&fit=crop&w=500&q=60",
    utilities: ["Máy chiếu", "Điều hòa", "Thiết bị IoT", "Wifi 6"]
  },
  {
    id: 2,
    name: "Sân Bóng Đá Mini (Sân 1)",
    type: "Sport",
    campus: "Campus 2 (Q9)",
    capacity: 14,
    status: "Busy",
    image: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=500&q=60",
    utilities: ["Đèn chiếu sáng", "Khung thành", "Bóng"]
  },
  {
    id: 3,
    name: "Phòng Họp Alpha (NVH)",
    type: "Meeting",
    campus: "Campus 1 (NVH)",
    capacity: 10,
    status: "Available",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=500&q=60",
    utilities: ["TV màn hình lớn", "Bảng trắng", "Hệ thống họp online"]
  },
  {
    id: 4,
    name: "Hội trường B",
    type: "Hall",
    campus: "Campus 1 (NVH)",
    capacity: 200,
    status: "Maintenance", // Đang bảo trì
    image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&w=500&q=60",
    utilities: ["Âm thanh ánh sáng", "Màn hình LED", "Ghế đệm"]
  },
  {
    id: 5,
    name: "Phòng Lab AI/Mac",
    type: "Lab",
    campus: "Campus 2 (Q9)",
    capacity: 40,
    status: "Available",
    image: "https://images.unsplash.com/photo-1598986646512-9330bcc4c0dc?auto=format&fit=crop&w=500&q=60",
    utilities: ["iMac M1", "Máy chiếu", "Điều hòa"]
  }
];

// --- 3. Dữ liệu Đặt phòng (Bookings) ---
export const MOCK_BOOKINGS = [
  {
    id: 101,
    userId: 1, // Link với student
    userName: "Nguyễn Văn A",
    facilityId: 1, // Link với Lab IoT
    facilityName: "Phòng Lab IoT 204",
    date: "2023-11-20",
    slot: "07:00 - 09:00", // Slot 1
    reason: "Họp nhóm đồ án Capstone",
    status: "Approved", // Approved, Pending, Rejected, Cancelled
    createdDate: "2023-11-18"
  },
  {
    id: 102,
    userId: 1,
    userName: "Nguyễn Văn A",
    facilityId: 2, // Sân bóng
    facilityName: "Sân Bóng Đá Mini (Sân 1)",
    date: "2023-11-21",
    slot: "17:00 - 19:00", // Slot 5
    reason: "Đá giao hữu lớp SE1401",
    status: "Rejected",
    rejectReason: "Sân đang bảo dưỡng cỏ vào khung giờ này",
    createdDate: "2023-11-19"
  },
  {
    id: 103,
    userId: 2, // User khác
    userName: "Trần Thị B",
    facilityId: 3,
    facilityName: "Phòng Họp Alpha (NVH)",
    date: "2023-11-22",
    slot: "09:00 - 11:00",
    reason: "Phỏng vấn CLB",
    status: "Pending",
    createdDate: "2023-11-20"
  },
  {
    id: 104,
    userId: 1,
    userName: "Nguyễn Văn A",
    facilityId: 5,
    facilityName: "Phòng Lab AI/Mac",
    date: "2023-11-25",
    slot: "13:00 - 15:00",
    reason: "Code bài tập Assignment",
    status: "Pending",
    createdDate: "2023-11-20"
  }
];

// --- 4. Dữ liệu Thống kê (Dành cho Admin Dashboard) ---
export const MOCK_STATS = {
  totalBookings: 125,
  pendingRequests: 15,
  utilizationRate: 85, // 85%
  campusDistribution: [
    { name: "Campus 1 (NVH)", value: 40 },
    { name: "Campus 2 (Q9)", value: 60 }
  ],
  weeklyBookings: [
    { day: "T2", count: 12 },
    { day: "T3", count: 19 },
    { day: "T4", count: 15 },
    { day: "T5", count: 22 },
    { day: "T6", count: 28 }, // Cao điểm
    { day: "T7", count: 10 },
    { day: "CN", count: 5 },
  ]
};

// --- Helper: Danh sách Slot giờ học FPT ---
export const BOOKING_SLOTS = [
  "Slot 1 (07:00 - 09:15)",
  "Slot 2 (09:30 - 11:45)",
  "Slot 3 (12:30 - 14:45)",
  "Slot 4 (15:00 - 17:15)",
  "Slot 5 (17:30 - 19:45)",
  "Slot 6 (19:45 - 21:00)"
];
