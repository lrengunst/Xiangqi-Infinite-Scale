
# REPORT_091_DYSCALCULIA_AND_GLUTTONY
**TIMESTAMP:** 2024-05-27 10:00
**MODE:** RED TEAM EXECUTION
**AUTHOR:** A.R.E.S (Red Team Division)

#### 1. THE ACCUSATION: DYSCALCULIA (Rối loạn tính toán)
Tôi cáo buộc `hooks/match.ts` mắc lỗi logic sơ đẳng trong việc xác định lượt đi khi đồng bộ mạng (Sync).
*   **Evidence:** `const nextTurn = stack.length % 2 === 0 ? Types.Side.Red : Types.Side.Black;`
*   **Analysis:**
    *   Khi ván cờ bắt đầu: History = `[Genesis]` (Length 1). Lượt Đỏ.
    *   Sau 1 nước đi: History = `[Genesis, Move1]` (Length 2). Phải là lượt Đen.
    *   Logic hiện tại: `2 % 2 === 0` -> Trả về `Red`.
*   **Verdict:** **CRITICAL BUG**. Game sẽ bị kẹt lượt Đỏ mãi mãi hoặc cho phép Đỏ đi 2 lần liên tiếp khi Sync.

#### 2. THE ACCUSATION: RENDERING GLUTTONY (Thói phàm ăn khi Render)
Tôi cáo buộc `components/organisms/Arena.tsx` tội lãng phí bộ nhớ trong vòng lặp Render.
*   **Evidence:** `Array.from(board).map(...)`.
*   **Analysis:**
    *   Mỗi khi render (60fps animation hoặc mỗi nước đi), nó tạo ra một mảng JS mới chứa 90 phần tử từ `Int8Array`.
    *   Sau đó `map` tạo thêm một mảng nữa chứa React Elements.
    *   Việc chuyển đổi `TypedArray` sang `Array` là chi phí không cần thiết.
*   **Verdict:** **WASTEFUL**. Vi phạm tinh thần "Zero Allocation".

#### 3. THE EXECUTION (Thi hành án)
*   **Logic Fix:** Đảo ngược điều kiện chẵn lẻ trong `match.ts`.
*   **Static Indices:** Định nghĩa mảng hằng số `INDICES` trong `consts.ts` chứa `[0...89]`.
*   **Render Fix:** `Arena.tsx` sẽ map trực tiếp trên `INDICES`.

#### 4. STATUS
**PURGING...**
