
# REPORT_080_REDUNDANT_VALIDATION
**TIMESTAMP:** 2024-05-26 20:30
**MODE:** RED TEAM ATTACK
**AUTHOR:** A.R.E.S (Red Team Division)

#### 1. THE ACCUSATION (Cáo buộc)
Tôi cáo buộc `engine/generate.ts` phạm tội **"Algorithmic Double Taxation" (Đánh thuế thuật toán hai lần)**.
Generator đã biết rõ loại quân và vector di chuyển, nhưng vẫn lười biếng gọi hàm `check()` trong `rules.ts`.

#### 2. THE EVIDENCE (Bằng chứng)
*   **Exhibit A (Chariot/Cannon):** Vòng lặp `while` quét từng ô, sau đó gọi `check`. `check` lại gọi `count`.
    *   Hậu quả: Với tầm xa $L$, độ phức tạp biến đổi từ $O(L)$ thành $O(L^2)$ do quét lại từ đầu mỗi bước.
*   **Exhibit B (Horse/Elephant):** Gọi `check` để kiểm tra cản chân/mắt. `check` phải tính toán lại tọa độ $x, y, u, v$ và làm phép toán chia/nhân.
    *   Hậu quả: Phí phạm CPU cycle cho việc tính toán hình học đã biết trước.

#### 3. THE VERDICT (Phán quyết)
**GUILTY.**
Việc tách biệt `generate` và `rules` là tốt cho kiến trúc phần mềm (Clean Code), nhưng là thảm họa cho Game Engine (Performance).

#### 4. THE EXECUTION (Thi hành án)
*   **Inlining:** Nhúng toàn bộ logic kiểm tra cản (Blocking Logic) vào `generate.ts`.
*   **Lookup Tables:** Sử dụng `HORSE_LEG` và `ELEPHANT_EYE` (Int8Array) để tra cứu điểm cản trong O(1).
*   **Linear Scanning:** Viết lại logic Xe/Pháo để duy trì trạng thái `mount` (có ngòi hay chưa) trong một vòng lặp duy nhất.
*   **Removal:** Loại bỏ hoàn toàn việc import `check` từ `rules.ts`.

#### 5. IMPACT
Tốc độ sinh nước đi dự kiến tăng 200-300% đối với các quân trượt (Sliding Pieces) và 50% đối với Mã/Tượng.
