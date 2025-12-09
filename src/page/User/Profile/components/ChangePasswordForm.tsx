import { useState } from 'react';
import { changePassword, type ChangePasswordRequest } from '../api/profileApi';
import { useToast } from '../../../../components/toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const ChangePasswordForm = () => {
  const { showSuccess, showError } = useToast();
  
  const [formData, setFormData] = useState<ChangePasswordRequest>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // Password validation rules
  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Mật khẩu phải có ít nhất 8 ký tự';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Mật khẩu phải có ít nhất 1 chữ cái viết hoa';
    }
    if (!/[a-z]/.test(password)) {
      return 'Mật khẩu phải có ít nhất 1 chữ cái viết thường';
    }
    if (!/[0-9]/.test(password)) {
      return 'Mật khẩu phải có ít nhất 1 chữ số';
    }
    if (!/[!@#$%^&*()_+\-={};':"\\|,.<>/?]/.test(password)) {
      return 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt';
    }
    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear errors when user types
    setError(null);
    setValidationErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));

    // Validate new password in real-time
    if (name === 'newPassword') {
      const validationError = validatePassword(value);
      if (validationError) {
        setValidationErrors((prev) => ({
          ...prev,
          newPassword: validationError,
        }));
      }
    }

    // Validate confirm password
    if (name === 'confirmPassword') {
      if (value !== formData.newPassword) {
        setValidationErrors((prev) => ({
          ...prev,
          confirmPassword: 'Mật khẩu xác nhận không khớp',
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});

    // Validate all fields
    const errors: typeof validationErrors = {};

    if (!formData.oldPassword) {
      errors.oldPassword = 'Vui lòng nhập mật khẩu cũ';
    }

    if (!formData.newPassword) {
      errors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else {
      const passwordError = validatePassword(formData.newPassword);
      if (passwordError) {
        errors.newPassword = passwordError;
      }
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (formData.confirmPassword !== formData.newPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await changePassword(formData);

      if (response.success) {
        showSuccess('Đổi mật khẩu thành công!');
        setFormData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        const errorMsg = response.error?.message || 'Đổi mật khẩu thất bại';
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

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Đổi mật khẩu</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Old Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mật khẩu cũ <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPasswords.oldPassword ? 'text' : 'password'}
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleInputChange}
              placeholder="Nhập mật khẩu cũ"
              className={`w-full px-3 py-2 pr-10 border rounded-lg ${
                validationErrors.oldPassword
                  ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
              }`}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('oldPassword')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPasswords.oldPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {validationErrors.oldPassword && (
            <p className="mt-1 text-xs text-red-600">{validationErrors.oldPassword}</p>
          )}
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mật khẩu mới <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPasswords.newPassword ? 'text' : 'password'}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder="Nhập mật khẩu mới"
              className={`w-full px-3 py-2 pr-10 border rounded-lg ${
                validationErrors.newPassword
                  ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
              }`}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('newPassword')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPasswords.newPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {validationErrors.newPassword && (
            <p className="mt-1 text-xs text-red-600">{validationErrors.newPassword}</p>
          )}
          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-700 mb-1">Yêu cầu mật khẩu:</p>
            <ul className="text-xs text-gray-600 space-y-0.5">
              <li className={formData.newPassword.length >= 8 ? 'text-green-600' : ''}>
                • Ít nhất 8 ký tự
              </li>
              <li className={/[A-Z]/.test(formData.newPassword) ? 'text-green-600' : ''}>
                • Có chữ cái viết hoa
              </li>
              <li className={/[a-z]/.test(formData.newPassword) ? 'text-green-600' : ''}>
                • Có chữ cái viết thường
              </li>
              <li className={/[0-9]/.test(formData.newPassword) ? 'text-green-600' : ''}>
                • Có chữ số
              </li>
              <li className={/[!@#$%^&*()_+\-={};':"\\|,.<>/?]/.test(formData.newPassword) ? 'text-green-600' : ''}>
                • Có ký tự đặc biệt
              </li>
            </ul>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Xác nhận mật khẩu mới <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Nhập lại mật khẩu mới"
              className={`w-full px-3 py-2 pr-10 border rounded-lg ${
                validationErrors.confirmPassword
                  ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
              }`}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirmPassword')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPasswords.confirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {validationErrors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600">{validationErrors.confirmPassword}</p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang đổi mật khẩu...
              </>
            ) : (
              'Đổi mật khẩu'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordForm;

