# Chatlog - Tạo trang Facility cho User

## Ngày: 3/12/2025

## Yêu cầu
Code trang Facility để hiện các Facility khả dụng để đặt (có mục chọn campus, sau khi chọn thì trang chỉ hiện các Facility thuộc campus đó). Trang này dành cho User sử dụng (student/lecturer).

---

## Các file đã tạo/chỉnh sửa

### 1. `src/page/User/Facility/api/api.ts` (Mới tạo)
API service cho trang Facility của User, bao gồm:
- `getAvailableFacilities()`: Lấy danh sách cơ sở vật chất khả dụng (chỉ lấy các facility đang active)
- `getFacilityById()`: Lấy thông tin chi tiết một facility
- `getFacilitiesCountByCampus()`: Đếm số lượng facility theo từng campus

```typescript
export interface FacilityFilters {
  campus?: Campus;
  type?: FacilityType;
  searchQuery?: string;
}

export const userFacilityApi = {
  getAvailableFacilities: async (filters?: FacilityFilters): Promise<Facility[]>,
  getFacilityById: async (id: string): Promise<Facility | null>,
  getFacilitiesCountByCampus: async (): Promise<{ HCM: number; NVH: number }>
}
```

### 2. `src/page/User/Facility/Facility.tsx` (Cập nhật hoàn toàn)
Component trang Facility với giao diện đẹp và đầy đủ tính năng:

#### Các tính năng chính:
1. **Chọn Campus**: 
   - Hiển thị 2 card cho HCM Campus và NVH Campus
   - Mỗi card hiển thị tên campus, mô tả, và số lượng cơ sở khả dụng
   - Gradient màu sắc khác nhau cho mỗi campus (cam cho HCM, tím cho NVH)

2. **Xem danh sách Facility**:
   - Sau khi chọn campus, hiển thị danh sách các facility thuộc campus đó
   - Chỉ hiển thị các facility đang active (khả dụng để đặt)
   - Mỗi facility hiển thị dạng card với đầy đủ thông tin

3. **Bộ lọc**:
   - Tìm kiếm theo tên, vị trí
   - Lọc theo loại cơ sở (Phòng họp, Phòng Lab, Sân thể thao)

4. **Thông tin Facility**:
   - Tên và loại cơ sở
   - Vị trí
   - Sức chứa
   - Mô tả
   - Tiện ích (amenities)
   - Nút "Đặt ngay" để chuyển đến trang booking

5. **UI/UX**:
   - Gradient header theo màu campus đã chọn
   - Loading skeleton khi đang tải dữ liệu
   - Empty state khi không tìm thấy kết quả
   - Responsive design cho mobile và desktop
   - Thống kê số lượng theo loại cơ sở

---

## Cấu trúc thư mục sau khi hoàn thành

```
src/page/User/Facility/
├── api/
│   └── api.ts          # API service (mới tạo)
├── Facility.tsx        # Component chính (cập nhật)
└── index.tsx           # Export file (giữ nguyên)
```

---

## Công nghệ sử dụng
- **React** với TypeScript
- **Tailwind CSS** cho styling
- **Lucide React** cho icons
- **React Router DOM** cho navigation

---

## Luồng hoạt động

```
1. User truy cập /facilities
   ↓
2. Hiển thị trang chọn Campus (HCM / NVH)
   ↓
3. User click chọn một campus
   ↓
4. Gọi API lấy danh sách facility của campus đó
   ↓
5. Hiển thị danh sách facility dạng grid cards
   ↓
6. User có thể:
   - Tìm kiếm theo tên/vị trí
   - Lọc theo loại cơ sở
   - Click "Đặt ngay" để đến trang booking
   - Click "Đổi campus" để quay lại bước 2
```

---

## Màu sắc theo loại cơ sở

| Loại | Background | Text | Accent |
|------|-----------|------|--------|
| Phòng họp | violet-50 | violet-700 | violet-500 |
| Phòng Lab | amber-50 | amber-700 | amber-500 |
| Sân thể thao | emerald-50 | emerald-700 | emerald-500 |

---

## Route đã có sẵn
Trang Facility đã được định nghĩa route trong `src/routes/User Route/index.tsx`:
```tsx
<Route path="/facilities" element={<FacilityPage />} />
```

---

## Ghi chú
- Trang sử dụng mock data từ `adminMockData.ts`
- Khi có API backend thật, chỉ cần cập nhật file `api/api.ts` để gọi API thật

---

# Chatlog - Tạo trang Booking (Phần 2)

## Ngày: 3/12/2025

## Yêu cầu
Khi ấn "Đặt ngay" sẽ hiện thông tin chi tiết của phòng, thời gian khả dụng có thể đặt. Sau khi chọn đủ yêu cầu sẽ hiện modal confirm việc đặt phòng.

---

## Các file đã tạo

### 1. `src/page/User/Booking/api/api.ts` (Mới tạo)
API service cho trang Booking:
- `getFacilityById()`: Lấy thông tin chi tiết facility
- `getAvailableTimeSlots()`: Lấy các khung giờ khả dụng theo ngày
- `submitBooking()`: Gửi yêu cầu đặt phòng

```typescript
export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface BookingRequest {
  facilityId: string;
  date: string;
  timeSlotId: string;
  startTime: string;
  endTime: string;
  purpose: string;
  numberOfPeople: number;
  notes?: string;
}
```

### 2. `src/page/User/Booking/Booking.tsx` (Mới tạo)
Component trang Booking với đầy đủ tính năng:

#### Giao diện bao gồm:
1. **Header** - Hiển thị tên phòng, loại, campus với gradient màu theo loại
2. **Thông tin chi tiết** (cột trái):
   - Vị trí
   - Sức chứa
   - Giờ hoạt động (07:00 - 21:00)
   - Mô tả
   - Tiện ích (amenities)
   - Lưu ý khi đặt phòng
3. **Form đặt phòng** (cột phải):
   - Chọn ngày (với nút prev/next)
   - Chọn khung giờ (grid các slot 1 tiếng)
   - Mục đích sử dụng (bắt buộc)
   - Số người tham gia (bắt buộc, max = capacity)
   - Ghi chú (tùy chọn)
   - Nút xác nhận

#### Modal xác nhận:
- Hiển thị tổng hợp thông tin đặt phòng
- Cảnh báo về quy trình xét duyệt
- Nút Hủy / Xác nhận
- Loading state khi đang gửi
- Success state với mã đặt phòng

### 3. `src/page/User/Booking/index.tsx` (Mới tạo)
Export file cho Booking page

### 4. `src/routes/User Route/index.tsx` (Cập nhật)
Thêm route mới:
```tsx
<Route path="/booking/:facilityId" element={<BookingPage />} />
```

---

## Cấu trúc thư mục sau khi hoàn thành

```
src/page/User/
├── Booking/
│   ├── api/
│   │   └── api.ts          # API service (mới tạo)
│   ├── Booking.tsx         # Component chính (mới tạo)
│   └── index.tsx           # Export file (mới tạo)
├── Facility/
│   ├── api/
│   │   └── api.ts
│   ├── Facility.tsx
│   └── index.tsx
└── Home/
    └── ...
```

---

## Luồng hoạt động

```
1. User ở trang /facilities, click "Đặt ngay" trên một facility
   ↓
2. Chuyển đến /booking/:facilityId
   ↓
3. Hiển thị thông tin chi tiết facility + form đặt phòng
   ↓
4. User chọn ngày → Load các khung giờ khả dụng
   ↓
5. User chọn khung giờ, điền mục đích, số người
   ↓
6. Click "Xác nhận đặt phòng"
   ↓
7. Hiển thị Modal xác nhận với tổng hợp thông tin
   ↓
8. User click "Xác nhận" → Gửi request
   ↓
9. Hiển thị success state với mã đặt phòng
   ↓
10. Click "Quay lại danh sách" → Về /facilities
```

---

## Tính năng Time Slots

- Giờ hoạt động: 07:00 - 21:00 (14 slot mỗi ngày)
- Mỗi slot = 1 tiếng
- Slot đã qua giờ hiện tại → Unavailable
- Random 30% slot đã được đặt (mock)
- Màu sắc:
  - Xám nhạt: Còn trống
  - Xám đậm + gạch ngang: Đã đặt
  - Gradient màu: Đang chọn

---

## Validation

- Ngày: Từ hôm nay đến 14 ngày sau
- Khung giờ: Bắt buộc chọn
- Mục đích: Bắt buộc, không được trống
- Số người: 1 đến capacity của phòng

---

## Truy cập

```
http://localhost:5173/facilities → Chọn campus → Click "Đặt ngay"
hoặc
http://localhost:5173/booking/f1 (trực tiếp với facility ID)
```

---

# Chatlog - Sửa link Header (Phần 3)

## Ngày: 4/12/2025

## Yêu cầu
Ở header có mục Facilities, khi bấm vào đó sẽ chuyển qua trang facilities để đặt phòng.

---

## Các file đã cập nhật

### 1. `src/layout/Header/Header.tsx`
Sửa link từ `/user/facilities` thành `/facilities`:
```tsx
<NavLink to="/facilities" ...>
  Facilities
</NavLink>
```

### 2. `src/page/User/Home/components/HeroSection.tsx`
Sửa link "Browse facilities" từ `/user/facilities` thành `/facilities`:
```tsx
<Link to="/facilities" ...>
  Browse facilities
</Link>
```

---

# Chatlog - Tạo hệ thống Authentication (Phần 4)

## Ngày: 4/12/2025

## Yêu cầu
Sau này phải cần login trước thì mới được vào facilities để đặt phòng.

---

## Các file đã tạo/cập nhật

### 1. `src/contexts/AuthContext.tsx` (Mới tạo)
Context quản lý authentication state:

```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}
```

**Tính năng:**
- Lưu session vào localStorage
- Tự động restore session khi reload
- Login bằng username/password (K19+ students)
- Login bằng FPT email/Google (K18 students & lecturers)
- Kiểm tra user status (Active/Inactive)

### 2. `src/components/ProtectedRoute.tsx` (Mới tạo)
Component bảo vệ route:

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('Student' | 'Lecturer' | 'Admin' | 'Facility_Manager')[];
}
```

**Tính năng:**
- Kiểm tra đăng nhập trước khi render
- Redirect về `/login` nếu chưa đăng nhập
- Lưu URL đang cố truy cập để redirect sau login
- Kiểm tra role-based access
- Loading state trong khi kiểm tra auth

### 3. `src/layout/Login/LoginPage.tsx` (Cập nhật hoàn toàn)
Thêm logic đăng nhập thực sự:

**Tính năng mới:**
- Form validation
- Error/Success messages với icons
- Loading state khi đang xử lý
- Redirect về trang đã cố truy cập sau login
- Demo hints hiển thị test accounts
- Hỗ trợ cả 2 phương thức login

### 4. `src/layout/Header/Header.tsx` (Cập nhật)
Thêm hiển thị user info khi đã đăng nhập:

**Khi chưa đăng nhập:**
- Hiển thị nút "Sign in"

**Khi đã đăng nhập:**
- Avatar user (hoặc icon mặc định)
- Tên user + Role
- Nút "Đăng xuất"

### 5. `src/main.tsx` (Cập nhật)
Wrap app với AuthProvider:
```tsx
<AuthProvider>
  <App />
</AuthProvider>
```

### 6. `src/routes/User Route/index.tsx` (Cập nhật)
Thêm ProtectedRoute cho các trang cần bảo vệ:

```tsx
<Route 
  path="/facilities" 
  element={
    <ProtectedRoute allowedRoles={['Student', 'Lecturer']}>
      <FacilityPage />
    </ProtectedRoute>
  } 
/>
<Route 
  path="/booking/:facilityId" 
  element={
    <ProtectedRoute allowedRoles={['Student', 'Lecturer']}>
      <BookingPage />
    </ProtectedRoute>
  } 
/>
```

---

## Cấu trúc thư mục sau khi hoàn thành

```
src/
├── components/
│   └── ProtectedRoute.tsx      # Route guard (mới)
├── contexts/
│   └── AuthContext.tsx         # Auth state management (mới)
├── layout/
│   ├── Header/
│   │   └── Header.tsx          # Cập nhật với user info
│   └── Login/
│       └── LoginPage.tsx       # Cập nhật với login logic
├── page/User/
│   ├── Booking/
│   │   ├── api/api.ts
│   │   ├── Booking.tsx
│   │   └── index.tsx
│   ├── Facility/
│   │   ├── api/api.ts
│   │   ├── Facility.tsx
│   │   └── index.tsx
│   └── Home/
│       └── ...
├── routes/
│   └── User Route/
│       └── index.tsx           # Cập nhật với ProtectedRoute
└── main.tsx                    # Cập nhật với AuthProvider
```

---

## Luồng Authentication

```
User truy cập /facilities
       ↓
ProtectedRoute kiểm tra isAuthenticated
       ↓
Chưa đăng nhập?
       ↓
Redirect về /login (lưu from: /facilities)
       ↓
User nhập username + password
       ↓
AuthContext.login() kiểm tra mockUsers
       ↓
Tìm thấy user + status Active?
       ↓
Lưu user vào state + localStorage
       ↓
Redirect về /facilities (from state)
       ↓
User có thể sử dụng hệ thống
```

---

## Test Accounts (Demo Mode)

| Loại | Username | Email | Campus |
|------|----------|-------|--------|
| Student | SE1001 | student1@fpt.edu.vn | HCM |
| Student | SE1002 | student2@fpt.edu.vn | HCM |
| Student | SE1003 | student3@fpt.edu.vn | NVH |
| Lecturer | LEC001 | lecturer1@fpt.edu.vn | HCM |
| Lecturer | LEC002 | lecturer2@fpt.edu.vn | NVH |
| Lecturer | LEC003 | lecturer3@fpt.edu.vn | HCM |
| Admin | ADM001 | admin1@fpt.edu.vn | HCM |

**Password:** Bất kỳ (demo mode - chấp nhận mọi password)

---

## Các trang được bảo vệ

| Route | Allowed Roles |
|-------|---------------|
| `/facilities` | Student, Lecturer |
| `/booking/:facilityId` | Student, Lecturer |

---

## Ghi chú kỹ thuật

1. **Session Persistence:**
   - User info được lưu trong localStorage với key `auth_user`
   - Khi reload page, AuthContext tự động restore session
   - Session chỉ hết khi user logout hoặc xóa localStorage

2. **Role-based Access:**
   - ProtectedRoute nhận prop `allowedRoles` để giới hạn quyền
   - Nếu user có role không được phép → redirect về `/403`

3. **Redirect after Login:**
   - URL đang cố truy cập được lưu trong `location.state.from`
   - Sau khi login thành công, redirect về URL đó thay vì home

4. **Demo Mode:**
   - Chấp nhận bất kỳ password nào (để dễ test)
   - Trong production, cần verify password với backend

---

## Tổng kết các tính năng đã hoàn thành (4/12/2025)

1. ✅ Trang Facility - Xem danh sách cơ sở vật chất theo campus
2. ✅ Trang Booking - Chi tiết phòng + chọn thời gian + form đặt
3. ✅ Modal xác nhận đặt phòng
4. ✅ Sửa link Facilities trên Header và HomePage
5. ✅ Hệ thống Authentication (login/logout)
6. ✅ Protected Routes cho facilities và booking
7. ✅ Header hiển thị user info khi đã đăng nhập

