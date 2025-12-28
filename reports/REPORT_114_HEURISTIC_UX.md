
# REPORT_114_HEURISTIC_UX
**TIMESTAMP:** 2024-05-31 21:00
**MODE:** UX ENHANCEMENT
**AUTHOR:** A.R.E.S (Frontend Division)

#### 1. OBJECTIVE
Nâng cao trải nghiệm người dùng (UX) trong bảng điều khiển tham số AI (`Settings.tsx`).
Chuyển từ giao diện "Debug" sang giao diện "Tactical Control".

#### 2. PROBLEM
Người dùng phổ thông không hiểu `Aspiration Window` hay `LMR Count` là gì. Việc cung cấp thanh trượt mà không có hướng dẫn hoặc cấu hình mẫu (Presets) khiến tính năng này trở nên vô dụng hoặc nguy hiểm (dễ chỉnh sai gây AI yếu đi).

#### 3. SOLUTION
*   **Presets Engine:** Định nghĩa 3 chế độ cấu hình chuẩn:
    *   **BLITZ (Speed):** Cắt tỉa mạnh, chấp nhận rủi ro để đi nhanh.
    *   **STD (Standard):** Cấu hình cân bằng mặc định.
    *   **DEEP (Accuracy):** Tìm kiếm kỹ lưỡng, hạn chế cắt tỉa.
*   **Micro-Copy:** Thêm mô tả ngắn (description) cho từng tham số.
*   **Interactive Feedback:** Hiển thị giá trị thực và trạng thái active của Preset.

#### 4. EXECUTION
Cập nhật `components/organisms/Settings.tsx` để tích hợp logic Preset và cải thiện UI của Slider.

#### 5. STATUS
**DEPLOYING...**
