# THE LAW (Cương Lĩnh Kỹ Thuật)

## 1. O(1) ABSOLUTE
*   Mọi tác vụ truy xuất dữ liệu trong vòng lặp game phải có độ phức tạp hằng số.
*   Cấm `new`, `map`, `filter` trong Hot Path.
*   Mọi tuyên bố hiệu năng phải được chứng minh bằng Tòa Án Hiệu Năng (Tribunal).

## 2. IDENTITY PURITY
*   **Module/Var/Func:** `lowercase` đơn từ trọn vẹn (vd: `search`, `engine`).
*   **Type/Class:** `PascalCase` đơn từ (vd: `Board`, `Piece`).
*   **Interface:** `PascalCase` + `able` (vd: `Mutable`).
*   **CẤM TUYỆT ĐỐI:** Viết tắt (`gen`, `idx`, `ptr`), Từ ghép (`getMoves`, `isRed`), Biến lười biếng (`i`, `j`, `tmp`).

## 3. TIERED STORAGE
*   **Active (Hot):** Context, Todo. Thay đổi liên tục.
*   **Stable (Warm):** Law, Lexicon, Schema. Ít thay đổi.
*   **Archive (Cold):** History, Reports. Chỉ đọc.

## 4. CONCURRENCY
*   **UI Thread:** Chỉ Render và Input.
*   **Worker Thread:** Chỉ Logic và AI.
*   **Communication:** Message Passing qua Giao thức nghiêm ngặt.
