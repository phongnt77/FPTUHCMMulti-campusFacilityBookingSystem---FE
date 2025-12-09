import { createContext, useContext, useState, type ReactNode } from 'react';
import { API_BASE_URL, API_ENDPOINTS, apiFetch } from '../services/api.config';

export interface User {
  user_id: string;
  user_name: string;
  full_name: string;
  email: string;
  role: 'Student' | 'Lecturer' | 'Admin' | 'Facility_Admin' | 'Facility_Manager';
  role_id: string;
  status: 'Active' | 'Inactive';
  avatar_url?: string;
  phone_number?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

// Backend auth response type - matches actual API response
interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  fullName: string;
  roleId: string;
  isVerified: boolean;
  userName?: string;
  avatarUrl?: string;
  phoneNumber?: string;
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

// Map role ID to role name
const mapRoleIdToRole = (roleId: string): User['role'] => {
  const roleMap: Record<string, User['role']> = {
    'RL0001': 'Student',
    'RL0002': 'Lecturer',
    'RL0003': 'Admin',
    'RL0004': 'Facility_Admin',
    'RL0005': 'Facility_Manager',
  };
  return roleMap[roleId] || 'Student';
};

// Map backend response to frontend User type
const mapBackendUser = (data: AuthResponse): User => ({
  user_id: data.userId,
  user_name: data.userName || data.email.split('@')[0],
  full_name: data.fullName,
  email: data.email,
  role: mapRoleIdToRole(data.roleId),
  role_id: data.roleId,
  status: 'Active',
  avatar_url: data.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.fullName)}&background=random`,
  phone_number: data.phoneNumber,
});

// Helper function to get initial user from localStorage
const getInitialUser = (): User | null => {
  try {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      return JSON.parse(savedUser) as User;
    }
  } catch {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('authToken');
  }
  return null;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(getInitialUser);
  const [isLoading, setIsLoading] = useState(false);

  // Login with username/password - API ONLY
  const login = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    
    try {
      const url = `${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`;
      console.log('Logging in to:', url);
      
      const response = await apiFetch<AuthResponse>(url, {
        method: 'POST',
        body: JSON.stringify({ 
          emailOrUsername: username, 
          password: password 
        }),
      });
      
      console.log('Login response:', response);
      
      if (response.success && response.data) {
        // response.data contains the auth data directly (token, userId, email, etc.)
        const mappedUser = mapBackendUser(response.data);
        setUser(mappedUser);
        localStorage.setItem('auth_user', JSON.stringify(mappedUser));
        localStorage.setItem('authToken', response.data.token);
        return { success: true, message: 'Đăng nhập thành công!' };
      }
      
      // Return error from API
      const errorMessage = response.error?.message || 'Đăng nhập thất bại';
      return { success: false, message: errorMessage };
      
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: 'Không thể kết nối đến server. Vui lòng kiểm tra Backend đang chạy.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Login with Google/FPT email - API ONLY
  const loginWithGoogle = async (email: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    
    try {
      if (!email.endsWith('@fpt.edu.vn') && !email.endsWith('@fe.edu.vn')) {
        return { success: false, message: 'Chỉ chấp nhận email @fpt.edu.vn hoặc @fe.edu.vn' };
      }

      const url = `${API_BASE_URL}${API_ENDPOINTS.AUTH.GOOGLE_LOGIN}`;
      const response = await apiFetch<AuthResponse>(url, {
        method: 'POST',
        body: JSON.stringify({ idToken: email }),
      });
      
      if (response.success && response.data) {
        const mappedUser = mapBackendUser(response.data);
        setUser(mappedUser);
        localStorage.setItem('auth_user', JSON.stringify(mappedUser));
        localStorage.setItem('authToken', response.data.token);
        return { success: true, message: 'Đăng nhập thành công!' };
      }
      
      const errorMessage = response.error?.message || 'Đăng nhập Google thất bại';
      return { success: false, message: errorMessage };
      
    } catch (error) {
      console.error('Google login error:', error);
      return { 
        success: false, 
        message: 'Không thể kết nối đến server. Vui lòng kiểm tra Backend đang chạy.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const url = `${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGOUT}`;
        await apiFetch(url, { method: 'POST' });
      }
    } catch (error) {
      console.warn('Backend logout failed:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('auth_user');
      localStorage.removeItem('authToken');
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
