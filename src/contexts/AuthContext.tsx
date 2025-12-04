import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { mockUsers, type User } from '../data/userMockData';

interface AuthContextType {
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

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for saved session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as User;
        // Verify user still exists in mock data
        const validUser = mockUsers.find(u => u.user_id === parsedUser.user_id && u.status === 'Active');
        if (validUser) {
          setUser(validUser);
        } else {
          localStorage.removeItem('auth_user');
        }
      } catch {
        localStorage.removeItem('auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  // Login with username/password (for K19+ students)
  const login = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Find user by username (user_name field)
    const foundUser = mockUsers.find(
      u => u.user_name.toLowerCase() === username.toLowerCase()
    );

    if (!foundUser) {
      return { success: false, message: 'Tài khoản không tồn tại' };
    }

    if (foundUser.status === 'Inactive') {
      return { success: false, message: 'Tài khoản đã bị vô hiệu hóa' };
    }

    // For mock purposes, accept any password (in real app, verify against backend)
    // Password validation would be: password === 'password123' or check hash
    if (password.length < 1) {
      return { success: false, message: 'Vui lòng nhập mật khẩu' };
    }

    // Save to state and localStorage
    setUser(foundUser);
    localStorage.setItem('auth_user', JSON.stringify(foundUser));

    return { success: true, message: 'Đăng nhập thành công!' };
  };

  // Login with Google/FPT email (for K18 students & lecturers)
  const loginWithGoogle = async (email: string): Promise<{ success: boolean; message: string }> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if email ends with @fpt.edu.vn
    if (!email.endsWith('@fpt.edu.vn')) {
      return { success: false, message: 'Chỉ chấp nhận email @fpt.edu.vn' };
    }

    // Find user by email
    const foundUser = mockUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!foundUser) {
      return { success: false, message: 'Email không tồn tại trong hệ thống' };
    }

    if (foundUser.status === 'Inactive') {
      return { success: false, message: 'Tài khoản đã bị vô hiệu hóa' };
    }

    // Save to state and localStorage
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

