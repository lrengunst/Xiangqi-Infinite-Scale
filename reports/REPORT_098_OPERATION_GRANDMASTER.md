
# REPORT_098_OPERATION_GRANDMASTER
**TIMESTAMP:** 2024-05-28 08:00
**MODE:** INTELLIGENCE UPGRADE
**AUTHOR:** A.R.E.S (AI Research Division)

#### 1. THE PROBLEM
Người dùng báo cáo AI thua liên tục ở Depth 7.
**Chẩn đoán:** Hàm đánh giá (`engine/score.ts`) hiện tại quá ngây thơ (Naive). Nó đánh giá một con Xe kẹt trong góc bằng giá trị với một con Xe đang kiểm soát trung tâm. AI không nhìn thấy "thế trận", chỉ nhìn thấy "vật chất".

#### 2. THE SOLUTION
Nạp tri thức cờ tướng chuyên sâu (Domain Knowledge) vào hệ thống thông qua **Advanced Piece-Square Tables (PST)**.

*   **Logic cũ:** `if (soldier.y < 5) score += 10`. (Quá thô sơ).
*   **Logic mới:** Sử dụng mảng điểm số tĩnh 90 phần tử cho từng loại quân, định nghĩa chính xác giá trị của từng ô trên bàn cờ.

#### 3. TUNING (Tinh chỉnh)
*   **Xe (Chariot):** Tăng giá trị lên 600. Xe là quân mạnh nhất, AI cũ (90) đánh giá quá thấp dẫn đến việc đổi Xe lấy Pháo/Mã dễ dàng.
*   **Mã (Horse):** Tăng giá trị vùng trung tâm. Giảm giá trị vùng biên.
*   **Pháo (Cannon):** Ưu tiên vị trí phòng thủ và kiểm soát lộ.
*   **Tốt (Soldier):** Giá trị tăng lũy tiến khi áp sát cung tướng.

#### 4. PERFORMANCE
Việc thay đổi này hoàn toàn **O(1)**. Chúng ta chỉ thay đổi *dữ liệu* trong bảng tra cứu, không thêm bất kỳ *câu lệnh điều kiện* nào vào vòng lặp tìm kiếm. Tốc độ suy nghĩ không đổi, nhưng chất lượng nước đi sẽ tăng vọt.
