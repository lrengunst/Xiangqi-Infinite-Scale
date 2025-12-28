
# REPORT_113_PARAMETRIC_LOCKDOWN
**TIMESTAMP:** 2024-05-31 20:00
**MODE:** DEEP SCAN & REFACTOR
**AUTHOR:** A.R.E.S (Red Team Division)

#### 1. OBJECTIVE
Rà soát toàn diện mã nguồn để tìm kiếm các "Magic Numbers" (Con số ma thuật) đang điều khiển hành vi của AI nhưng không được định danh rõ ràng.

#### 2. DETECTION LOG (Nhật ký phát hiện)

**A. TARGET: `engine/search.ts`**
*   **Aspiration Window:** `delta = 30`. Hardcode.
*   **Ordering Scores:** `2000000` (TT), `900000` (Killer 1), `800000` (Killer 2). Hardcode.
*   **Quiescence Futility:** `900` (Safety Margin). Hardcode.
*   **LMR Logic:**
    *   `depth >= 3` (Kích hoạt).
    *   `legalMoves > 4` (Count Margin).
    *   `reduction = 1, 2, 3` (Step values).

**B. TARGET: `engine/history.ts`**
*   **Aging Limit:** `1000000`. Đã được định nghĩa là `LIMIT`. (PASS)

**C. TARGET: `engine/table.ts`**
*   **Size:** `1048576`. Đã được định nghĩa là `SIZE`. (PASS)

#### 3. THE VERDICT
Module `search.ts` chứa quá nhiều tham số hành vi bị ẩn giấu trong logic `if/else`. Điều này cản trở việc tinh chỉnh (Tuning) AI để đạt sức mạnh tối đa.

#### 4. THE FIX
Trích xuất (Extract) toàn bộ các con số này thành hằng số có tên (Named Constants) tại đầu module.

#### 5. STATUS
**REFACTORING...**
