
# REPORT_116_SENSORY_TUNING
**TIMESTAMP:** 2024-05-31 23:00
**MODE:** UX EXPANSION
**AUTHOR:** A.R.E.S (Experience Division)

#### 1. OBJECTIVE
Chuyển đổi các hệ thống "Tĩnh" (Static Systems) thành "Động" (Dynamic Systems) có thể cấu hình.
Tập trung vào Âm thanh và Chuyển động.

#### 2. AUDIO ARCHITECTURE UPGRADE
*   **Current:** `muted` (boolean).
*   **New:** `master` (gain node value 0.0 - 1.0).
*   **Implementation:** Cập nhật `design/sound.ts`. Thêm Node `Gain` tổng (Master Volume) trước khi ra `destination`.

#### 3. MOTION ARCHITECTURE UPGRADE
*   **Current:** Tailwind Classes `duration-150`, `duration-300`, `duration-700`.
*   **New:** CSS Variable `--anim-pace`.
*   **Implementation:**
    *   Cập nhật `design/theme.ts` để inject biến `--anim-pace`.
    *   Refactor `Unit.tsx`, `Gauge.tsx`, `Slot.tsx` để sử dụng biến này trong `style.transitionDuration`.

#### 4. SETTINGS UI
*   Thêm Slider **VOLUME** và **PACE**.
*   Sử dụng nhãn ngữ nghĩa (Semantic Labels):
    *   Pace: `BLITZ` (Fast) <-> `ZEN` (Slow).

#### 5. STATUS
**EXECUTING...**
