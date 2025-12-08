import { createContext, useContext, useState, type ReactNode } from 'react';
import { mockUsers, type User } from '../data/userMockData';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Helper function to get initial user from localStorage
const getInitialUser = (): User | null => {
  try {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser) as User;
      // Verify user still exists in mock data
      const validUser = mockUsers.find(u => u.user_id === parsedUser.user_id && u.status === 'Active');
      if (validUser) {
        return validUser;
      } else {
        localStorage.removeItem('auth_user');
      }
    }
  } catch {
    localStorage.removeItem('auth_user');
  }
  return null;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(getInitialUser);
  const [isLoading] = useState(false);

  // Login with username/password (for K19+ students)
  const login = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const foundUser = mockUsers.find(
      u => u.user_name.toLowerCase() === username.toLowerCase()
    );

    if (!foundUser) {
      return { success: false, message: 'Tài khoản không tồn tại' };
    }

    if (foundUser.status === 'Inactive') {
      return { success: false, message: 'Tài khoản đã bị vô hiệu hóa' };
    }

    if (password.length < 1) {
      return { success: false, message: 'Vui lòng nhập mật khẩu' };
    }

    setUser(foundUser);
    localStorage.setItem('auth_user', JSON.stringify(foundUser));

    return { success: true, message: 'Đăng nhập thành công!' };
  };

  // Login with Google/FPT email (for K18 students & lecturers)
  const loginWithGoogle = async (email: string): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    if (!email.endsWith('@fpt.edu.vn')) {
      return { success: false, message: 'Chỉ chấp nhận email @fpt.edu.vn' };
    }

    const foundUser = mockUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!foundUser) {
      return { success: false, message: 'Email không tồn tại trong hệ thống' };
    }

    if (foundUser.status === 'Inactive') {
      return { success: false, message: 'Tài khoản đã bị vô hiệu hóa' };
    }

    setUser(foundUser);
    localStorage.setItem('auth_user', JSON.stringify(foundUser));

    return { success: true, message: 'Đăng nhập thành công!' };
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
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
