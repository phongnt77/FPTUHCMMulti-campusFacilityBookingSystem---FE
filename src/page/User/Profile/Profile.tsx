import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from '../../../hooks/useAuthState';
import { isGoogleLogin } from '../../../utils/auth';
import { getProfile, type UserProfile } from './api/profileApi';
import ProfileForm from './components/ProfileForm';
import ChangePasswordForm from './components/ChangePasswordForm';
import MyFeedbacksTab from './components/MyFeedbacksTab';
import { Loader2, User, Lock, MessageSquare } from 'lucide-react';

type TabType = 'profile' | 'password' | 'feedbacks';

const Profile = () => {
  const { user, isAuthenticated } = useAuthState();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  // Redirect if not authenticated or if user is Admin/Facility_Manager
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/profile' } });
      return;
    }

    if (user && (user.role === 'Admin' || user.role === 'Facility_Manager')) {
      navigate('/admin/dashboard');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (isAuthenticated && user && user.role !== 'Admin' && user.role !== 'Facility_Manager') {
      // Kiểm tra xem user có đăng nhập bằng Google không
      setIsGoogleUser(isGoogleLogin());
      fetchProfile();
    }
  }, [isAuthenticated, user]);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getProfile();

      if (response.success && response.data) {
        setProfile(response.data);
      } else {
        setError(response.error?.message || 'Không thể tải thông tin profile');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    // Update auth user in sessionStorage if needed
    const authUser = JSON.parse(sessionStorage.getItem('auth_user') || '{}');
    if (authUser) {
      authUser.fullName = updatedProfile.fullName;
      authUser.phoneNumber = updatedProfile.phoneNumber;
      authUser.avatarUrl = updatedProfile.avatarUrl;
      sessionStorage.setItem('auth_user', JSON.stringify(authUser));
      window.dispatchEvent(new Event('auth:loginSuccess')); // Trigger update
    }
  };

  // Tabs - ẩn tab "Đổi mật khẩu" nếu user đăng nhập bằng Google
  const allTabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Thông tin', icon: <User className="w-4 h-4" /> },
    { id: 'password', label: 'Đổi mật khẩu', icon: <Lock className="w-4 h-4" /> },
    { id: 'feedbacks', label: 'Feedbacks', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  // Lọc tabs: bỏ tab "Đổi mật khẩu" nếu là Google login
  const tabs = allTabs.filter(tab => {
    if (tab.id === 'password' && isGoogleUser) {
      return false; // Ẩn tab đổi mật khẩu cho Google login
    }
    return true;
  });

  // Nếu đang ở tab password nhưng user là Google login, chuyển về tab profile
  useEffect(() => {
    if (activeTab === 'password' && isGoogleUser) {
      setActiveTab('profile');
    }
  }, [isGoogleUser, activeTab]);

  if (!isAuthenticated || (user && (user.role === 'Admin' || user.role === 'Facility_Manager'))) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Hồ sơ của tôi</h1>
          <p className="text-sm text-gray-600 mt-1">Quản lý thông tin cá nhân và hoạt động của bạn</p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Content */}
        {!isLoading && (
          <div className="space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="flex flex-wrap border-b border-gray-200">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === 'profile' && (
                <ProfileForm profile={profile} onUpdateSuccess={handleProfileUpdate} />
              )}

              {activeTab === 'password' && <ChangePasswordForm />}

              {activeTab === 'feedbacks' && <MyFeedbacksTab />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

