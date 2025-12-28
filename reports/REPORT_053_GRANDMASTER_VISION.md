
# REPORT_053_GRANDMASTER_VISION
**TIMESTAMP:** 2024-05-24 23:45
**MODE:** OPTIMIZATION
**AUTHOR:** A.R.E.S (Engine Division)

#### 1. OBJECTIVE
Tối ưu hóa khả năng cắt tỉa (Pruning) của thuật toán Alpha-Beta thông qua việc sắp xếp nước đi (Move Ordering).

#### 2. IMPLEMENTATION
*   **Iterative Deepening (ID):** `search.ts` giờ đây chạy vòng lặp từ độ sâu 1 đến `depth`.
*   **Move Ordering:** Tại mỗi node, hệ thống hỏi Transposition Table (`Table.hint`) xem nước đi nào là tốt nhất trong lần tìm kiếm trước (hoặc độ sâu nông hơn).
*   **Buffer Swapping:** Nước đi tốt nhất (PV-Move) được hoán đổi lên đầu Buffer (`BUFFER[start]`) để được duyệt đầu tiên.

#### 3. THEORETICAL IMPACT
*   **Best Case:** Nếu nước đi đầu tiên luôn là nước tốt nhất, độ phức tạp của Alpha-Beta giảm từ $O(b^d)$ xuống $O(b^{d/2})$.
*   **Effect:** AI có thể tìm kiếm sâu hơn (Depth +1 hoặc +2) trong cùng một khoảng thời gian so với phiên bản trước.
*   **Safety:** ID đảm bảo rằng nếu chúng ta giới hạn thời gian (Time Budget), chúng ta luôn có kết quả từ độ sâu trước đó (d-1) để trả về ngay lập tức (mặc dù hiện tại UI đang dùng Fixed Depth).

#### 4. NEXT STEPS
Hệ thống AI đã đạt đến giới hạn của các kỹ thuật cơ bản. Bước tiếp theo là **Quiescence Search** (Tìm kiếm yên tĩnh) để giải quyết hiệu ứng đường chân trời (Horizon Effect) - tránh việc AI dừng tìm kiếm ngay giữa một chuỗi ăn quân.
