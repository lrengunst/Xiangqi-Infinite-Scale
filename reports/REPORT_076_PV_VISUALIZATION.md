
# REPORT_076_PV_VISUALIZATION
**TIMESTAMP:** 2024-05-26 17:00
**MODE:** FEATURE EXECUTION
**AUTHOR:** A.R.E.S (Engine Division)

#### 1. OBJECTIVE
Chứng minh tốc độ và trí tuệ của AI bằng cách hiển thị "Dòng suy nghĩ" (Principal Variation - PV).
Đáp ứng yêu cầu "Không có sự lười biếng" trong trải nghiệm người dùng.

#### 2. IMPLEMENTATION
*   **Engine Trace:** Cài đặt hàm `trace` trong `search.ts`. Hàm này không đệ quy mà thực hiện truy vấn tuần tự (Iterative Lookup) vào Transposition Table để tái tạo chuỗi nước đi tốt nhất.
*   **Protocol Upgrade:** Thêm trường `line` (number array) vào gói tin Telemetry.
*   **Visualization:** Cập nhật `Network.tsx` để hiển thị chuỗi PV dưới dạng tọa độ (vd: `82-42`).

#### 3. TECHNICAL CHALLENGE
*   **Simulation:** Để truy vấn TT cho nước đi thứ 2, 3... ta cần Hash của bàn cờ tương lai. Do đó, `trace` phải thực hiện `commit` nước đi trên bản sao `sandbox` để tính hash chính xác.
*   **Performance:** Quá trình `trace` chỉ diễn ra 1 lần mỗi độ sâu (Depth Iteration), chi phí là không đáng kể so với việc tìm kiếm hàng nghìn node.

#### 4. IMPACT
Người dùng giờ đây có thể thấy AI "đổi ý" như thế nào. Ví dụ: Ở Depth 3 nó định đi Pháo, nhưng sang Depth 4 nó nhận ra sẽ bị mất Xe nên đổi sang đi Mã. Điều này tạo ra sự tin tưởng vào khả năng tính toán của hệ thống.

#### 5. STATUS
Feature Active.
