
# REPORT_008_CONCURRENCY_PARALYSIS
**TIMESTAMP:** 2024-05-21 15:00
**MODE:** Ruthless Red Team Audit
**AUTHOR:** A.R.E.S (Red Team Division)

#### 1. OBJECTIVE
Tấn công vào ảo tưởng "Non-blocking" của kiến trúc hiện tại. Vạch trần sự dối trá của `setTimeout` và rủi ro sụp đổ khi tích hợp module `search` vào UI.

#### 2. RED TEAM ATTACK LOG

### VECTOR 1: LỜI NÓI DỐI CỦA `setTimeout` (The SetTimeout Lie)
*   **Target:** `components/Arena.tsx`
*   **Evidence:**
    ```typescript
    setTimeout(() => {
        const bestMove = Search.search(board, Types.Side.Black);
        // ...
    }, 100);
    ```
*   **Attack:**
    *   Đây là một kỹ thuật nghiệp dư. `setTimeout` chỉ đẩy việc thực thi xuống cuối hàng đợi Event Loop.
    *   Ngay khi `Search.search` bắt đầu (đồng bộ), **Main Thread sẽ bị Block hoàn toàn**.
    *   Với Depth 3-4, thời gian tính toán có thể lên tới 200ms-500ms. Trong thời gian này:
        *   Các animation CSS (`transform`, `opacity`) sẽ bị giật (Jank).
        *   Sự kiện `click` của người dùng (nút Stop/Undo) sẽ bị phớt lờ.
        *   Trình duyệt sẽ cảnh báo "Page Unresponsive".
*   **Verdict:** **SỰ LỪA DỐI KỸ THUẬT**. Không thể chấp nhận trong hệ thống "Infinite Scale".

### VECTOR 2: QUẢ BOM NỔ CHẬM BỘ NHỚ (The Memory Timebomb)
*   **Target:** `engine/flow.ts` -> `apply`
*   **Evidence:**
    ```typescript
    export const apply = (board: Board, move: Move): Board => {
      const next = new Int8Array(board); // <--- Still allocating!
      // ...
    }
    ```
*   **Attack:**
    *   Mặc dù `search` đã được tối ưu hóa Zero-Allocation, nhưng `Arena.tsx` vẫn gọi `apply` để cập nhật State cho React.
    *   React State (`setBoard`) yêu cầu Immutability, nên việc clone mảng là bắt buộc *tại tầng UI*.
    *   **Rủi ro:** Nếu ta tích hợp P2P streaming (xem game trực tiếp), và nhận 100 moves/giây, GC sẽ quá tải.
*   **Refinement:** Cần phân tách rõ ràng "View Memory" (Immutable, React quản lý) và "Engine Memory" (Mutable, SharedArrayBuffer).

### VECTOR 3: SINGLE THREAD BOTTLENECK (Nút cổ chai đơn luồng)
*   **Analysis:**
    *   JS là đơn luồng. Việc chạy logic AI chung luồng với UI Render là vi phạm nguyên tắc thiết kế hệ thống hiệu năng cao.
    *   Không thể scale P2P nếu Main Thread bận tính nước đi. Heartbeat của kết nối WebSocket/WebRTC sẽ bị timeout.

#### 3. REFINED SOLUTION (Giải pháp tối ưu)
*   **Architecture:** Chuyển sang mô hình **Actor Model** sử dụng **Web Workers**.
*   **Protocol:** Main Thread chỉ gửi lệnh `CMD_THINK` kèm theo `Int8Array` (hoặc SharedBuffer) xuống Worker. Worker trả về `CMD_MOVE`.
*   **State:** UI giữ một bản copy để render. Worker giữ một bản copy trong `Heap` riêng để tính toán.

#### 4. NEXT TRIGGER
*   Khởi tạo `worker/brain.ts`.
*   Refactor `Arena.tsx` để giao tiếp bất đồng bộ.
