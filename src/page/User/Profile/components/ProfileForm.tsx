import { useState, useEffect, useRef } from 'react';
import { type UserProfile, updateProfileWithAvatar } from '../api/profileApi';
import { useToast } from '../../../../components/toast';
import { Loader2, Upload, X, Camera } from 'lucide-react';

interface ProfileFormProps {
  profile: UserProfile | null;
  onUpdateSuccess: (updatedProfile: UserProfile) => void;
}

const ProfileForm = ({ profile, onUpdateSuccess }: ProfileFormProps) => {
  const { showSuccess, showError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    studentId: '',
    avatarUrl: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Debug: log profile roleName
  console.log('Profile roleName:', profile?.roleName);
  
  // Kiểm tra Student role - hỗ trợ cả tiếng Anh và tiếng Việt
  const isStudent = profile?.roleName?.toLowerCase() === 'student' || 
                    profile?.roleName === 'Student' ||
                    profile?.roleName === 'Sinh viên' ||
                    profile?.roleId === 'RL0001'; // Fallback: check roleId

  useEffect(() => {
    if (profile) {
      console.log('Profile data:', profile);
      setFormData({
        fullName: profile.fullName || '',
        email: profile.email || '',
        phoneNumber: profile.phoneNumber || '',
        studentId: profile.studentId || '',
        avatarUrl: profile.avatarUrl || '',
      });
      setAvatarPreview(profile.avatarUrl || null);
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

  const validateStudentId = (studentId: string): string | null => {
    if (!studentId || studentId.trim() === '') {
      return null; // Cho phép để trống
    }
    
    // Format: SE/SS/IB/MC + 6 số, 2 số đầu >= 14
    const regex = /^(SE|SS|IB|MC)(1[4-9]|[2-9][0-9])[0-9]{4}$/;
    if (!regex.test(studentId.toUpperCase())) {
      return 'MSSV không hợp lệ. Ví dụ đúng: SE173162, SS180123';
    }
    
    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showError('Chỉ chấp nhận file ảnh (jpg, png, gif, webp)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showError('Kích thước file không được vượt quá 10MB');
      return;
    }

    setAvatarFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(profile?.avatarUrl || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

      // Validate studentId nếu là student
      if (isStudent && formData.studentId && formData.studentId.trim() !== '') {
        const studentIdError = validateStudentId(formData.studentId);
        if (studentIdError) {
          setError(studentIdError);
          showError(studentIdError);
          setIsLoading(false);
          return;
        }
      }

      // Normalize values để so sánh
      const normalizeValue = (value: string | null | undefined): string => {
        return (value || '').trim();
      };
      
      const currentPhone = normalizeValue(formData.phoneNumber);
      const originalPhone = normalizeValue(profile?.phoneNumber || null);
      
      const currentStudentId = normalizeValue(formData.studentId);
      const originalStudentId = normalizeValue(profile?.studentId || null);
      
      // Kiểm tra xem có thay đổi nào không
      const phoneChanged = currentPhone !== originalPhone;
      const studentIdChanged = isStudent && currentStudentId !== originalStudentId;
      const hasNewAvatar = avatarFile !== null;
      
      // Nếu không có thay đổi nào
      if (!phoneChanged && !studentIdChanged && !hasNewAvatar) {
        showSuccess('Không có thay đổi nào để lưu');
        setIsEditing(false);
        setIsLoading(false);
        return;
      }
      
      // Sử dụng API upload với form-data
      const response = await updateProfileWithAvatar({
        phoneNumber: currentPhone || undefined,
        studentId: isStudent ? (currentStudentId || undefined) : undefined,
        avatar: avatarFile || undefined,
      });

      if (response.success && response.data) {
        showSuccess('Cập nhật profile thành công!');
        onUpdateSuccess(response.data);
        setIsEditing(false);
        setAvatarFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
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
        studentId: profile.studentId || '',
        avatarUrl: profile.avatarUrl || '',
      });
      setAvatarPreview(profile.avatarUrl || null);
      setAvatarFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

        {/* Student ID - Only for Students */}
        {isStudent && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              MSSV (Mã số sinh viên) <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Ví dụ: SE173162"
              maxLength={8}
              className={`w-full px-3 py-2 border rounded-lg uppercase ${
                isEditing
                  ? 'border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                  : 'border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed'
              }`}
            />
            <p className="mt-1 text-xs text-gray-500">
              Format: SE/SS/IB/MC + 6 số. Ví dụ: SE173162, SS180123
            </p>
            {!formData.studentId && (
              <p className="mt-1 text-xs text-orange-600">
                ⚠️ Bạn cần cập nhật MSSV để có thể đặt phòng
              </p>
            )}
          </div>
        )}

        {/* Avatar Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ảnh đại diện
          </label>
          
          <div className="flex items-start gap-4">
            {/* Avatar Preview */}
            <div className="relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-24 h-24 rounded-full border-2 border-gray-200 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(formData.fullName);
                  }}
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-gray-400" />
                </div>
              )}
              
              {/* Remove button */}
              {isEditing && avatarFile && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Upload Button */}
            {isEditing && (
              <div className="flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Chọn ảnh
                </button>
                <p className="mt-2 text-xs text-gray-500">
                  Định dạng: JPG, PNG, GIF, WebP. Tối đa 10MB.
                </p>
                {avatarFile && (
                  <p className="mt-1 text-xs text-green-600">
                    ✓ Đã chọn: {avatarFile.name}
                  </p>
                )}
              </div>
            )}
          </div>
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

