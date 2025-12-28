
# REPORT_115_UI_EVOLUTION
**TIMESTAMP:** 2024-05-31 22:00
**MODE:** UX EVOLUTION
**AUTHOR:** A.R.E.S (Frontend Division)

#### 1. OBJECTIVE
"Biến số liệu thành cảm xúc".
Chuyển đổi các dữ liệu kỹ thuật khô khan (Score, Heuristic Params) thành các tín hiệu thị giác dễ hiểu cho người dùng cuối.

#### 2. NEW COMPONENT: THE GAUGE (Thanh Lực Lượng)
*   **Concept:** Một thanh dọc nằm cạnh bàn cờ.
*   **Physics:** Sử dụng hàm Sigmoid để chuyển đổi điểm số (Centipawns) thành tỷ lệ phần trăm (0-100%).
*   **Visual:**
    *   Phần trên: Đỏ (Red Power).
    *   Phần dưới: Đen (Black Power).
    *   Chuyển động: CSS Transition mượt mà (`duration-700`).
*   **UX:** Giúp người chơi nhận biết ngay lập tức ai đang nắm ưu thế mà không cần đọc số.

#### 3. UX UPGRADE: SEMANTIC TUNING
*   **Problem:** Người dùng không biết `Aspiration Window: 15` nghĩa là gì.
*   **Solution:** Thêm nhãn ngữ nghĩa động.
    *   Window nhỏ -> "SHARP" (Sắc bén/Rủi ro).
    *   Window lớn -> "STABLE" (Ổn định).
    *   LMR sâu -> "AGGRESSIVE" (Cắt tỉa mạnh).

#### 4. STATUS
Đang triển khai mã nguồn.
