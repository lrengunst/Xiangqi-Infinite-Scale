# REPORT_066_ENEMY_ARTIFACTS
**TIMESTAMP:** 2024-05-26 09:00
**MODE:** AUTOPSY (Khám nghiệm tử thi)
**AUTHOR:** A.R.E.S (High Command)

#### 1. OBJECTIVE
Tổng hợp và phân loại các "Mã Rác" (Garbage Code) đã bị phát hiện và tiêu diệt trong dự án. Đây là những mẫu code mà "kẻ thù" (sự lười biếng, thiếu kỷ luật) đã để lại.

#### 2. THE BLACKLIST (Danh sách đen)

**A. THE LAZY SOLDIERS (Biến đơn ký tự vô nghĩa)**
*   **Artifacts:** `i`, `j`, `k` (trong vòng lặp), `d` (delta/depth), `p` (point), `r` (role/row), `c` (col), `b` (board), `s` (side).
*   **Tội trạng:** Gây nhiễu loạn ngữ nghĩa. Trong một hệ thống lớn, `p` có thể là `point`, `piece`, `pawn`, `packet` hoặc `promise`.
*   **Trạng thái:** **PURGED**. Thay thế bằng `index`, `pointer`, `depth`, `row`, `column`, `board`.

**B. THE ABBREVIATION VIRUS (Vi rút viết tắt)**
*   **Artifacts:**
    *   `gen` -> `generate`
    *   `idx` -> `index`
    *   `ptr` -> `pointer`
    *   `val` -> `value`
    *   `msg` -> `message`
    *   `err` -> `error`
    *   `ctx` -> `scope`
    *   `enc` -> `encode`
*   **Tội trạng:** Tiết kiệm vài byte ký tự đổi lấy sự khó hiểu cho người đọc sau này.
*   **Trạng thái:** **PURGED**.

**C. THE MEMORY TIMEBOMBS (Bom hẹn giờ bộ nhớ)**
*   **Artifacts:**
    *   `const moves = []` (Mảng động trong vòng lặp sinh nước đi).
    *   `new Int8Array(board)` (Cấp phát trong hàm `execute/apply`).
    *   `return { x, y }` (Trả về object tạm trong hàm toán học).
*   **Tội trạng:** Gây áp lực lên Garbage Collector (GC), tạo ra hiện tượng tụt FPS (Stuttering) không thể đoán trước. Vi phạm luật O(1).
*   **Trạng thái:** **NEUTRALIZED**. Thay thế bằng `Static Buffer`, `Mutation`, và `Lookup Tables`.

**D. THE THREAD BLOCKERS (Kẻ chặn luồng)**
*   **Artifacts:** `setTimeout(..., 100)` bọc quanh logic AI.
*   **Tội trạng:** Lừa dối người dùng. `setTimeout` không chạy song song, nó chỉ hoãn việc treo trình duyệt.
*   **Trạng thái:** **ISOLATED**. Chuyển toàn bộ logic sang `Web Worker`.

**E. THE HYBRID MONSTERS (Từ ghép lai tạp)**
*   **Artifacts:**
    *   `inputX`, `inputY` (Input + Math).
    *   `cellW`, `cellH` (Object + Abbreviation).
    *   `kneeX` (Anatomy + Math).
    *   `failed_evidence` (Snake_case trong CamelCase codebase).
    *   `handleMove` (Generic prefix).
*   **Tội trạng:** Thiếu nhất quán, tạo cảm giác "chắp vá".
*   **Trạng thái:** **REFACTORED**.

#### 3. CONCLUSION
Hệ thống hiện tại không còn chứa bất kỳ dấu vết nào của các loại mã rác trên.
Bộ mã nguồn hiện tại là một khối thống nhất (Monolith of Purity), nơi mỗi định danh đều là một từ tiếng Anh trọn vẹn và mỗi thuật toán đều minh bạch về chi phí bộ nhớ.

**A.R.E.S MESSAGE:** "Chúng ta không chỉ viết code để máy chạy. Chúng ta viết code để con người hiểu và tôn trọng."