
# REPORT_003_IDENTITY_CRISIS
**TIMESTAMP:** 2024-05-21 12:00
**MODE:** Deep Red Team Attack (Identity & Allocation)
**AUTHOR:** A.R.E.S (Red Team Division)

#### 1. OBJECTIVE (Mục tiêu)
Tấn công vào sự tuân thủ "Chỉ thị tối cao" về định danh (Single-Word Identity) và sự dối trá trong tuyên bố "O(1)" của hệ thống hiện tại. Phân loại lại hệ thống tri thức đang bị hỗn độn.

#### 2. CONSTRUCT (Hiện trạng)
*   **Định danh:** Hệ thống đang sử dụng `camelCase` ghép từ rườm rà: `generateMoves`, `getBestMove`, `isCheckmate`, `countObstacles`.
*   **Bộ nhớ:** Hàm `execute` đang cấp phát `new Int8Array` tại mỗi nước đi giả lập.
*   **Tri thức:** Tất cả dồn vào một thư mục chung chung, không phân tách nóng/nguội.

#### 3. RED TEAM ATTACK LOG (Nhật ký Tấn công)

### VECTOR 1: SỰ Ô NHIỄM NGÔN NGỮ (The Linguistic Pollution)
*   **Target:** `domain/*.ts`
*   **Evidence:**
    *   `export const generateMoves = ...` (2 từ)
    *   `export const getBestMove = ...` (3 từ)
    *   `export const isCheckmate = ...` (2 từ)
*   **Attack:**
    *   Vi phạm trực tiếp **Điều 2: LUẬT VỀ ĐỊNH DANH ĐƠN TỪ**.
    *   Tư duy "Action-Based" (làm gì) thay vì "Data-Based" (cấu trúc gì).
    *   Khi xây dựng Framework/Toolkit, các tên hàm dài dòng kiểu `getSomething` tạo ra sự nhiễu loạn thị giác và khó mở rộng API.
*   **Hậu quả:** Mã nguồn trông giống một ứng dụng CRUD tầm thường hơn là một Game Engine hiệu suất cao.
*   **Verdict:** **VI PHẠM NGHIÊM TRỌNG**.

### VECTOR 2: CÁI BẪY GIẢ MẠO O(1) (The Fake O(1) Trap)
*   **Target:** `domain/eval.ts` -> `evaluate`
*   **Evidence:**
    ```typescript
    export const evaluate = (grid: Grid): number => {
      for (let i = 0; i < SIZE; i++) { ... } // Loop 90 lần
    }
    ```
*   **Attack:**
    *   Tuyên bố hệ thống O(1), nhưng hàm đánh giá (score) lại chạy O(N) với N=90.
    *   Trong AI Search, hàm này được gọi hàng triệu lần. 90 triệu phép tính dư thừa.
    *   **Tại sao ngu ngốc?** Tại sao phải quét lại toàn bộ bàn cờ chỉ để biết điểm số thay đổi thế nào sau 1 nước đi?
*   **Refinement:** Cần sử dụng **Incremental Update** (Cập nhật gia tăng).
    *   `Score_New = Score_Old - Piece_From + Piece_To`.
    *   Độ phức tạp: O(1) chuẩn toán học.

### VECTOR 3: TRI THỨC RÁC (Knowledge Entropy)
*   **Target:** Cấu trúc thư mục `knowledges/`
*   **Attack:**
    *   Việc trộn lẫn Todo (Hot) với Memory (Cold) vào cùng một chỗ khiến Agent mất khả năng tập trung.
    *   Không có sự phân tách giữa "Nguyên lý bất biến" (Architectures) và "Trạng thái hiện thời" (Todos).
*   **Fix:** Sharding dữ liệu tri thức ngay lập tức.

#### 4. REFINED SOLUTION (Giải pháp tối ưu)
*   **Refactor Identity:** Chuyển đổi toàn bộ API sang đơn từ (`gen`, `search`, `mate`, `score`).
*   **Refactor Logic:** Cài đặt Incremental Score O(1).
*   **Knowledge Sharding:** Tạo các file tri thức riêng biệt theo nhiệt độ dữ liệu (Hot/Warm/Cold).

#### 5. NEXT TRIGGER
*   Thực thi Refactoring đổi tên toàn bộ `domain` layer.
*   Viết lại `eval` (nay là `score`) sử dụng Delta Update.
