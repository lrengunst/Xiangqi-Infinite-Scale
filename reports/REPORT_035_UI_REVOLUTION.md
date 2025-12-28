
# REPORT_035_UI_REVOLUTION
**TIMESTAMP:** 2024-05-23 16:00
**MODE:** ATOMIC REVOLUTION
**AUTHOR:** A.R.E.S (Frontend Division)

#### 1. WHAT (Cái gì)
Thực thi cuộc cách mạng giao diện Atomic Design.
Quét sạch toàn bộ mã màu hardcode (`#b91c1c`...) và thay thế bằng Token System.
Tái cấu trúc (Refactor) các component khổng lồ thành Atoms/Molecules/Organisms.

#### 2. HOW (Như thế nào)
*   **Token System:** Tạo `design/tokens.ts` chứa định nghĩa `Palette`, `Spacing`, `Typography`.
*   **Atomic Migration:**
    *   `GridLines` -> `GridOverlay` (Atom).
    *   `Unit` (Atom): Sử dụng Style Object tham chiếu Token để render màu sắc động.
    *   `Slot` (Molecule): Kết hợp `Unit` và logic định vị (Grid Positioning).
    *   `Arena` (Organism): Quản lý State và Event.
*   **Performance:**
    *   Sử dụng `React.memo` cho Atom và Molecule để chặn re-render thừa.
    *   Tính toán tọa độ bằng toán tử O(1) trong `Slot`.

#### 3. FAILURE (Thất bại cũ)
Code cũ sử dụng giá trị màu sắc rải rác. Nếu muốn đổi theme sang "Dark Mode", ta phải tìm và sửa hàng chục file. Với Token System, ta chỉ cần sửa 1 file.

#### 4. LESSON (Bài học)
"Visual cũng là Data." Màu sắc, khoảng cách cũng cần được quản lý chặt chẽ như logic game.
