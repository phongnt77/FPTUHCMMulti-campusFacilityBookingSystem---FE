import { useState, useEffect } from 'react';
import { getCurrentUser, isAuthenticated, type User } from '../utils/auth';

/**
 * Custom hook để quản lý authentication state mà không cần AuthContext
 * Hook này đọc trực tiếp từ localStorage và tự động update khi có thay đổi
 */
export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(getCurrentUser);
  const [authenticated, setAuthenticated] = useState(isAuthenticated);

  // Listen for storage changes và custom events
  useEffect(() => {
    const handleStorageChange = () => {
      const newUser = getCurrentUser();
      setUser(newUser);
      setAuthenticated(isAuthenticated());
    };

    const handleLoginSuccess = () => {
      const newUser = getCurrentUser();
      setUser(newUser);
      setAuthenticated(isAuthenticated());
    };

    const handleLogoutSuccess = () => {
      setUser(null);
      setAuthenticated(false);
    };

    // Listen for storage events (khi login ở tab khác)
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom events (khi login/logout ở cùng tab)
    window.addEventListener('auth:loginSuccess', handleLoginSuccess);
    window.addEventListener('auth:logoutSuccess', handleLogoutSuccess);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:loginSuccess', handleLoginSuccess);
      window.removeEventListener('auth:logoutSuccess', handleLogoutSuccess);
    };
  }, []);

  return {
    user,
    isAuthenticated: authenticated,
    isLoading: false, // Không cần loading vì đọc từ localStorage là sync
  };
};

