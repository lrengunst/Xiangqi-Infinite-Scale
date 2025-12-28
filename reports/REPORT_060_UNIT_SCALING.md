
# REPORT_060_UNIT_SCALING
**TIMESTAMP:** 2024-05-25 17:00
**MODE:** VISUAL REPAIR
**AUTHOR:** A.R.E.S (Frontend Division)

#### 1. INCIDENT
Visual Audit phát hiện tên quân cờ (Chinese Characters) không co giãn (responsive) tương ứng với kích thước quân cờ.
Nguyên nhân: Sử dụng `text-3xl` (Fixed rem/px size) trong một container có kích thước % (`w-full`).

#### 2. SOLUTION
Chuyển đổi cơ chế render nội dung của `Unit` từ HTML Text sang **SVG Text**.
*   **Vector Scaling:** Sử dụng `viewBox="0 0 100 100"` và `fontSize="55"`.
*   **Responsive:** SVG tự động scale theo kích thước container cha (`div` quân cờ), đảm bảo tỷ lệ Text/Circle luôn hằng số (khoảng 55%).
*   **Alignment:** Sử dụng `dominantBaseline="middle"` và `textAnchor="middle"` để căn giữa chính xác tuyệt đối.

#### 3. STATUS
Giao diện quân cờ giờ đây hiển thị sắc nét và cân đối trên mọi kích thước màn hình (từ Mobile nhỏ đến Desktop 4K).
