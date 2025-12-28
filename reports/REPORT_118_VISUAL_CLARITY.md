
# REPORT_118_VISUAL_CLARITY
**TIMESTAMP:** 2024-06-01 10:00
**MODE:** UX EXPANSION
**AUTHOR:** A.R.E.S (Experience Division)

#### 1. OBJECTIVE
Tăng cường khả năng kiểm soát hiển thị cho người dùng, đặc biệt là thông tin định vị và hiệu năng đồ họa.

#### 2. NEW SETTINGS
*   **COORDINATES (Tọa độ):** Hiển thị số hàng (0-9) và cột (0-8) trên bàn cờ.
    *   *Mục đích:* Giúp người chơi dễ dàng đối chiếu với Log (ví dụ: `(4,5) > (4,4)`).
    *   *Style:* Font Mono, kích thước nhỏ, nằm ở viền bàn cờ.
*   **VISUAL_FX (Hiệu ứng):** Chế độ "Low Spec" vs "High Spec".
    *   *ON:* Hiển thị đầy đủ Scanner, Glow, Particles.
    *   *OFF:* Tắt các hiệu ứng nặng GPU, chỉ giữ lại chuyển động cơ bản. Dành cho thiết bị yếu.

#### 3. IMPLEMENTATION
*   **Grid Atom:** Nâng cấp để nhận prop `coords`. Render SVG Text labels.
*   **Arena Organism:** Nhận prop `fx`. Điều khiển việc render `Scanner` và độ phức tạp của `Trace`.
*   **State Elevation:** `App.tsx` quản lý state `coords` và `fx`.

#### 4. STATUS
**EXECUTING...**
