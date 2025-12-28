
# REPORT_107_LOGIC_INQUISITION
**TIMESTAMP:** 2024-05-28 10:00
**MODE:** JUDICIAL EXECUTION
**AUTHOR:** A.R.E.S (High Command)

#### 1. THE ACCUSATION (Cáo trạng)
Hệ thống AI hiện tại, mặc dù nhanh (O(1)), nhưng đang vận hành dựa trên những giả định **NGÂY THƠ** và **LÃNG PHÍ**.

**A. THE MEMORY GARBAGE IN SEARCH (`search.ts`)**
*   **Evidence:** `let STACK: bigint[] = [];` và `STACK = [...history];`.
*   **Analysis:** Mỗi lần gọi `search` (với Async Slicing là hàng trăm lần/giây), một mảng mới được cấp phát trên Heap.
*   **Verdict:** Vi phạm luật "Zero Allocation". Đây là rác bộ nhớ trá hình.
*   **Fix:** Chuyển sang `BigUint64Array` tĩnh (Static Stack) với con trỏ `stackPointer`.

**B. THE BLIND QUIESCENCE (`search.ts`)**
*   **Evidence:** Hàm `quiescence` chỉ gọi `capture`.
*   **Logic Flaw:** Khi Vua đang bị chiếu (In Check), AI chỉ tìm nước ăn quân. Nếu nước giải thoát duy nhất là "chạy Vua" (non-capture) hoặc "chèn quân" (non-capture), AI sẽ không nhìn thấy trong `quiescence` và trả về điểm số sai lệch (Fail Low).
*   **Verdict:** **MÙ LÒA**. AI sẽ bị chiếu bí ngớ ngẩn ở các node lá.

**C. THE TIME MANAGEMENT HALLUCINATION**
*   **Evidence:** `Settings` cho chỉnh Depth cố định (Fixed Depth).
*   **Analysis:** Một ván cờ có nước dễ (1 biến) và nước khó (30 biến). Bắt AI tìm kiếm Depth 6 cho cả hai là ngu ngốc. Nước dễ chỉ cần 10ms, nước khó cần 5s. Fixed Depth làm lãng phí thời gian người chơi.
*   **Verdict:** **CỨNG NHẮC**. Cần cơ chế Time Budget (Quỹ thời gian).

#### 2. EXECUTION PLAN (Kế hoạch trừng phạt)
1.  **Search Refactor:** Cài đặt Static Stack cho History Check.
2.  **Logic Repair:** Nếu `threat(board)`, Quiescence Search phải chuyển sang sinh tất cả nước đi hợp lệ (Evasion) thay vì chỉ ăn quân.
3.  **Tuning:** Loại bỏ các biến cục bộ thừa thãi.

#### 3. STATUS
Hệ thống đang được phẫu thuật để loại bỏ các khối u logic này.
