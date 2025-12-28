# REPORT_001_RED_TEAM_AUDIT
**TIMESTAMP:** 2024-05-21 10:00
**MODE:** Red Team Attack

#### 1. OBJECTIVE
Kiểm tra sức chịu đựng (Stress Test) của kiến trúc hiện tại đối với các ràng buộc bất khả xâm phạm: Big O(1) Absolute và Infinite P2P Scaling.

#### 2. CONSTRUCT (Hiện trạng)
*   **State Management:** Sử dụng `Int8Array` (90 bytes) để lưu bàn cờ.
*   **Move Execution:** Hàm `execute` trong `domain/core.ts` tạo mảng mới (`new Int8Array`) cho mỗi nước đi để đảm bảo tính bất biến (immutability) cho React.
*   **AI Engine:** Minimax chạy trên Main Thread, sử dụng `setTimeout` để tránh treo UI.
*   **Naming Convention:** Sử dụng camelCase truyền thống (`getBestMove`, `generateMoves`).

#### 3. RED TEAM ATTACK LOG

*   **Vector 1: The Allocation Spike (Lỗ hổng cấp phát bộ nhớ)**
    *   **Mô tả:** Hàm `execute` thực hiện `new Int8Array(grid)`. Trong vòng lặp AI (Minimax), hàm này được gọi hàng nghìn/triệu lần.
    *   **Hậu quả:** Gây áp lực cực lớn lên Garbage Collector (GC). Khi GC chạy, frame rate sẽ tụt (Stuttering). Vi phạm nguyên tắc "Zero Allocation" trong Hot Path.
    *   **Đánh giá:** **NGÂY THƠ**. Giải pháp này chỉ tốt cho Web App thông thường, không phải Game Engine hiệu năng cao.

*   **Vector 2: The Main Thread Blockade (Tắc nghẽn luồng chính)**
    *   **Mô tả:** AI tính toán trên luồng chính (Main Thread). Dù có `setTimeout`, khi độ sâu (depth) tăng lên, JS Event Loop vẫn bị chiếm dụng.
    *   **Hậu quả:** UI bị đơ (frozen) khi AI suy nghĩ. Không thể scale lên P2P vì việc nhận message mạng sẽ bị chặn bởi việc tính toán nước đi.
    *   **Đánh giá:** **NGUY HIỂM**. Cần chuyển sang Web Workers ngay lập tức.

*   **Vector 3: Single-Word Identity Violation (Vi phạm định danh)**
    *   **Mô tả:** Các hàm `getBestMove`, `generateMoves`, `isCheckmate` vi phạm luật đơn từ (The Law of Single-Word Identity).
    *   **Hậu quả:** Mã nguồn rườm rà, khó đọc, tư duy "Action-Oriented" thay vì "Data-Oriented".
    *   **Đánh giá:** Cần Refactor toàn bộ sang cấu trúc Module (ví dụ: `ai.search`, `grid.gen`, `query.mate`).

#### 4. REFINED SOLUTION (Giải pháp tối ưu)
*   **Memory:** Chuyển sang dùng **Undo-Redo Stack** với `mutate` và `unmutate` cho AI để không bao giờ cấp phát bộ nhớ mới trong quá trình tìm kiếm.
*   **Concurrency:** Tách toàn bộ logic AI và Rules sang **Web Worker**. Main Thread chỉ lo việc Render.
*   **Identity:** Refactor API theo chuẩn đơn từ.

#### 5. NEXT TRIGGER
*   Refactor: Chuyển đổi kiến trúc sang Web Worker và áp dụng Zero-Allocation Pattern.
