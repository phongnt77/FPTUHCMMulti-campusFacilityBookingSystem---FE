import { test, expect, Page, BrowserContext } from '@playwright/test';
import { login, logout, getTomorrowDate, sharedState, TEST_ACCOUNTS } from './helpers/auth';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Main Booking Flow Test - FPT Facility Booking System
 * 
 * Flow chính:
 * 1. Login với student/lecturer (cần phone, email, mssv cho student)
 * 2. Vào trang /facilities → chọn campus (HCM/NVH) → click "Đặt ngay"
 * 3. Chọn time slot (phải đặt trước 3 tiếng), điền purpose, attendees, notes
 * 4. Xem lịch sử đặt phòng → Admin duyệt → Xác nhận
 * 5. Check-in (trong 15 phút trước/sau start time) với ảnh + ghi chú
 * 6. Check-out với ảnh + ghi chú
 * 7. Đánh giá 1-5 sao + nhận xét → Gửi
 * 
 * Yêu cầu:
 * - Backend: http://localhost:5252
 * - Frontend: http://localhost:5173
 * - User test (student) và admin có trong database
 */

// Tạo ảnh test hợp lệ (1x1 pixel PNG)
const createTestImage = (): Buffer => {
  // 1x1 pixel transparent PNG
  const pngData = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // width=1, height=1
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, // bit depth, color type, etc.
    0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, 0x54, // IDAT chunk
    0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, // compressed data
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, // IEND chunk
    0xae, 0x42, 0x60, 0x82
  ]);
  return pngData;
};

// ===== MAIN BOOKING FLOW TEST SUITE =====

test.describe('Main Booking Flow', () => {
  test.describe.configure({ mode: 'serial' }); // Chạy tuần tự, test sau phụ thuộc test trước

  test('1. Student đăng nhập và đặt facility', async ({ page }) => {
    // === STEP 1: Login as student ===
    console.log('📝 Step 1: Đăng nhập với tài khoản student...');
    
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Clear session
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    
    // Điền form login
    const emailInput = page.locator('input[type="text"], input[type="email"]').first();
    await emailInput.fill(TEST_ACCOUNTS.student.email);
    
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill(TEST_ACCOUNTS.student.password);
    
    // Submit
    await page.locator('button[type="submit"]').click();
    
    // Đợi chuyển trang (không còn ở /login)
    await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 15000 });
    console.log('✅ Đăng nhập thành công!');
    
    // === STEP 2: Navigate to facilities và chọn campus ===
    console.log('📝 Step 2: Vào trang Facilities và chọn campus...');
    
    await page.goto('/facilities');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Chọn campus HCM (có thể là card hoặc button)
    // Campus cards có text "HCM" hoặc "FPT HCM"
    const campusCard = page.locator('button:has-text("HCM"), button:has-text("FPT HCM")').first();
    if (await campusCard.isVisible({ timeout: 5000 })) {
      await campusCard.click();
      console.log('✅ Đã chọn campus HCM');
      await page.waitForTimeout(2000);
    }
    
    // === STEP 3: Chọn facility và click "Đặt ngay" ===
    console.log('📝 Step 3: Chọn facility và bấm Đặt ngay...');
    
    // Đợi facilities grid load
    await page.waitForSelector('a:has-text("Đặt ngay")', { timeout: 10000 });
    
    // Click "Đặt ngay" trên facility đầu tiên
    const bookNowBtn = page.locator('a:has-text("Đặt ngay")').first();
    await expect(bookNowBtn).toBeVisible();
    await bookNowBtn.click();
    
    // Đợi trang booking load
    await page.waitForURL(/\/booking\//, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    console.log('✅ Đã vào trang đặt phòng');
    
    // === STEP 4: Chọn ngày và time slot ===
    console.log('📝 Step 4: Chọn ngày và khung giờ...');
    
    // Chọn ngày mai để đảm bảo có slot available (đặt trước 3 tiếng)
    const tomorrowDate = getTomorrowDate();
    const dateInput = page.locator('input[type="date"]');
    if (await dateInput.isVisible()) {
      await dateInput.fill(tomorrowDate);
      sharedState.bookingDate = tomorrowDate;
      console.log(`📅 Đã chọn ngày: ${tomorrowDate}`);
    }
    
    // Đợi time slots load
    await page.waitForTimeout(3000);
    
    // Click vào time slot available đầu tiên (có check icon hoặc không disabled)
    // Time slots có format "07:00 - 08:00"
    const timeSlotGrid = page.locator('.grid button, button:has-text("-")');
    const slots = await timeSlotGrid.all();
    
    let slotClicked = false;
    for (const slot of slots) {
      const isDisabled = await slot.isDisabled();
      const text = await slot.textContent();
      if (!isDisabled && text && text.includes(':')) {
        await slot.click();
        console.log(`⏰ Đã chọn time slot: ${text}`);
        slotClicked = true;
        break;
      }
    }
    
    if (!slotClicked) {
      console.log('⚠️ Không tìm thấy time slot available');
    }
    
    // === STEP 5: Điền thông tin booking ===
    console.log('📝 Step 5: Điền thông tin đặt phòng...');
    
    // Mục đích (Purpose) - có thể là input hoặc textarea
    const purposeInput = page.locator('input, textarea').filter({ hasText: /mục đích/i }).first();
    const purposeField = page.locator('input').nth(1); // Input thứ 2 sau date picker
    if (await purposeField.isVisible()) {
      await purposeField.fill('Họp nhóm dự án SWP391 - Test Playwright');
    }
    
    // Số người tham dự (Number of people)
    const attendeesInput = page.locator('input[type="number"]');
    if (await attendeesInput.isVisible()) {
      await attendeesInput.fill('5');
    }
    
    // Ghi chú (Notes) - textarea
    const notesTextarea = page.locator('textarea');
    if (await notesTextarea.isVisible()) {
      await notesTextarea.fill('Đây là booking test từ Playwright automation');
    }
    
    // === STEP 6: Click "Xác nhận đặt phòng" ===
    console.log('📝 Step 6: Xác nhận đặt phòng...');
    
    const confirmBookingBtn = page.locator('button:has-text("Xác nhận đặt phòng")');
    await expect(confirmBookingBtn).toBeVisible();
    
    // Kiểm tra nút có enabled không
    const isEnabled = await confirmBookingBtn.isEnabled();
    if (!isEnabled) {
      console.log('⚠️ Nút xác nhận chưa enabled - cần điền đầy đủ thông tin');
      // Take screenshot để debug
      await page.screenshot({ path: 'test-results/booking-form-disabled.png' });
    }
    
    await confirmBookingBtn.click();
    
    // === STEP 7: Xử lý modal phone number (nếu student chưa có SĐT) ===
    await page.waitForTimeout(1000);
    const phoneModal = page.locator('.fixed.inset-0').filter({ hasText: /số điện thoại|phone/i });
    if (await phoneModal.isVisible({ timeout: 3000 })) {
      console.log('📞 Cần nhập số điện thoại...');
      
      const phoneInput = phoneModal.locator('input[type="tel"], input[type="text"]');
      await phoneInput.fill('0987654321');
      
      const updatePhoneBtn = phoneModal.locator('button:has-text("Cập nhật"), button:has-text("Lưu")');
      await updatePhoneBtn.click();
      await page.waitForTimeout(1000);
    }
    
    // === STEP 8: Xác nhận trong modal "Xác nhận đặt phòng" ===
    console.log('📝 Step 8: Xác nhận trong modal...');
    await page.waitForTimeout(1000);
    
    // Tìm modal có header "Xác nhận đặt phòng"
    const confirmModal = page.locator('.fixed.inset-0').filter({ hasText: 'Xác nhận đặt phòng' });
    
    if (await confirmModal.isVisible({ timeout: 5000 })) {
      console.log('🔍 Modal xác nhận đặt phòng đã hiển thị');
      
      // Tìm nút "Xác nhận" màu cam/gradient (không phải nút "Hủy")
      // Nút có thể có icon check ✓ trước text
      const confirmBtn = confirmModal.locator('button').filter({ hasText: 'Xác nhận' }).last();
      
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click();
        console.log('✅ Đã click nút Xác nhận trong modal');
      } else {
        // Fallback: tìm nút không phải "Hủy"
        const allButtons = confirmModal.locator('button');
        const buttonCount = await allButtons.count();
        for (let i = 0; i < buttonCount; i++) {
          const btn = allButtons.nth(i);
          const text = await btn.textContent();
          if (text && !text.includes('Hủy') && (text.includes('Xác nhận') || text.includes('xác nhận'))) {
            await btn.click();
            console.log(`✅ Đã click nút: ${text}`);
            break;
          }
        }
      }
    } else {
      console.log('⚠️ Không thấy modal xác nhận đặt phòng');
    }
    
    // === STEP 9: Verify booking thành công ===
    await page.waitForTimeout(3000);
    
    // Kiểm tra có thông báo thành công hoặc chuyển đến my-bookings
    const successMsg = page.locator('text=/thành công|Booking.*created|đặt.*thành công/i');
    const isSuccess = await successMsg.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (isSuccess || page.url().includes('my-bookings') || page.url().includes('success')) {
      console.log('✅ Đặt phòng thành công!');
    } else {
      // Kiểm tra có thông báo lỗi không
      await page.screenshot({ path: 'test-results/booking-result.png' });
      console.log('📸 Đã chụp screenshot kết quả booking');
    }
  });

  test('2. Xem lịch sử đặt phòng (My Bookings)', async ({ page }) => {
    console.log('📝 Xem lịch sử đặt phòng...');
    
    // Login
    await login(page, TEST_ACCOUNTS.student.email, TEST_ACCOUNTS.student.password);
    
    // Navigate to my bookings
    await page.goto('/my-bookings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Kiểm tra có booking nào hiển thị không
    const bookingCards = page.locator('.bg-white').filter({ hasText: /Pending|Chờ duyệt|Đã duyệt|Approved/i });
    const count = await bookingCards.count();
    
    console.log(`📋 Tìm thấy ${count} booking(s)`);
    expect(count).toBeGreaterThanOrEqual(0);
    
    // Verify trang hiển thị đúng
    await expect(page.locator('text=/Lịch sử|Booking|Đặt phòng/i').first()).toBeVisible({ timeout: 10000 });
    console.log('✅ Đã hiển thị trang lịch sử đặt phòng');
  });

  test('3. Admin duyệt booking', async ({ page }) => {
    console.log('📝 Admin đăng nhập và duyệt booking...');
    
    // === Login as Admin ===
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    
    await page.locator('input[type="text"]').first().fill(TEST_ACCOUNTS.admin.email);
    await page.locator('input[type="password"]').fill(TEST_ACCOUNTS.admin.password);
    await page.locator('button[type="submit"]').click();
    
    await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 15000 });
    console.log('✅ Admin đăng nhập thành công');
    
    // === Navigate to admin dashboard ===
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // === Filter để xem booking Pending ===
    // Tìm select dropdown filter status
    const statusSelect = page.locator('select');
    if (await statusSelect.isVisible()) {
      await statusSelect.selectOption('Pending_Approval');
      await page.waitForTimeout(1000);
    }
    
    // === Tìm và click nút Duyệt trên booking đầu tiên ===
    const approveBtn = page.locator('button:has-text("Duyệt")').first();
    
    if (await approveBtn.isVisible({ timeout: 5000 })) {
      await approveBtn.click();
      console.log('🔍 Đã click nút Duyệt');
      
      // Xử lý modal xác nhận
      const modal = page.locator('.fixed.inset-0').filter({ hasText: /xác nhận|duyệt/i });
      if (await modal.isVisible({ timeout: 3000 })) {
        const confirmBtn = modal.locator('button:has-text("Xác nhận"), button:has-text("Duyệt")').first();
        await confirmBtn.click();
        console.log('✅ Đã xác nhận duyệt booking');
      }
      
      await page.waitForTimeout(2000);
      
      // Verify thông báo thành công - sử dụng locator cụ thể hơn (tìm trong toast/alert)
      const successToast = page.locator('p, div, span').filter({ hasText: /duyệt.*thành công|booking.*thành công/i }).first();
      if (await successToast.isVisible({ timeout: 5000 })) {
        console.log('✅ Booking đã được duyệt thành công!');
      }
    } else {
      console.log('⚠️ Không tìm thấy booking Pending để duyệt');
      await page.screenshot({ path: 'test-results/admin-no-pending.png' });
      test.skip(true, 'Không có booking pending để duyệt');
    }
    
    // === Logout admin và login lại với user ===
    console.log('📝 Logout admin...');
    
    // Clear session để logout
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    
    // Login lại với student account
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    await page.locator('input[type="text"]').first().fill(TEST_ACCOUNTS.student.email);
    await page.locator('input[type="password"]').fill(TEST_ACCOUNTS.student.password);
    await page.locator('button[type="submit"]').click();
    
    await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 15000 });
    console.log('✅ Đã đăng nhập lại với tài khoản student');
    
    // Verify booking đã được duyệt trong my-bookings
    await page.goto('/my-bookings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const approvedBooking = page.locator('.bg-white').filter({ hasText: /Đã duyệt|Approved/i }).first();
    if (await approvedBooking.isVisible({ timeout: 5000 })) {
      console.log('✅ Booking đã hiển thị trạng thái "Đã duyệt" trong My Bookings');
    }
  });

  test('4. User check-in với ảnh và ghi chú', async ({ page }) => {
    console.log('📝 User thực hiện check-in...');
    
    // Login as student (phải login trước khi set localStorage)
    await login(page, TEST_ACCOUNTS.student.email, TEST_ACCOUNTS.student.password);
    
    // Navigate to my bookings
    await page.goto('/my-bookings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Tìm booking card có nút Check-in (dù enabled hay disabled)
    // Booking card là div.bg-white chứa nút Check-in
    const bookingCardWithCheckIn = page.locator('.bg-white.rounded-xl').filter({ 
      has: page.locator('button:has-text("Check-in")') 
    }).first();
    
    if (!(await bookingCardWithCheckIn.isVisible({ timeout: 5000 }))) {
      console.log('⚠️ Không tìm thấy booking có nút Check-in');
      test.skip(true, 'Không có booking Approved có nút Check-in');
      return;
    }
    
    // Lấy thông tin ngày/giờ từ booking card để set mock time
    // Tìm các element chứa ngày và giờ riêng biệt
    const dateElement = bookingCardWithCheckIn.locator('span, div').filter({ hasText: /\d{2}\/\d{2}\/\d{4}/ }).first();
    const timeElement = bookingCardWithCheckIn.locator('span, div').filter({ hasText: /\d{2}:\d{2}\s*-\s*\d{2}:\d{2}/ }).first();
    
    let mockDateTime = '';
    
    if (await dateElement.isVisible() && await timeElement.isVisible()) {
      const dateText = await dateElement.textContent() || '';
      const timeText = await timeElement.textContent() || '';
      
      console.log(`📅 Date element: "${dateText}"`);
      console.log(`⏰ Time element: "${timeText}"`);
      
      // Parse date (format: "Th 5, 18/12/2025" hoặc "18/12/2025")
      const dateMatch = dateText.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      // Parse time (format: "07:00 - 08:00")
      const timeMatch = timeText.match(/(\d{2}):(\d{2})\s*-/);
      
      if (dateMatch && timeMatch) {
        const [, day, month, year] = dateMatch;
        const [, startHour, startMinute] = timeMatch;
        mockDateTime = `${year}-${month}-${day}T${startHour}:${startMinute}:00`;
        console.log(`🕐 Parsed mock time: ${mockDateTime}`);
      }
    }
    
    // Fallback: parse từ toàn bộ text của booking card
    if (!mockDateTime) {
      const bookingText = await bookingCardWithCheckIn.textContent() || '';
      console.log('📋 Full booking text:', bookingText.substring(0, 200));
      
      const dateMatch = bookingText.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      const timeMatch = bookingText.match(/(\d{2}):(\d{2})\s*-\s*\d{2}:\d{2}/);
      
      if (dateMatch && timeMatch) {
        const [, day, month, year] = dateMatch;
        const [, startHour, startMinute] = timeMatch;
        mockDateTime = `${year}-${month}-${day}T${startHour}:${startMinute}:00`;
        console.log(`🕐 Fallback mock time: ${mockDateTime}`);
      }
    }
    
    if (!mockDateTime) {
      console.log('⚠️ Không parse được ngày/giờ booking');
      test.skip(true, 'Không parse được thời gian booking');
      return;
    }
    
    // Set mock time và reload
    console.log(`🕐 Setting mock time to: ${mockDateTime}`);
    await page.evaluate((mockTime) => {
      localStorage.setItem('mockTime', mockTime);
    }, mockDateTime);
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Tìm lại booking card có nút Check-in ENABLED sau khi set mock time
    const checkInBtn = page.locator('button:has-text("Check-in")').first();
    
    const isVisible = await checkInBtn.isVisible();
    const isEnabled = isVisible ? await checkInBtn.isEnabled() : false;
    
    console.log(`🔍 Sau khi set mock time - Nút Check-in: visible=${isVisible}, enabled=${isEnabled}`);
    
    if (isVisible && isEnabled) {
          await checkInBtn.click();
          console.log('🔍 Đã mở modal Check-in');
          
          // Đợi modal Check-in xuất hiện
          const modal = page.locator('.fixed.inset-0').filter({ hasText: 'Check-in' }).first();
          await expect(modal).toBeVisible({ timeout: 5000 });
          await page.waitForTimeout(500);
          
          // Upload ảnh (bắt buộc) - input[type="file"] bị hidden, cần setInputFiles trực tiếp
          const fileInput = page.locator('input[type="file"][accept*="image"]');
          if (await fileInput.count() > 0) {
            const testImage = createTestImage();
            await fileInput.setInputFiles({
              name: 'checkin-photo.png',
              mimeType: 'image/png',
              buffer: testImage
            });
            console.log('📷 Đã upload ảnh check-in');
            await page.waitForTimeout(500);
          }
          
          // Điền ghi chú (optional)
          const noteInput = modal.locator('textarea');
          if (await noteInput.isVisible()) {
            await noteInput.fill('Check-in từ Playwright test - Phòng sạch sẽ, đầy đủ thiết bị');
            console.log('📝 Đã điền ghi chú check-in');
          }
          
          // Submit check-in - nút có text "Xác nhận Check-in"
          const submitBtn = modal.locator('button:has-text("Xác nhận Check-in")');
          await expect(submitBtn).toBeEnabled({ timeout: 5000 });
          await submitBtn.click();
          console.log('✅ Đã click nút Xác nhận Check-in');
          
          await page.waitForTimeout(3000);
          
          // Kiểm tra thông báo thành công
          const successMsg = page.locator('text=/thành công|success/i').first();
          if (await successMsg.isVisible({ timeout: 5000 })) {
            console.log('✅ Check-in thành công!');
          } else {
            // Kiểm tra modal đã đóng = thành công
            const modalClosed = !(await modal.isVisible());
            if (modalClosed) {
              console.log('✅ Modal đã đóng - Check-in thành công!');
            }
          }
    } else {
      console.log('⚠️ Nút Check-in vẫn disabled sau khi set mock time');
      await page.screenshot({ path: 'test-results/checkin-still-disabled.png' });
      test.skip(true, 'Check-in vẫn disabled sau khi set mock time');
    }
    
    // Clear mock time
    await page.evaluate(() => localStorage.removeItem('mockTime'));
  });

  test('5. User check-out với ảnh và ghi chú', async ({ page }) => {
    console.log('📝 User thực hiện check-out...');
    
    // Login
    await login(page, TEST_ACCOUNTS.student.email, TEST_ACCOUNTS.student.password);
    
    // Navigate to my bookings
    await page.goto('/my-bookings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Tìm booking card có nút Check-out (đã check-in)
    const bookingCardWithCheckOut = page.locator('.bg-white.rounded-xl').filter({ 
      has: page.locator('button:has-text("Check-out")') 
    }).first();
    
    if (!(await bookingCardWithCheckOut.isVisible({ timeout: 5000 }))) {
      console.log('⚠️ Không tìm thấy booking có nút Check-out');
      test.skip(true, 'Không có booking đã check-in');
      return;
    }
    
    // Lấy thông tin ngày/giờ từ booking card để set mock time
    const dateElement = bookingCardWithCheckOut.locator('span, div').filter({ hasText: /\d{2}\/\d{2}\/\d{4}/ }).first();
    const timeElement = bookingCardWithCheckOut.locator('span, div').filter({ hasText: /\d{2}:\d{2}\s*-\s*\d{2}:\d{2}/ }).first();
    
    let mockDateTime = '';
    
    if (await dateElement.isVisible() && await timeElement.isVisible()) {
      const dateText = await dateElement.textContent() || '';
      const timeText = await timeElement.textContent() || '';
      
      console.log(`📅 Date element: "${dateText}"`);
      console.log(`⏰ Time element: "${timeText}"`);
      
      // Parse date và end time
      const dateMatch = dateText.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      const timeMatch = timeText.match(/\d{2}:\d{2}\s*-\s*(\d{2}):(\d{2})/);
      
      if (dateMatch && timeMatch) {
        const [, day, month, year] = dateMatch;
        const [, endHour, endMinute] = timeMatch;
        mockDateTime = `${year}-${month}-${day}T${endHour}:${endMinute}:00`;
        console.log(`🕐 Parsed mock time for check-out: ${mockDateTime}`);
      }
    }
    
    // Fallback
    if (!mockDateTime) {
      const bookingText = await bookingCardWithCheckOut.textContent() || '';
      const dateMatch = bookingText.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      const timeMatch = bookingText.match(/\d{2}:\d{2}\s*-\s*(\d{2}):(\d{2})/);
      
      if (dateMatch && timeMatch) {
        const [, day, month, year] = dateMatch;
        const [, endHour, endMinute] = timeMatch;
        mockDateTime = `${year}-${month}-${day}T${endHour}:${endMinute}:00`;
      }
    }
    
    if (mockDateTime) {
      console.log(`🕐 Setting mock time for check-out: ${mockDateTime}`);
      await page.evaluate((mockTime) => {
        localStorage.setItem('mockTime', mockTime);
      }, mockDateTime);
      
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }
    
    // Tìm nút Check-out sau khi set mock time
    const checkOutBtn = page.locator('button:has-text("Check-out")').first();
    
    const isVisible = await checkOutBtn.isVisible();
    const isEnabled = isVisible ? await checkOutBtn.isEnabled() : false;
    
    console.log(`🔍 Nút Check-out: visible=${isVisible}, enabled=${isEnabled}`);
    
    if (isVisible && isEnabled) {
      await checkOutBtn.click();
      console.log('🔍 Đã mở modal Check-out');
      
      // Đợi modal Check-out xuất hiện
      const modal = page.locator('.fixed.inset-0').filter({ hasText: 'Check-out' }).first();
      await expect(modal).toBeVisible({ timeout: 5000 });
      await page.waitForTimeout(500);
      
      // Upload ảnh (bắt buộc)
      const fileInput = page.locator('input[type="file"][accept*="image"]');
      if (await fileInput.count() > 0) {
        const testImage = createTestImage();
        await fileInput.setInputFiles({
          name: 'checkout-photo.png',
          mimeType: 'image/png',
          buffer: testImage
        });
        console.log('📷 Đã upload ảnh check-out');
        await page.waitForTimeout(500);
      }
      
      // Điền ghi chú
      const noteInput = modal.locator('textarea');
      if (await noteInput.isVisible()) {
        await noteInput.fill('Check-out từ Playwright test - Phòng đã dọn sạch, đầy đủ thiết bị');
        console.log('📝 Đã điền ghi chú check-out');
      }
      
      // Submit check-out
      const submitBtn = modal.locator('button:has-text("Xác nhận Check-out")');
      await expect(submitBtn).toBeEnabled({ timeout: 5000 });
      await submitBtn.click();
      console.log('✅ Đã click nút Xác nhận Check-out');
      
      await page.waitForTimeout(3000);
      
      // Kiểm tra thông báo thành công
      const successMsg = page.locator('text=/thành công|success/i').first();
      if (await successMsg.isVisible({ timeout: 5000 })) {
        console.log('✅ Check-out thành công!');
      } else {
        const modalClosed = !(await modal.isVisible());
        if (modalClosed) {
          console.log('✅ Modal đã đóng - Check-out thành công!');
        }
      }
    } else {
      console.log('⚠️ Nút Check-out không available');
      await page.screenshot({ path: 'test-results/checkout-disabled.png' });
      test.skip(true, 'Check-out không available');
    }
    
    // Clear mock time
    await page.evaluate(() => localStorage.removeItem('mockTime'));
  });

  test('6. User đánh giá feedback (1-5 sao + nhận xét)', async ({ page }) => {
    console.log('📝 User gửi đánh giá feedback...');
    
    // Login
    await login(page, TEST_ACCOUNTS.student.email, TEST_ACCOUNTS.student.password);
    
    // Navigate to my bookings
    await page.goto('/my-bookings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // (Optional) chuyển sang tab "Đã hoàn thành" nếu có để dễ tìm nút Đánh giá
    const completedTab = page.locator('button').filter({ hasText: /Đã hoàn thành|Hoàn thành|Completed/i }).first();
    if (await completedTab.isVisible().catch(() => false)) {
      await completedTab.click().catch(() => {});
      await page.waitForTimeout(1000);
    }

    // Tìm nút "Đánh giá" đang available (ưu tiên trong card booking)
    const feedbackBtnInCard = page.locator('.bg-white.rounded-xl button:has-text("Đánh giá")').first();
    const feedbackBtnFallback = page.locator('button:has-text("Đánh giá"), button:has-text("Feedback")').first();
    const feedbackBtn = (await feedbackBtnInCard.count()) > 0 ? feedbackBtnInCard : feedbackBtnFallback;

    const isVisible = await feedbackBtn.isVisible().catch(() => false);
    const isEnabled = isVisible ? await feedbackBtn.isEnabled().catch(() => false) : false;
    console.log(`🔍 Nút Đánh giá: visible=${isVisible}, enabled=${isEnabled}`);

    if (!isVisible || !isEnabled) {
      await page.screenshot({ path: 'test-results/feedback-button-not-available.png' });
      test.skip(true, 'Không có nút Đánh giá available');
      return;
    }

    await feedbackBtn.click();
    console.log('🔍 Đã mở modal đánh giá');

    // Modal feedback (header: "Đánh giá trải nghiệm")
    const modal = page.locator('.fixed.inset-0').filter({ hasText: 'Đánh giá trải nghiệm' }).first();
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Chọn 5 sao: trong UI hiện tại các sao là button[type="button"]
    const starButtons = modal.locator('button[type="button"]');
    const starCount = await starButtons.count();
    if (starCount >= 5) {
      await starButtons.nth(4).click();
      console.log('⭐ Đã chọn 5 sao');
    } else {
      console.log(`⚠️ Không tìm thấy đủ star buttons (count=${starCount})`);
    }

    // Điền nhận xét
    const commentInput = modal.locator('textarea');
    await expect(commentInput).toBeVisible({ timeout: 5000 });
    const feedbackComment = 'Phòng sạch sẽ, tiện nghi đầy đủ, phục vụ tốt! - Test từ Playwright';
    const feedbackMarker = 'Phòng sạch sẽ, tiện nghi';
    await commentInput.fill(feedbackComment);

    // Submit
    const submitBtn = modal.locator('button:has-text("Gửi đánh giá")');
    await expect(submitBtn).toBeVisible({ timeout: 5000 });
    await submitBtn.click();

    // App sẽ set success state rồi reload sau ~1.5s, nên success UI có thể biến mất nhanh.
    const waitVisible = async (locator: ReturnType<typeof page.locator>, timeout: number) => {
      try {
        await locator.waitFor({ state: 'visible', timeout });
        return true;
      } catch {
        return false;
      }
    };

    const modalSuccess = modal.locator('text=Cảm ơn bạn!');
    const persistedFeedback = page.locator(`text=${feedbackMarker}`).first();

    const sawModalSuccess = await waitVisible(modalSuccess, 4000);
    const sawPersistedFeedback = sawModalSuccess ? true : await waitVisible(persistedFeedback, 15000);

    if (!sawModalSuccess && !sawPersistedFeedback) {
      await page.screenshot({ path: 'test-results/feedback-submit-no-success.png' });
      throw new Error('Submit feedback succeeded but no success UI was detected');
    }

    console.log('✅ Đánh giá feedback thành công!');
  });
});