
# REPORT_119_DIFFICULTY_LEVELS
**TIMESTAMP:** 2024-06-01 12:00
**MODE:** FEATURE EXECUTION
**AUTHOR:** A.R.E.S (Experience Division)

#### 1. OBJECTIVE
Cung cấp các cấp độ khó (Difficulty Levels) được định nghĩa sẵn cho AI, giúp người dùng dễ dàng lựa chọn đối thủ phù hợp mà không cần hiểu sâu về các tham số kỹ thuật (Pruning, Depth).

#### 2. IMPLEMENTATION
*   **Difficulty Presets:** Định nghĩa 5 cấp độ trong `Settings.tsx`:
    *   **NOVICE (Depth 2):** Cắt tỉa rất mạnh (High Pruning), tính toán nông. Dễ mắc sai lầm chiến thuật.
    *   **EASY (Depth 4):** Cắt tỉa mạnh.
    *   **NORMAL (Depth 6):** Cấu hình tiêu chuẩn (Standard).
    *   **HARD (Depth 8):** Cắt tỉa ít (Low Pruning), tính toán sâu.
    *   **EXTREME (Depth 10):** Hầu như không cắt tỉa an toàn (Conservative Pruning), độ sâu lớn. Thử thách cực đại cho phần cứng.
*   **Action:** Hàm `applyDifficulty` sẽ cập nhật đồng thời `depth` (via `level()`) và `tuning` parameters (via `tune()`).

#### 3. IMPACT
*   **UX:** Người chơi mới có thể bắt đầu với Novice/Easy.
*   **DX:** Giữ lại các thanh trượt Manual Tuning cho Advanced User ở phía dưới.

#### 4. STATUS
**DEPLOYING...**
