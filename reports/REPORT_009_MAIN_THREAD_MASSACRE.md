
# REPORT_009_MAIN_THREAD_MASSACRE
**TIMESTAMP:** 2024-05-21 16:00
**MODE:** TOTAL ASSAULT (Concurrency)
**AUTHOR:** A.R.E.S (Red Team Division)

#### 1. OBJECTIVE
Tiêu diệt kiến trúc đơn luồng (Single-Threaded) hiện tại đang giết chết trải nghiệm người dùng.

#### 2. VIOLATION EVIDENCE (Bằng chứng vi phạm)

**TARGET:** `components/Arena.tsx`
```typescript
setTimeout(() => {
    const bestMove = Search.search(board, Types.Side.Black);
    // ...
}, 100);
```

**ANALYSIS (Phân tích tội lỗi):**
1.  **The Event Loop Blockade:** `setTimeout` chỉ dời thời điểm bắt đầu tử hình (execution start). Khi `Search.search` chạy, nó chiếm quyền điều khiển CPU trong 200ms-500ms (tùy Depth).
2.  **UI Freeze:** Trong khoảng thời gian này, Browser không thể repaint. FPS tụt xuống 0. Animation `thinking` bị đông cứng.
3.  **Input Denial:** Nếu người dùng cố bấm "Undo" trong lúc AI đang nghĩ, sự kiện bị queued lại và chỉ chạy SAU khi AI đã đi xong. Trải nghiệm cực tệ.

#### 3. THE ARCHITECTURAL VERDICT (Phán quyết)
Kiến trúc hiện tại là **RÁC THẢI (GARBAGE)**. Nó không thể tồn tại trong một game Real-time hoặc P2P System.
Nếu một gói tin mạng đến trong lúc AI đang nghĩ, kết nối sẽ bị timeout.

#### 4. MANDATORY REFACTOR (Yêu cầu sửa đổi bắt buộc)
1.  **Worker Isolation:** Tạo `worker/` directory. Di chuyển toàn bộ `engine/search` vào Worker.
2.  **Asynchronous Protocol:** Định nghĩa giao thức `Thinking` -> `Moved` qua `postMessage`.
3.  **Serialization:** Sử dụng `SharedArrayBuffer` hoặc `Transferable Objects` để truyền dữ liệu bàn cờ, tránh copy O(N).

#### 5. NEXT ACTION
Thực thi mã nguồn Worker ngay lập tức.
