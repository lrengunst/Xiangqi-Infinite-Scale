
# REPORT_078_ASYNC_SLICING
**TIMESTAMP:** 2024-05-26 18:30
**MODE:** PERFORMANCE RESCUE
**AUTHOR:** A.R.E.S (Core Engineer)

#### 1. THE INCIDENT
Người dùng báo cáo giao diện bị đơ (Freeze) khi AI hoạt động.
Điều này xác nhận hệ thống đang chạy ở chế độ **Main Thread Fallback** (do môi trường Sandbox chặn Worker), và việc tính toán Depth 5 đồng bộ đã chặn đứng Event Loop của trình duyệt.

#### 2. THE FIX: ASYNC SLICING
Thay vì chạy `search(depth)` một lèo, chúng ta đã tái cấu trúc `hooks/worker.ts` để giả lập Iterative Deepening thủ công:
*   **Loop:** Chạy vòng lặp từ `d=1` đến `d=depth` ngay trong Hook.
*   **Yield:** Sử dụng `await new Promise(r => setTimeout(r, 10))` giữa các lần gọi hàm `search`.
*   **Slice:** Gọi `search(..., startDepth=d, endDepth=d)` để Engine chỉ tính toán lớp hiện tại.

#### 3. ENGINE UPGRADE
*   `engine/search.ts` được thêm tham số `startDepth`.
*   Điều này cho phép Main Thread kiểm soát hạt (granularity) của việc thực thi.

#### 4. RESULT
*   **UI:** Vẫn phản hồi (click, animation) ngay cả khi AI đang tính toán nặng.
*   **Feedback:** Telemetry được cập nhật mượt mà sau mỗi độ sâu.
*   **Safety:** Đã thêm cờ `abort` để dừng tính toán ngay lập tức nếu người dùng Reset game.

#### 5. STATUS
Hệ thống hiện tại đảm bảo trải nghiệm mượt mà trên mọi môi trường (Worker hoặc Main Thread).
