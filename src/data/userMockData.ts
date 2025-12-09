// Mock user data based on database schema
// Excludes: password, is_verify, updated_at (as per requirements)

export interface User {
  user_id: string; // VARCHAR(6) PRIMARY KEY
  email: string; // VARCHAR(100) NOT NULL UNIQUE
  full_name: string; // VARCHAR(100) NOT NULL
  phone_number?: string; // VARCHAR(20) Optional
  user_name: string; // VARCHAR(100) NOT NULL UNIQUE
  role: 'Student' | 'Lecturer' | 'Admin' | 'Facility_Admin' | 'Facility_Manager'; // ENUM NOT NULL
  campus_id: number; // INT NOT NULL FK
  status: 'Active' | 'Inactive'; // ENUM NOT NULL Default='Active'
  avatar_url?: string; // VARCHAR(255) Optional
  last_login?: string; // TIMESTAMP NULL
  created_at: string; // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
}

export const mockUsers: User[] = [
  {
    user_id: 'U00001',
    email: 'student@fpt.edu.vn',
    full_name: 'Nguyễn Văn A',
    phone_number: '0912345678',
    user_name: 'student1',
    role: 'Student',
    campus_id: 1, // HCM
    status: 'Active',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student1',
    last_login: '2025-01-15 09:30:00',
    created_at: '2024-09-01 08:00:00'
  },
  {
    user_id: 'U00004',
    email: 'student2@fpt.edu.vn',
    full_name: 'Lê Văn C',
    phone_number: '0923456789',
    user_name: 'student2',
    role: 'Student',
    campus_id: 1,
    status: 'Active',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student2',
    last_login: '2025-01-14 14:20:00',
    created_at: '2024-09-01 08:00:00'
  },
  {
    user_id: 'U0003',
    email: 'student3@fpt.edu.vn',
    full_name: 'Lê Văn Cường',
    user_name: 'student3',
    role: 'Student',
    campus_id: 2, // NVH
    status: 'Active',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student3',
    last_login: '2025-01-13 16:45:00',
    created_at: '2024-09-01 08:00:00'
  },
  {
    user_id: 'U00002',
    email: 'lecturer@fe.edu.vn',
    full_name: 'Trần Thị B',
    phone_number: '0934567890',
    user_name: 'lecturer1',
    role: 'Lecturer',
    campus_id: 1,
    status: 'Active',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lecturer1',
    last_login: '2025-01-15 10:15:00',
    created_at: '2024-08-15 10:00:00'
  },
  {
    user_id: 'U00005',
    email: 'lecturer2@fe.edu.vn',
    full_name: 'Phạm Thị D',
    phone_number: '0945678901',
    user_name: 'lecturer2',
    role: 'Lecturer',
    campus_id: 2,
    status: 'Active',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lecturer2',
    last_login: '2025-01-14 11:30:00',
    created_at: '2024-08-15 10:00:00'
  },
  {
    user_id: 'U00003',
    email: 'admin@fpt.edu.vn',
    full_name: 'Admin System',
    phone_number: '0956789012',
    user_name: 'admin',
    role: 'Facility_Admin',
    campus_id: 1,
    status: 'Active',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    last_login: '2025-01-15 08:00:00',
    created_at: '2024-07-01 08:00:00'
  },
  {
    user_id: 'U0007',
    email: 'facility1@fpt.edu.vn',
    full_name: 'Đỗ Văn Giang',
    phone_number: '0967890123',
    user_name: 'FAC001',
    role: 'Facility_Manager',
    campus_id: 1,
    status: 'Active',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=FAC001',
    last_login: '2025-01-15 07:45:00',
    created_at: '2024-07-01 08:00:00'
  },
  {
    user_id: 'U0008',
    email: 'student4@fpt.edu.vn',
    full_name: 'Bùi Thị Hoa',
    user_name: 'SE1004',
    role: 'Student',
    campus_id: 1,
    status: 'Inactive',
    created_at: '2024-09-01 08:00:00'
  },
  {
    user_id: 'U0009',
    email: 'student5@fpt.edu.vn',
    full_name: 'Ngô Văn Ích',
    phone_number: '0978901234',
    user_name: 'SE1005',
    role: 'Student',
    campus_id: 2,
    status: 'Active',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SE1005',
    created_at: '2024-09-01 08:00:00'
  },
  {
    user_id: 'U0010',
    email: 'lecturer3@fpt.edu.vn',
    full_name: 'Lý Thị Kim',
    phone_number: '0989012345',
    user_name: 'LEC003',
    role: 'Lecturer',
    campus_id: 1,
    status: 'Active',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LEC003',
    last_login: '2025-01-12 15:20:00',
    created_at: '2024-08-15 10:00:00'
  }
]

export const getCampusName = (campusId: number): string => {
  return campusId === 1 ? 'HCM Campus' : 'NVH Campus'
}

export const getUsersByRole = (role: User['role']): User[] => {
  return mockUsers.filter(user => user.role === role)
}

export const getUsersByCampus = (campusId: number): User[] => {
  return mockUsers.filter(user => user.campus_id === campusId)
}

export const getUserById = (userId: string): User | undefined => {
  return mockUsers.find(user => user.user_id === userId)
}

