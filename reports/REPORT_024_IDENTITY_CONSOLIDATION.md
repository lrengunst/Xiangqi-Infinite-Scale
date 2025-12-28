# REPORT_024_IDENTITY_CONSOLIDATION
**TIMESTAMP:** 2024-05-22 09:00
**MODE:** WAR PROTOCOL (Identity Purge)
**AUTHOR:** A.R.E.S

#### 1. WHAT (Cái gì)
Thanh trừng toàn bộ các định danh vi phạm luật đơn từ và các biến lười biếng (`ptr`, `idx`, `absDx`, `absDy`, `d`, `i`, `isRed`) trong toàn bộ Engine và Components.

#### 2. HOW (Như thế nào)
*   **Renaming:** 
    *   `ptr` -> `pointer`.
    *   `idx` -> `index`.
    *   `d` -> `delta`.
    *   `cap` -> `captured`.
    *   `absDx` -> `span`.
    *   `absDy` -> `rise`.
    *   `piece` (victim) -> `victim`.
    *   `isRed` -> `red`.
*   **Rules Refactor:** Sử dụng `horizontal`, `vertical`, `span`, `rise` để mô tả quan hệ tọa độ một cách trọn vẹn.
*   **Math Cleanup:** Thay các biến tọa độ ghép bằng các ký tự toán học chuẩn (`x`, `y`, `u`, `v`) hoặc các từ đơn trọn vẹn (`column`, `row`).

#### 3. FAILURE (Thất bại)
Code cũ chứa quá nhiều các biến viết tắt mang tính cá nhân (Personal abbreviations). Điều này làm suy yếu tính chuyên nghiệp của Toolkit và gây nhầm lẫn khi mở rộng hệ thống P2P.

#### 4. LESSON (Bài học)
"Trong một Framework thực sự, không có chỗ cho sự lười biếng của người viết. Mỗi định danh là một tuyên ngôn về sự rõ ràng."
