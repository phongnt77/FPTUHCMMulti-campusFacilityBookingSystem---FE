import { test as base, Page } from '@playwright/test';

/**
 * Test Accounts - CẬP NHẬT THEO DATABASE THỰC TẾ CỦA BẠN
 * 
 * Yêu cầu:
 * - Student: Cần có phone, email, studentId (mssv) trong profile
 * - Admin: Tài khoản admin có quyền duyệt booking
 * - Lecturer: Tài khoản giảng viên (optional)
 */
export const TEST_ACCOUNTS = {
  student: {
    email: 'studentA',           // Username đăng nhập
    password: 'password123',     // Password
    // Thông tin profile (cần đã được setup trong DB)
    expectedPhone: '0987654321',
    expectedStudentId: 'SE12345'
  },
  admin: {
    email: 'admin',
    password: 'admin123'
  },
  lecturer: {
    email: 'lecturerB',
    password: 'password123'
  }
};

// Biến chia sẻ giữa các test
export const sharedState = {
  bookingId: '',
  facilityId: '',
  bookingDate: ''
};

/**
 * Login helper function
 */
export async function login(page: Page, email: string, password: string): Promise<boolean> {
  try {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Clear any existing session
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    
    // Wait for login form
    await page.waitForSelector('input[type="password"]', { timeout: 5000 });
    
    // Fill email - try multiple selectors
    const emailInput = page.locator('input[type="text"]').first();
    await emailInput.fill(email);
    
    // Fill password
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill(password);
    
    // Click submit
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
    
    // Wait for navigation away from login page
    await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 15000 });
    
    return true;
  } catch (error) {
    console.error('Login failed:', error);
    return false;
  }
}

/**
 * Logout helper function
 */
export async function logout(page: Page): Promise<void> {
  // Clear session
  await page.evaluate(() => {
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');
    localStorage.clear();
  });
  
  // Navigate to login
  await page.goto('/login');
}

/**
 * Get tomorrow's date in YYYY-MM-DD format
 */
export function getTomorrowDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

/**
 * Get date X days from now in YYYY-MM-DD format
 */
export function getDateFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

/**
 * Format date for display
 */
export function formatDateVN(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Wait for toast notification
 */
export async function waitForToast(page: Page, textPattern: RegExp | string): Promise<boolean> {
  try {
    const toast = page.locator('.toast, [role="alert"], .notification');
    await toast.filter({ hasText: textPattern }).waitFor({ timeout: 10000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Take screenshot with timestamp
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({ 
    path: `./test-results/screenshots/${name}-${timestamp}.png`,
    fullPage: true 
  });
}
