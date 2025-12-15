import { useState, useEffect } from 'react';
import { type UserProfile, updateProfile } from '../api/profileApi';
import { useToast } from '../../../../components/toast';
import { Loader2 } from 'lucide-react';

interface ProfileFormProps {
  profile: UserProfile | null;
  onUpdateSuccess: (updatedProfile: UserProfile) => void;
}

const ProfileForm = ({ profile, onUpdateSuccess }: ProfileFormProps) => {
  const { showSuccess, showError } = useToast();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    avatarUrl: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        email: profile.email || '',
        phoneNumber: profile.phoneNumber || '',
        avatarUrl: profile.avatarUrl || '',
      });
    }
  }, [profile]);

  const validatePhoneNumber = (phone: string): string | null => {
    if (!phone || phone.trim() === '') {
      return null; // Cho phép để trống
    }
    
    // Chỉ cho phép số
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Kiểm tra format: bắt đầu bằng 0 và có đúng 10 chữ số
    if (digitsOnly.length !== 10) {
      return 'Số điện thoại phải có đúng 10 chữ số';
    }
    
    if (!digitsOnly.startsWith('0')) {
      return 'Số điện thoại phải bắt đầu bằng số 0';
    }
    
    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Chỉ cho phép nhập số cho số điện thoại
    if (name === 'phoneNumber') {
      const phoneValue = value.replace(/\D/g, ''); // Chỉ giữ lại số
      setFormData((prev) => ({
        ...prev,
        [name]: phoneValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate phone number trước khi submit
      if (formData.phoneNumber && formData.phoneNumber.trim() !== '') {
        const phoneError = validatePhoneNumber(formData.phoneNumber);
        if (phoneError) {
          setError(phoneError);
          showError(phoneError);
          setIsLoading(false);
          return;
        }
      }

      const updateData: { phoneNumber?: string; avatarUrl?: string } = {};
      
      if (formData.phoneNumber !== profile?.phoneNumber) {
        updateData.phoneNumber = formData.phoneNumber || undefined;
      }
      
      if (formData.avatarUrl !== profile?.avatarUrl) {
        updateData.avatarUrl = formData.avatarUrl || undefined;
      }

      const response = await updateProfile(updateData);

      if (response.success && response.data) {
        showSuccess('Cập nhật profile thành công!');
        onUpdateSuccess(response.data);
        setIsEditing(false);
      } else {
        const errorMsg = response.error?.message || 'Cập nhật profile thất bại';
        setError(errorMsg);
        showError(errorMsg);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        email: profile.email || '',
        phoneNumber: profile.phoneNumber || '',
        avatarUrl: profile.avatarUrl || '',
      });
    }
    setIsEditing(false);
    setError(null);
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Thông tin cá nhân</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            Chỉnh sửa
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name - Read Only */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Họ và tên
          </label>
          <input
            type="text"
            value={formData.fullName}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-500">Họ và tên không thể thay đổi</p>
        </div>

        {/* Email - Read Only */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-500">Email không thể thay đổi</p>
        </div>

        {/* Phone Number - Editable */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số điện thoại
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            disabled={!isEditing}
            placeholder="Nhập số điện thoại"
            maxLength={10}
            className={`w-full px-3 py-2 border rounded-lg ${
              isEditing
                ? 'border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                : 'border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed'
            }`}
          />
          <p className="mt-1 text-xs text-gray-500">
            Số điện thoại phải bắt đầu bằng 0 và có đúng 10 chữ số
          </p>
        </div>

        {/* Avatar URL - Editable */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL Avatar
          </label>
          <input
            type="url"
            name="avatarUrl"
            value={formData.avatarUrl}
            onChange={handleInputChange}
            disabled={!isEditing}
            placeholder="https://example.com/avatar.jpg"
            className={`w-full px-3 py-2 border rounded-lg ${
              isEditing
                ? 'border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                : 'border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed'
            }`}
          />
          {formData.avatarUrl && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Preview:</p>
              <img
                src={formData.avatarUrl}
                alt="Avatar preview"
                className="w-16 h-16 rounded-full border-2 border-gray-200 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                'Lưu thay đổi'
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Hủy
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfileForm;

