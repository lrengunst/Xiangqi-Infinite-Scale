
# REPORT_103_TACTICAL_SUPERIORITY
**TIMESTAMP:** 2024-05-30 20:00
**MODE:** ENGINE OVERHAUL
**AUTHOR:** A.R.E.S (Engine Division)

#### 1. THE BLUNDER
User reported AI blundering pieces at Depth 5.
**Root Cause:** Aggressive pruning (Likely Null Move Pruning or Futility) hid the tactical refutation (the opponent capturing the piece).

#### 2. THE UPGRADE: PVS + EXTENSIONS
Chuyển đổi từ `Negamax` cổ điển sang **PVS (Principal Variation Search)**.

*   **Check Extension:** `if (inCheck) depth++`. Đảm bảo AI không bao giờ bỏ sót các mối đe dọa trực tiếp đến Vua.
*   **Move Ordering 2.0:**
    1.  **Hash Move:** Best move từ quá khứ (TT).
    2.  **Captures:** Ăn quân (MVV/LVA).
    3.  **Killer Moves:** Nước đi hay (non-capture) mới phát hiện.
    4.  **History:** Nước đi hay theo thống kê lịch sử.
*   **PVS Logic:**
    *   Search move 1: `alpha, beta` (Full Window).
    *   Search move 2..N: `alpha, alpha + 1` (Null Window / Zero Window).
    *   Nếu Null Window thất bại (nhánh con tốt bất ngờ) -> Search lại Full Window.

#### 3. KILLER HEURISTIC
Thêm bảng `KILLERS` (`Int32Array`) để lưu 2 nước đi sát thủ cho mỗi độ sâu.

#### 4. IMPACT
AI sẽ trở nên cực kỳ "dai dẳng" trong các tình huống chiến thuật. Nó chấp nhận tốn thêm thời gian để đảm bảo an toàn tuyệt đối cho quân cờ.
