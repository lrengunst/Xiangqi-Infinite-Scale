
# REPORT_094_GEOMETRIC_WRAP_BUG
**TIMESTAMP:** 2024-05-27 12:30
**MODE:** URGENT INVESTIGATION
**AUTHOR:** A.R.E.S (Red Team Division)

#### 1. THE ACCUSATION (Cáo buộc)
Người dùng báo cáo AI thực hiện nước đi sai luật cho quân Tượng (Elephant).
Nghi vấn: AI đang sử dụng một bộ quy tắc ngầm trái với luật Cờ Tướng.

#### 2. THE INVESTIGATION (Điều tra)
Tôi đã mổ xẻ `engine/generate.ts`.
*   **Logic:** `target = index + ELEPHANT[i]`.
*   **Check:** `bound(target)` (Target nằm trong khoảng 0-89).
*   **Flaw (Lỗ hổng):** Mảng 1 chiều không có biên giới trái/phải vật lý. Khi cộng một vector lớn (như bước nhảy của Tượng), vị trí đích có thể "tràn" (wrap) từ cuối hàng này sang đầu hàng kia hoặc nhảy cóc qua nhiều hàng.

**Ví dụ:**
Tượng tại `(0,0)` (Index 0).
Vector Down-Left: `+16` (Giả định 2*Width - 2).
Target: `16`.
Tọa độ Target: Row 1, Col 7.
Quy tắc Tượng: Phải nhảy chéo 2 ô. Từ Row 0 phải xuống Row 2.
Thực tế: Nhảy xuống Row 1.
**Kết luận:** Nước đi này là phi pháp về mặt hình học nhưng hợp lệ về mặt số học trên mảng 1 chiều.

#### 3. THE FIX (Giải pháp)
Thiết lập **Bảng Tra Cứu Delta Y (Delta Y Lookup Tables)**.
*   `ELEPHANT_Y`: Chứa thay đổi hàng kỳ vọng `[-2, -2, 2, 2]`.
*   `HORSE_Y`: Chứa thay đổi hàng kỳ vọng cho Mã.
*   Trong vòng lặp sinh nước đi, kiểm tra nghiêm ngặt:
    ```typescript
    if (rank(target) !== rank(index) + EXPECTED_Y) continue;
    ```
    Điều này đảm bảo mọi nước đi không chỉ nằm trong bàn cờ mà còn phải giữ đúng hình dáng vector.

#### 4. VERDICT
**GUILTY.** Mã nguồn cũ đã hy sinh tính đúng đắn để đổi lấy tốc độ một cách mù quáng. Đã sửa chữa.
