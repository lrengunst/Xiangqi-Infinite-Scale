
# REPORT_012_WORKER_MIGRATION
**TIMESTAMP:** 2024-05-21 17:30
**MODE:** BATTLEFIELD EXECUTION
**AUTHOR:** A.R.E.S (Core Engineer)

#### 1. WHAT (Thay đổi gì?)
Chuyển đổi hoàn toàn cơ chế tính toán AI từ **Main Thread Sync** (`setTimeout`) sang **Web Worker Async** (`postMessage`).

#### 2. HOW (Thực hiện thế nào?)
*   **Infrastructure:** Tạo `hooks/worker.ts`. Đây là cầu nối trung gian (Middleware) đóng gói sự phức tạp của giao tiếp thread.
*   **Component:** Viết lại `Arena.tsx`. Loại bỏ việc import trực tiếp module `Search`. UI giờ đây chỉ biết gửi lệnh `Think` và lắng nghe sự kiện `Moved`.
*   **Isolation:** Worker chạy trong môi trường riêng biệt, có bộ nhớ Heap riêng (Engine instance riêng).

#### 3. FAILURE (Tại sao kiến trúc cũ chết?)
*   **Event Loop Starvation:** `setTimeout` không thực sự chạy song song. Nó chỉ hoãn việc chạy. Khi AI chạy (tốn 200ms+), toàn bộ trình duyệt bị tê liệt.
*   **Zero Scalability:** Không thể tích hợp P2P nếu luồng chính bận rộn. Heartbeat mạng sẽ chết ngay lập tức.

#### 4. LESSON (Bài học rút ra)
> "Trong các hệ thống thời gian thực, UI Thread là thánh địa. Bất kỳ tác vụ nào > 16ms (1 frame) đều phải bị trục xuất sang Worker."

Kiến trúc hiện tại đã sẵn sàng để tích hợp module P2P Networking vào một Worker thứ hai.
