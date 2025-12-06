import { type AuthUser } from '../layout/Login/api/loginAPI';
import { type User } from '../data/userMockData';

// Map roleId từ API sang role name
const mapRoleIdToRole = (roleId: string): User['role'] => {
  const roleMap: Record<string, User['role']> = {
    'RL0001': 'Student',
    'RL0002': 'Lecturer',
    'RL0003': 'Facility_Manager',
  };
  return roleMap[roleId] || 'Student';
};

/**
 * Lấy thông tin user từ localStorage
 * @returns User object hoặc null nếu chưa đăng nhập
 */
export const getCurrentUser = (): User | null => {
  try {
    const token = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    
    if (!token || !savedUser) {
      console.log('getCurrentUser: No token or savedUser found');
      return null;
    }

    const authUser: AuthUser = JSON.parse(savedUser);
    console.log('getCurrentUser: AuthUser from localStorage:', authUser);
    
    // Convert AuthUser từ API sang User interface
    const user: User = {
      user_id: authUser.userId,
      email: authUser.email,
      full_name: authUser.fullName,
      user_name: authUser.email.split('@')[0],
      role: mapRoleIdToRole(authUser.roleId),
      campus_id: 1,
      status: 'Active',
      avatar_url: undefined,
      created_at: new Date().toISOString(),
    };

    console.log('getCurrentUser: Mapped user role:', user.role, 'from roleId:', authUser.roleId);
    return user;
  } catch (error) {
    console.error('Error parsing auth user:', error);
    // Clear invalid data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    return null;
  }
};

/**
 * Kiểm tra user đã đăng nhập chưa
 * @returns true nếu đã đăng nhập, false nếu chưa
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('auth_token');
  const authUser = localStorage.getItem('auth_user');
  return !!(token && authUser);
};

/**
 * Lấy token từ localStorage
 * @returns JWT token hoặc null
 */
export const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

/**
 * Lấy AuthUser từ localStorage
 * @returns AuthUser object hoặc null
 */
export const getAuthUser = (): AuthUser | null => {
  try {
    const savedUser = localStorage.getItem('auth_user');
    if (!savedUser) return null;
    return JSON.parse(savedUser) as AuthUser;
  } catch {
    return null;
  }
};

/**
 * Kiểm tra user có role được phép không
 * @param allowedRoles - Danh sách roles được phép
 * @returns true nếu user có role trong allowedRoles
 */
export const hasRole = (allowedRoles: User['role'][]): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  return allowedRoles.includes(user.role);
};

/**
 * Xóa thông tin đăng nhập khỏi localStorage
 */
export const clearAuth = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
};

