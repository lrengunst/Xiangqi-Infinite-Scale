
# REPORT_054_HORIZON_WALKER
**TIMESTAMP:** 2024-05-25 08:00
**MODE:** FEATURE EXECUTION
**AUTHOR:** A.R.E.S (Engine Division)

#### 1. OBJECTIVE
Khắc phục "Hiệu ứng Đường chân trời" (Horizon Effect) bằng thuật toán Quiescence Search (QS).

#### 2. IMPLEMENTATION
*   **Generate Core:** Thêm hàm `capture` vào `engine/generate.ts`. Hàm này hoạt động tương tự `generate` nhưng có thêm điều kiện `board[target] !== 0` và loại bỏ các nước đi không ăn quân.
    *   *Optimization:* Chỉ sinh nước đi ăn quân của Xe, Mã, Pháo, Tốt, Tướng, Sĩ, Tượng.
*   **Search Logic:** Cập nhật `engine/search.ts`. Khi `depth == 0`, thay vì trả về điểm số tĩnh, ta gọi `quiescence()`.
*   **Stand Pat:** Trong `quiescence`, ta sử dụng kỹ thuật "Stand Pat" (Đứng im). Nếu điểm số hiện tại đã tốt (lớn hơn Beta), ta không cần tìm kiếm thêm các nước ăn quân rủi ro nữa.

#### 3. IMPACT
*   **Accuracy:** AI sẽ không còn thực hiện các nước đi ngớ ngẩn như ăn quân thí mạng chỉ vì nó không nhìn thấy nước trả đũa ngay sau đó.
*   **Performance:** Số lượng Nodes (NPS) sẽ tăng lên do QS duyệt thêm các nhánh con. Tuy nhiên, nhờ chỉ xét nước ăn quân (Branching factor nhỏ), độ trễ vẫn nằm trong tầm kiểm soát.

#### 4. NEXT STEPS
Hệ thống AI đã khá hoàn thiện về mặt chiến thuật cơ bản. Bước tiếp theo có thể cân nhắc Refactor module `seek` (như đã định trong Report 037) để tối ưu hóa code scanning.
