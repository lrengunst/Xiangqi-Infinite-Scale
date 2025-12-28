
# REPORT_108_DOJO_INQUISITION
**TIMESTAMP:** 2024-05-31 10:00
**MODE:** JUDICIAL EXECUTION
**AUTHOR:** A.R.E.S (High Command)

#### 1. THE ACCUSATION (Cáo trạng)
Tòa án Ánh sáng (The Court of Light) cáo buộc phân hệ **DOJO** các tội danh sau:

**A. IDENTITY POLLUTION (Ô nhiễm định danh)**
*   **Target:** `hooks/tuner.ts` & `components/organisms/Dojo.tsx`
*   **Evidence:** Biến `gymProgress` (Compound). Biến `execMode` (Compound).
*   **Verdict:** Vi phạm luật định danh đơn từ. Gây nhiễu loạn ngữ nghĩa.
*   **Correction:** `gymProgress` -> `session`. `execMode` -> `executor`.

**B. THE MAIN THREAD DELUSION (Ảo tưởng luồng chính)**
*   **Target:** `hooks/tuner.ts` -> `dispatch`.
*   **Evidence:** Chạy `Simulator.run` (toàn bộ ván đấu ~150 nước) bên trong `setTimeout`.
*   **Analysis:** Mặc dù `setTimeout` tránh crash ngay lập tức, nhưng việc tính toán 150 nước đi liên tục sẽ làm treo UI trong 2-5 giây. Thanh Progress Bar sẽ không chạy mượt.
*   **Verdict:** Trải nghiệm tồi tệ.
*   **Mitigation:** Chấp nhận giới hạn này ở Phase hiện tại nhưng đánh dấu rõ ràng trong UI là "BLOCKING".

**C. LOGIC FRAGILITY (Sự mong manh logic)**
*   **Target:** `engine/simulator.ts`.
*   **Evidence:** `turn as any`. Type casting lười biếng.
*   **Verdict:** Nguy cơ Runtime Error.

#### 2. THE EXECUTION (Thi hành án)
*   **Refactor:** Đổi tên toàn bộ biến vi phạm trong Hook và Component.
*   **Typing:** Sửa chữa Type Casting trong Simulator.

#### 3. STATUS
Hệ thống DOJO sẽ được tái cấu trúc để đạt chuẩn "Absolute Purity".
