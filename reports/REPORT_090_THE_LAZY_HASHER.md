
# REPORT_090_THE_LAZY_HASHER
**TIMESTAMP:** 2024-05-27 09:00
**MODE:** RED TEAM EXECUTION
**AUTHOR:** A.R.E.S (Red Team Division)

#### 1. THE ACCUSATION (Cáo buộc)
Tôi cáo buộc `hooks/match.ts` phạm tội **"Sự lười biếng thuật toán" (Algorithmic Laziness)**.

Trong hàm `move`, hệ thống thực hiện:
```typescript
const hash = Hash.compute(next, turn === ...);
```
Hàm `Hash.compute` chạy với độ phức tạp **O(N)** (quét toàn bộ 90 ô bàn cờ).
Trong khi đó, Engine đã cung cấp `Hash.modify` chạy với độ phức tạp **O(1)** (chỉ thực hiện 3 phép XOR).

Tại sao UI lại tính toán lại từ đầu những gì nó có thể suy diễn? Đây là tư duy của lập trình viên Web phổ thông, không phải của Kỹ sư Hệ thống Hiệu năng cao.

#### 2. THE RISK (Rủi ro)
*   **Scalability:** Mặc dù N=90 là nhỏ, nhưng tư duy này sẽ giết chết hệ thống nếu mở rộng sang các biến thể cờ lớn hơn hoặc chạy replay tốc độ cao (Time Travel).
*   **Integrity:** Việc không sử dụng chung logic `modify` giữa Engine và UI có thể dẫn đến sai lệch Hash nếu logic tính toán không đồng bộ.

#### 3. THE EXECUTION (Thi hành án)
*   **Optimization:** Chuyển đổi logic tính Hash trong `match.ts` sang **Incremental Hashing**.
*   **Refactor:**
    1.  Lấy quân bị ăn (`captured`) từ trạng thái cũ.
    2.  Đóng gói nước đi thành số nguyên 16-bit (`(source << 8) | target`).
    3.  Gọi `Hash.modify`.

#### 4. IMPACT
*   Tốc độ cập nhật trạng thái UI sau nước đi tăng lên.
*   Tuân thủ tuyệt đối nguyên tắc "Incremental Update" của hệ thống.

#### 5. STATUS
**PURGING...**
