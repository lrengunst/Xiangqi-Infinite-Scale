
# REPORT_043_PHASE_3_INIT
**TIMESTAMP:** 2024-05-24 10:00
**MODE:** BUILDER EXECUTION
**AUTHOR:** A.R.E.S (Frontend Division)

#### 1. OBJECTIVE
Khởi động Phase 3: "The Trinity" với việc thiết lập nền tảng Theme Engine (UI) và Performance Monitor (DX).

#### 2. IMPLEMENTATION

**A. THEME ENGINE (US-401)**
*   **Strategy:** Tách biệt dữ liệu (`design/palette.ts`) và tham chiếu (`design/tokens.ts`).
*   **Mechanism:** Sử dụng CSS Variables để hoán đổi nóng (Hot-swapping) mà không cần React re-render toàn bộ cây component.
*   **Schemes:** Đã cài đặt 2 chế độ:
    *   **WAR:** Tương phản cao, Đỏ/Đen/Vàng. (Mặc định)
    *   **ZEN:** Dịu mắt, Gỗ/Đá/Xám.
*   **Constraint Check:** Tuân thủ ràng buộc "Không dùng CSS-in-JS". Chỉ dùng `style.setProperty` thuần túy (O(1)).

**B. PERFORMANCE MONITOR (US-603)**
*   **Component:** `components/organisms/Monitor.tsx`.
*   **Technique:** `requestAnimationFrame` + `Canvas 2D`.
*   **Metrics:** Hiển thị FPS và Memory Heap (MB) theo thời gian thực.
*   **Isolation:** Chạy hoàn toàn bên ngoài vòng đời Render của React để đảm bảo số liệu đo đạc là trung thực và không ảnh hưởng ngược lại hiệu năng App.

#### 3. IMPACT
*   **UX:** Người dùng có thể chuyển đổi theme ngay lập tức bằng cách click vào tiêu đề "XIANGQI".
*   **DX:** Developer luôn nhìn thấy tình trạng sức khỏe của ứng dụng (FPS/Memory) ngay trên màn hình production.

#### 4. NEXT STEPS
*   Triển khai **US-403: Motion Physics** để quân cờ di chuyển mượt mà hơn.
*   Triển khai **US-501: Procedural Audio** để thêm âm thanh cho game.
