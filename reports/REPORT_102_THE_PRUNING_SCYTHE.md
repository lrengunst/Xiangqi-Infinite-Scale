
# REPORT_102_THE_PRUNING_SCYTHE
**TIMESTAMP:** 2024-05-30 14:00
**MODE:** SEARCH ALGORITHM UPGRADE
**AUTHOR:** A.R.E.S (Core Engineer)

#### 1. OBJECTIVE
Nâng cao sức mạnh tính toán của AI thông qua việc "làm ít hơn nhưng hiệu quả hơn".
Tập trung vào việc loại bỏ các nhánh cây tìm kiếm vô nghĩa (Pruning) và ưu tiên các nhánh tiềm năng (Ordering).

#### 2. IMPLEMENTATION

**A. History Heuristic (`engine/history.ts`)**
*   Tạo một bảng 3 chiều (giả lập trên mảng phẳng): `[Side][From][To]`.
*   Khi một nước đi gây ra `Beta Cutoff` (Nước đi quá tốt khiến đối thủ phải rẽ nhánh), ta cộng điểm thưởng vào bảng Lịch sử.
*   Điểm số này được dùng để sắp xếp nước đi ở các node tiếp theo.

**B. Null Move Pruning (NMP)**
*   Trong `negamax`, trước khi sinh nước đi, AI thử một "Nước đi rỗng" (nhường lượt cho đối thủ).
*   Thực hiện tìm kiếm với độ sâu giảm (`depth - R - 1`).
*   Nếu kết quả trả về vẫn lớn hơn Beta => Cắt tỉa ngay lập tức.
*   *Lưu ý:* Không áp dụng NMP khi đang bị chiếu (In Check) hoặc ở tàn cuộc (Endgame) để tránh lỗi Zugzwang.

**C. Sorting (Sắp xếp nước đi)**
*   Thay vì duyệt tuần tự, ta chấm điểm nước đi:
    1.  **TT Move:** 2,000,000 điểm (Ưu tiên số 1).
    2.  **Captures:** 1,000,000 + Giá trị quân bị ăn (MVV/LVA).
    3.  **Killers:** (Chưa cài đặt, dành cho Phase sau).
    4.  **History:** Giá trị từ bảng History.
*   Sử dụng Insertion Sort hoặc Selection Sort cục bộ trên Buffer để đảm bảo nước đi tốt nhất được duyệt sớm nhất -> Tối đa hóa Alpha-Beta Cutoff.

#### 3. EXPECTED IMPACT
*   **Depth:** AI sẽ đạt độ sâu lớn hơn (ví dụ: Depth 8 thay vì Depth 6) trong cùng một khoảng thời gian.
*   **Tactical:** AI sẽ ít bỏ sót các nước ăn quân quan trọng nhờ sắp xếp Capture lên đầu.

#### 4. STATUS
Deploying algorithms...
