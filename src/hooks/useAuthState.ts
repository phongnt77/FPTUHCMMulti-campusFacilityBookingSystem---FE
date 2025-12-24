import { useState, useEffect } from 'react';
import { getCurrentUser, isAuthenticated, type User } from '../utils/auth';

/**
 * Custom hook để quản lý authentication state mà không cần AuthContext
 * Hook này đọc trực tiếp từ sessionStorage và tự động update khi có thay đổi
 * LƯU Ý: sessionStorage riêng biệt cho mỗi tab, nên mỗi tab có session riêng
 */
export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data khi component mount (để xử lý race condition khi navigate back)
  useEffect(() => {
    // Đợi một chút để đảm bảo sessionStorage đã sẵn sàng (đặc biệt khi navigate back)
    const loadAuthState = () => {
      const currentUser = getCurrentUser();
      const isAuth = isAuthenticated();
      
      setUser(currentUser);
      setAuthenticated(isAuth);
      setIsLoading(false);
    };

    // Load ngay lập tức
    loadAuthState();

    // Nếu đã authenticated nhưng chưa có user, thử load lại sau một chút (xử lý race condition)
    // Điều này xảy ra khi navigate back và sessionStorage chưa kịp ready
    const isAuth = isAuthenticated();
    const currentUser = getCurrentUser();
    
    if (isAuth && !currentUser) {
      const timeout = setTimeout(() => {
        loadAuthState();
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, []);

  // Listen for custom events (khi login/logout ở cùng tab)
  // LƯU Ý: sessionStorage không chia sẻ giữa các tab, nên không cần listen storage event
  // Mỗi tab có session riêng biệt
  useEffect(() => {
    const handleLoginSuccess = () => {
      const newUser = getCurrentUser();
      setUser(newUser);
      setAuthenticated(isAuthenticated());
      setIsLoading(false);
    };

    const handleLogoutSuccess = () => {
      setUser(null);
      setAuthenticated(false);
      setIsLoading(false);
    };
    
    // Listen for custom events (khi login/logout ở cùng tab)
    window.addEventListener('auth:loginSuccess', handleLoginSuccess);
    window.addEventListener('auth:logoutSuccess', handleLogoutSuccess);
    
    return () => {
      window.removeEventListener('auth:loginSuccess', handleLoginSuccess);
      window.removeEventListener('auth:logoutSuccess', handleLogoutSuccess);
    };
  }, []);

  return {
    user,
    isAuthenticated: authenticated,
    isLoading,
  };
};

