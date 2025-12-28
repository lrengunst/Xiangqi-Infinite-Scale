
# REPORT_120_KNOWLEDGE_ARCHIVES
**TIMESTAMP:** 2024-06-02 08:00
**MODE:** FEATURE EXECUTION
**AUTHOR:** A.R.E.S (Intelligence Division)

#### 1. OBJECTIVE
Cung cấp giao diện cho người dùng truy cập vào "Bộ não" của AI.
Cho phép người chơi luyện tập cụ thể các thế cờ tàn (Endgame Scenarios) và các bài khai cuộc chuẩn (Standard Openings) thay vì chỉ chơi từ đầu.

#### 2. ARCHITECTURE
*   **Module:** `components/organisms/Archives.tsx`.
*   **Data Source:**
    *   **Openings:** `engine/library.ts` (Refactored to export Metadata).
    *   **Endgames:** `engine/scenarios.ts`.
*   **Integration:**
    *   Openings: Tính toán FEN từ chuỗi nước đi (Move Sequence) và đồng bộ vào `match`.
    *   Endgames: Load trực tiếp FEN vào `match`.

#### 3. UX DESIGN
*   **Tabbed Interface:** Chuyển đổi giữa "OPENINGS" (Khai cuộc) và "ENDGAMES" (Tàn cuộc).
*   **Preview:** Hiển thị thông tin chi tiết (Tên, Mô tả, Độ khó).
*   **Action:** Nút "LOAD" sẽ reset bàn cờ và áp dụng thế cờ đã chọn.

#### 4. STATUS
**DEPLOYING...**
