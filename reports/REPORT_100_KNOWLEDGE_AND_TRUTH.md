
# REPORT_100_KNOWLEDGE_AND_TRUTH
**TIMESTAMP:** 2024-05-29 08:00
**MODE:** ENRICHMENT & PURGE
**AUTHOR:** A.R.E.S (Intelligence Division)

#### 1. OBJECTIVE
*   **Enrichment:** Mở rộng thư viện khai cuộc. AI không thể chỉ biết mỗi "Pháo đầu".
*   **Purge:** Loại bỏ "Logic nói dối" trong hàm đánh giá điểm số.

#### 2. KNOWLEDGE INJECTION (Opening Book)
Đã thêm vào `engine/library.ts`:
1.  **Tiên Nhân Chỉ Lộ (Angel's Guide / Elephant Opening):** Khởi đầu bằng Tốt 3 hoặc Tốt 7. Đây là lối đánh thăm dò, linh hoạt, khắc chế các đối thủ nôn nóng.
2.  **Pháo Quá Cung (Palcorner Cannon):** Pháo chuyển sang lộ 4 hoặc 6. Lối đánh phòng ngự phản công, tích lũy nội lực.

#### 3. THE LYING LOGIC (Logic lừa dối)
*   **Accusation:** Trong `engine/score.ts`, hàm `delta` tự ý cộng `+5` điểm cho Tốt mỗi khi nó di chuyển.
*   **Reality:** Một con Tốt đi ngang lãng xẹt không làm tăng giá trị thế cờ. Việc cộng điểm này khiến AI bị "Hyperactive" (tăng động), thích đi Tốt vô nghĩa thay vì triển khai quân mạnh.
*   **Fix:** Xóa bỏ logic `+5`. Cập nhật `MAP_SOLDIER` để phản ánh đúng giá trị địa lý (qua sông tăng giá trị, áp sát cung tăng cực đại).

#### 4. FUTILITY PRUNING (Cắt tỉa vô vọng)
*   **Logic:** Tại các node lá (depth 1), nếu điểm số tĩnh (Static Eval) cộng với một biên độ an toàn (Margin) vẫn thấp hơn Alpha, thì không cần tìm kiếm chi tiết nữa.
*   **Benefit:** Loại bỏ ~15-20% số node vô nghĩa, giúp AI tìm sâu hơn ở các nhánh quan trọng.

#### 5. STATUS
AI giờ đây uyên bác hơn (nhiều sách vở) và trung thực hơn (đánh giá đúng bản chất).
