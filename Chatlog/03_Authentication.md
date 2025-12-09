# Chatlog - Tạo hệ thống Authentication

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

## Cấu trúc thư mục

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



