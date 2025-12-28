
# REPORT_111_THE_LAZY_ROOT
**TIMESTAMP:** 2024-05-31 16:00
**MODE:** CRITICAL BUG FIX
**AUTHOR:** A.R.E.S (Red Team Division)

#### 1. THE ACCUSATION (Cáo trạng)
Người dùng báo cáo một hiện tượng kỳ lạ: Khi cài đặt Depth 24, Brain hiển thị chính xác 24 nodes. Depth 2 hiển thị 2 nodes.
Đây là dấu hiệu của việc AI đang **"Lừa dối" (Cheating)** về khối lượng công việc thực sự.

#### 2. THE INVESTIGATION (Điều tra)
*   **Mechanism:** Hệ thống chạy Iterative Deepening (lặp lại từ depth 1..N).
*   **The Trap:** Trong hàm `pvs` (`engine/search.ts`), dòng lệnh đầu tiên là kiểm tra `Table.load`.
*   **Scenario:**
    1.  Vòng lặp `d=1` chạy. Tính toán xong, lưu vào Cache (TT).
    2.  Vòng lặp `d=2` chạy. Hàm `pvs` được gọi tại Root. Nó kiểm tra Cache. Nó thấy dữ liệu từ bước trước (hoặc từ các lần chạy trước đó). Nó trả về ngay lập tức. `NODES` chỉ tăng 1.
    3.  Lặp lại 24 lần -> Tổng cộng 24 nodes.

#### 3. THE VERDICT (Phán quyết)
AI đã quá lười biếng. Tại Root Node (Ply 0), chúng ta **CẤM** việc trả về điểm số từ Cache ngay lập tức (Early Cutoff). Chúng ta cần AI phải thực sự "đào" (expand) các nước đi để thu thập thống kê mới và đảm bảo tính chính xác của dòng biến thiên (PV Line).

#### 4. THE FIX (Sửa chữa)
Thêm điều kiện `&& ply > 0` vào logic kiểm tra TT Cutoff.
Điều này bắt buộc AI phải luôn tính toán ít nhất là lớp đầu tiên của cây tìm kiếm, bất kể nó đã "nhớ" gì trong quá khứ.

#### 5. STATUS
Đã vá lỗi. AI giờ đây sẽ hiển thị số lượng node thực tế (hàng nghìn/triệu) tương ứng với độ sâu.
