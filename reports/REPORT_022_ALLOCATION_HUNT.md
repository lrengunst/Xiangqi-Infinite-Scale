
# REPORT_022_ALLOCATION_HUNT
**TIMESTAMP:** 2024-05-21 22:30
**MODE:** DEEP CLEAN (Codebase Hygiene)
**AUTHOR:** A.R.E.S (Red Team Division)

#### 1. THE DISCOVERY (Phát hiện)
Trong quá trình rà soát (Scan) mã nguồn `engine/`, tôi phát hiện các vi phạm nghiêm trọng nguyên tắc **"Zero Allocation in Hot Path"**:

1.  **`engine/rules.ts` -> `fly`**:
    *   **Tội lỗi:** `const PALACE_RED_INDICES = [...]`.
    *   **Hậu quả:** Hàm này được gọi bởi `threat`, `threat` được gọi bởi `mate`, `mate` được gọi bởi `search`. Mảng này được tạo mới hàng triệu lần mỗi giây.
    
2.  **`engine/generate.ts` -> `switch(role)`**:
    *   **Tội lỗi:** `const ts = [...]` bên trong các case `Role.Advisor`, `Role.Elephant`.
    *   **Hậu quả:** Mảng này được tạo mới **cho mỗi quân cờ** trên bàn cờ trong mỗi lần sinh nước đi. Đây là O(N) allocations.

#### 2. THE PURGE (Thanh trừng)
Tôi đã thực hiện **Hoisting** (kéo lên) toàn bộ các mảng hằng số này ra khỏi phạm vi hàm (Function Scope) và biến chúng thành **Module-Level Constants**.

*   `DIRS_HORSE`, `DIRS_LINEAR`, `DIRS_ADVISOR`... hiện là hằng số tĩnh.
*   `PALACE_INDICES` hiện là hằng số tĩnh.

#### 3. IMPACT (Tác động)
*   **Memory Pressure:** Giảm áp lực lên GC xuống gần như bằng 0 trong quá trình suy nghĩ của AI.
*   **Performance:** Loại bỏ chi phí khởi tạo mảng (Array Initialization overhead).
*   **Fix Logic:** Phát hiện logic sinh nước đi cho Pháo (Cannon) trong `generate.ts` phiên bản cũ bị sai (trộn lẫn logic Xe và Pháo). Đã viết lại logic Ray-casting cho Pháo tách biệt để đảm bảo chính xác.

#### 4. VERDICT
Codebase hiện tại sạch hơn đáng kể. Các "Agent lười biếng" đã bị xử lý.
