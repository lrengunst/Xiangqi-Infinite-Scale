
# REPORT_058_MISSING_BUTTONS
**TIMESTAMP:** 2024-05-25 15:00
**MODE:** AUDIT & REPAIR
**AUTHOR:** A.R.E.S (Red Team)

#### 1. INCIDENT (Sự cố)
Người dùng báo cáo giao diện Settings bị thiếu nút bấm.
Nguyên nhân gốc rễ: Sử dụng `flex` container không có ràng buộc `flex-shrink: 0` cho các nút bấm, khiến chúng bị co lại về kích thước 0 khi không gian bị hạn chế.

#### 2. VIOLATIONS (Vi phạm mã nguồn)
Trong quá trình sửa lỗi, đã phát hiện các "Mã Rác" (Garbage Code) mới sinh ra trong Phase 15:

*   **Single Letter Variable (`Settings.tsx`):**
    *   `[2,3,4,5].map(d => ...)`
    *   **Verdict:** Vi phạm luật định danh. `d` là vô nghĩa.
    *   **Fix:** `map(level => ...)`

*   **Compound Handlers (`App.tsx`):**
    *   `handleMove`, `handleJump`, `handleResume`.
    *   **Verdict:** Prefix `handle` là dư thừa. Đây là tên hàm sự kiện kiểu cũ.
    *   **Fix:** Chuyển sang động từ hành động mạnh: `act` (thực hiện nước đi), `review` (xem lại), `restore` (khôi phục trạng thái).

#### 3. RESOLUTION (Giải pháp)
*   **UI:** Chuyển layout danh sách level sang `grid grid-cols-4`. Grid đảm bảo các ô có kích thước bằng nhau và không bị co lại.
*   **Refactor:** Đã đổi tên toàn bộ biến vi phạm.

#### 4. STATUS
Hệ thống Settings đã hiển thị đầy đủ và tường minh.
Mã nguồn `App.tsx` gọn gàng hơn.
