import React, { useState, useEffect, type ReactNode } from 'react';
import { type User } from '../data/userMockData';
import { type AuthUser, logoutAPI } from '../layout/Login/api/loginAPI';
import { AuthContext, type AuthContextType } from './AuthContext';
import { clearAuth } from '../utils/auth';

interface AuthProviderProps {
  children: ReactNode;
}

// Map roleId từ API sang role name
const mapRoleIdToRole = (roleId: string): User['role'] => {
  // Mapping từ roleId trong database sang role trong code
  // RL0001: Student, RL0002: Lecturer, RL0003: Facility_Admin -> Facility_Manager
  // Có thể có thêm roleId khác cho Admin (ví dụ: RL0004) nếu cần
  const roleMap: Record<string, User['role']> = {
    'RL0001': 'Student',
    'RL0002': 'Lecturer',
    'RL0003': 'Facility_Manager', // Facility_Admin trong DB được map sang Facility_Manager
    // Có thể thêm roleId khác cho Admin nếu có trong database
    // 'RL0004': 'Admin', // Ví dụ: nếu có roleId riêng cho Admin
  };
  return roleMap[roleId] || 'Student';
};

// Helper function to get initial user from localStorage
const getInitialUser = (): User | null => {
  try {
    const token = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    
    if (!token || !savedUser) {
      return null;
    }

    const authUser: AuthUser = JSON.parse(savedUser);
    
    // Convert AuthUser từ API sang User interface
    const user: User = {
      user_id: authUser.userId,
      email: authUser.email,
      full_name: authUser.fullName,
      user_name: authUser.email.split('@')[0], // Extract username from email
      role: mapRoleIdToRole(authUser.roleId),
      campus_id: 1, // Default, có thể cần lấy từ API sau
      status: 'Active',
      avatar_url: undefined,
      created_at: new Date().toISOString(),
    };

    return user;
  } catch (error) {
    console.error('Error parsing auth user:', error);
    // Clear invalid data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    return null;
  }
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(getInitialUser);
  const [isLoading] = useState(false);

  // Listen for storage changes (when login happens in another tab/window)
  // and custom events (when login happens in same tab)
  useEffect(() => {
    const handleStorageChange = () => {
      const newUser = getInitialUser();
      setUser(newUser);
    };

    const handleLoginSuccess = () => {
      const newUser = getInitialUser();
      setUser(newUser);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth:loginSuccess', handleLoginSuccess);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:loginSuccess', handleLoginSuccess);
    };
  }, []);

  // Login functions are deprecated - use loginAPI directly in LoginPage
  // Keeping for backward compatibility but they won't work
  const login = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    console.warn('login() is deprecated. Use loginAPI from LoginPage instead.');
    return { success: false, message: 'Vui lòng sử dụng API login trực tiếp' };
  };

  const loginWithGoogle = async (email: string): Promise<{ success: boolean; message: string }> => {
    console.warn('loginWithGoogle() is deprecated. Use loginAPI from LoginPage instead.');
    return { success: false, message: 'Vui lòng sử dụng API login trực tiếp' };
  };

  // Logout - gọi API logout và xóa token/user data
  const logout = async () => {
    try {
      // Gọi API logout trước
      await logoutAPI();
    } catch (error) {
      // Nếu API call thất bại, vẫn xóa token ở client side
      console.error('Logout API error:', error);
    } finally {
      // Luôn xóa user state và localStorage để đảm bảo logout hoàn tất
      // Sử dụng clearAuth để revoke Google session nếu cần
      setUser(null);
      clearAuth();
      
      // Dispatch event để các component khác biết đã logout
      window.dispatchEvent(new Event('auth:logoutSuccess'));
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

