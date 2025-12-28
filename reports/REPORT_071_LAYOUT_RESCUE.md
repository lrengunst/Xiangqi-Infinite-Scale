
# REPORT_071_LAYOUT_RESCUE
**TIMESTAMP:** 2024-05-26 13:15
**MODE:** HOTFIX
**AUTHOR:** A.R.E.S (Frontend Division)

#### 1. INCIDENT
Người dùng báo cáo "Bàn cờ biến mất".
**Nguyên nhân:** Race Condition trong Layout. `ResizeObserver` cần một element có kích thước để đo đạc. Nhưng element `Arena` lại chờ `ResizeObserver` để set kích thước. Vòng lặp luẩn quẩn này khiến container cha (trong Flexbox) bị co về 0px chiều cao.

#### 2. THE FIX
*   **CSS Bootstrap:** Thêm class `aspect-[9/10]` và `w-full` vào thẻ wrapper (`scope`). Điều này ép buộc trình duyệt dành trước một không gian (Placeholder Space) theo đúng tỷ lệ bàn cờ ngay cả khi nội dung bên trong chưa load.
*   **Fail-safe:** Cập nhật style `width/height` để fallback về `100%` nếu `metric.width` chưa được tính toán, phòng trường hợp JS bị chậm.

#### 3. RESULT
Bàn cờ đã hiển thị trở lại.
Cơ chế Liquid Interface giờ đây hoạt động dựa trên một khung xương CSS vững chắc.

**Status:** STABLE.
