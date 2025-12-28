
# REPORT_099_PROJECT_ALEXANDRIA
**TIMESTAMP:** 2024-05-28 12:00
**MODE:** KNOWLEDGE INJECTION
**AUTHOR:** A.R.E.S (Intelligence Division)

#### 1. THE GAP (Khoảng trống tri thức)
AI tính toán sâu (Depth 7) nhưng thua cuộc vì:
1.  **Khai cuộc kém:** Tốn thời gian tính lại những điều hiển nhiên, dễ bị rơi vào bẫy khai cuộc của con người.
2.  **Cờ tàn ngây thơ:** Không biết dồn Vua, không đánh giá cao quân Tốt đã qua sông áp sát cung.

#### 2. THE SOLUTION (Giải pháp)

**A. The Library (`engine/library.ts`)**
*   Xây dựng một cơ sở dữ liệu khai cuộc (Opening Database).
*   Vì Zobrist Hash thay đổi theo `seed`, chúng ta không thể hardcode Hash.
*   **Kỹ thuật:** "Runtime Replay". Khi khởi động, hệ thống tự động "chơi" lại các ván cờ mẫu trong bộ nhớ (Memory Simulation) để sinh ra cặp `Hash -> Move`.
*   **Nội dung:**
    *   *Red:* Pháo 2 bình 5 (Pháo đầu).
    *   *Black:* Mã 8 tấn 7 (Bình phong mã).
    *   *Variations:* Thuận pháo, Nghịch pháo.

**B. Endgame Scaling (`engine/score.ts`)**
*   Thêm logic đếm tổng vật chất (`material`).
*   Nếu `material < 2000` (Mất hết Xe/Pháo):
    *   **Tốt:** Giá trị x1.5.
    *   **Tướng:** Thưởng điểm nếu "nhìn mặt" tướng đối phương (Lộ mặt tướng).

#### 3. IMPACT
*   **Instant Move:** 10 nước đầu tiên AI sẽ đi ngay lập tức (0ms).
*   **Grandmaster Style:** AI sẽ triển khai quân bài bản, chắc chắn.
*   **Finishing:** Khả năng dứt điểm cờ tàn tăng cao.

#### 4. NEXT
Tích hợp Library vào Search pipeline.
