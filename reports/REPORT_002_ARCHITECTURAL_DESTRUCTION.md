# REPORT_002_ARCHITECTURAL_DESTRUCTION
**TIMESTAMP:** 2024-05-21 11:30
**MODE:** Deep Red Team Attack
**AUTHOR:** A.R.E.S (Red Team Division)

#### 1. OBJECTIVE
Tấn công toàn diện vào các giả định "Hiệu suất cao" của mã nguồn hiện tại. Chứng minh rằng `domain/gen.ts`, `domain/core.ts` và `components/Arena.tsx` đang vi phạm nghiêm trọng quy tắc O(1) và sẽ sụp đổ khi tải cao.

#### 2. RED TEAM ATTACK LOG (Nhật ký Tấn công)

### VECTOR 1: Ảo tưởng về Mảng Động (The Dynamic Array Delusion)
*   **Target:** `domain/gen.ts` -> `generateMoves`
*   **Evidence:**
    ```typescript
    const moves: number[] = [];
    // ...
    moves.push((i << 8) | forward);
    ```
*   **Attack:** 
    *   Trong V8 Engine (Javascript), `moves.push()` không phải là O(1). Khi mảng vượt quá dung lượng cấp phát sẵn (capacity), Engine phải: (1) Cấp phát vùng nhớ mới lớn gấp đôi, (2) Copy toàn bộ dữ liệu cũ sang, (3) GC dọn dẹp vùng nhớ cũ.
    *   Tại độ sâu (depth) 4 của thuật toán Minimax, hàm này được gọi khoảng ~100,000 lần. Việc resize mảng liên tục sẽ gây ra **GC Thrashing**.
*   **Verdict (Kết luận):** **NGÂY THƠ**.
*   **Fix:** Sử dụng `Int32Array` đệm tĩnh (Static Buffer) được cấp phát 1 lần duy nhất (Pool) và truyền con trỏ `index`.

### VECTOR 2: Cái chết của Bộ nhớ Heap (The Heap Death)
*   **Target:** `domain/core.ts` -> `execute`
*   **Evidence:**
    ```typescript
    export const execute = (grid: Grid, step: Step): Grid => {
      const next = new Int8Array(grid); // <--- TỬ HUYỆT
      // ...
      return next;
    };
    ```
*   **Attack:**
    *   Hàm `isCheckmate` trong `domain/query.ts` gọi `generateMoves`, sau đó lặp qua từng move và gọi `execute`.
    *   Nếu có 40 nước đi hợp lệ, nó tạo ra 40 bản sao `Int8Array` mới CHỈ ĐỂ kiểm tra xem vua có bị chiếu không.
    *   Điều này vi phạm nguyên tắc **"Zero Allocation in Hot Path"**. Bộ nhớ Heap sẽ bị phân mảnh cực nhanh.
*   **Verdict (Kết luận):** **TỒI TỆ**.
*   **Fix:** Sử dụng kỹ thuật `mutate` (thay đổi trực tiếp) kết hợp với `undo` stack. Không bao giờ clone bàn cờ trong logic kiểm tra.

### VECTOR 3: Sự dối trá của React State (The React State Lie)
*   **Target:** `components/Arena.tsx`
*   **Evidence:**
    ```typescript
    useEffect(() => {
        if (turn === Side.Black) {
            setTimeout(() => { ... }, 100);
        }
    }, [grid, turn, gameOver]);
    ```
*   **Attack:**
    *   Sử dụng `useEffect` để điều khiển Game Loop là một sai lầm kiến trúc. React Render Cycle không đồng bộ với Game Logic Tick.
    *   `setTimeout` chỉ hoãn việc "treo" trình duyệt, nó không giải quyết việc tính toán nặng làm block Main Thread. Khi AI bắt đầu chạy, UI sẽ không thể phản hồi sự kiện click "Stop" hay "Undo" của người dùng.
*   **Verdict (Kết luận):** **KHÔNG THỂ MỞ RỘNG**.
*   **Fix:** Chuyển toàn bộ Game Loop sang `WebWorker`. React chỉ đóng vai trò là View layer thụ động, nhận trạng thái từ Worker thông qua `postMessage`.

#### 3. NEXT TRIGGER (Kích hoạt tiếp theo)
*   Bắt đầu Refactor theo thứ tự ưu tiên:
    1.  Tạo `knowledges/architectures/naming.md` để chốt quy tắc đặt tên.
    2.  Tạo `kernel/memory.ts` để quản lý bộ nhớ tĩnh (Static Memory Pool).
    3.  Viết lại `domain/gen.ts` tuân thủ quy tắc "Zero Allocation".