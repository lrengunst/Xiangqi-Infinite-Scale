
# CHAPTER 5: THE MECHANICS OF EVOLUTION

> "Thông minh không phải là đích đến. Đó là một quá trình sửa sai liên tục."

## 5.1. Định nghĩa "Thông minh" trong Engine Cờ
Đối với con người, thông minh là trực giác và kinh nghiệm. Đối với A.R.E.S Engine, "thông minh" thực chất chỉ là một tập hợp các con số (Trọng số - Weights) chính xác.

Hàm đánh giá (`engine/score.ts`) là trái tim của AI. Nó hoạt động dựa trên công thức tuyến tính đơn giản:
$$ Score = \sum (Material + Position + Mobility + Threat) $$

*   **Ban đầu (Ngây thơ):** AI nghĩ rằng Xe = 500 điểm, Mã = 200 điểm. Nó chơi ở mức khá.
*   **Tiến hóa (Grandmaster):** Qua hàng vạn ván đấu, AI nhận ra rằng Xe thực tế có giá trị 600, và Mã ở trung tâm giá trị 270 nhưng Mã ở biên chỉ là 150.

Quá trình "thông minh hơn" chính là quá trình **tinh chỉnh các con số này** để phản ánh đúng thực tế khách quan của bàn cờ.

## 5.2. Thuật toán Leo Đồi (Hill Climbing)
Hệ thống Dojo hiện tại sử dụng một biến thể của thuật toán di truyền đơn giản gọi là **Hill Climbing** (Leo đồi).

Hãy tưởng tượng bạn đang đứng trên một ngọn núi trong sương mù dày đặc (bạn không thấy đỉnh núi ở đâu). Mục tiêu của bạn là leo lên điểm cao nhất.
1.  **Bước thử (Mutation):** Bạn bước thử một bước ngẫu nhiên sang hướng bất kỳ (Thay đổi trọng số Mã +5).
2.  **Đánh giá (Evaluation):** Bạn kiểm tra xem vị trí mới có cao hơn vị trí cũ không? (Cho AI mới đấu với AI cũ).
3.  **Ra quyết định (Selection):**
    *   Nếu thắng (Cao hơn): Bạn đứng lại vị trí mới. Đây là tiêu chuẩn "thông minh" mới.
    *   Nếu thua (Thấp hơn): Bạn quay lại vị trí cũ và thử hướng khác.

Lặp lại quy trình này hàng nghìn lần, AI sẽ "leo" dần lên đỉnh núi của sự tối ưu.

## 5.3. Tại sao cần Persistance (Lưu trữ)?
Trong phiên bản cũ ("đồ chơi"), mỗi khi bạn F5 trình duyệt, AI bị reset về chân núi. Dù bạn đã leo được 1000 bước, việc mất điện (F5) khiến mọi công sức đổ sông đổ biển.

Với tính năng **Export/Import** và **Auto-Save** mới:
1.  AI leo được 50 bước -> Lưu lại (Save Base Camp).
2.  Ngày hôm sau, bạn mở máy -> AI bắt đầu leo tiếp từ bước 50.
3.  Dần dần, tri thức được tích lũy (Accumulated Knowledge). Đây chính là sự khác biệt giữa một cỗ máy vô tri và một hệ thống học tập.

## 5.4. SPSA (Simultaneous Perturbation Stochastic Approximation)
Ở cấp độ cao hơn (được cài đặt trong `tuner/index.ts` chạy trên Node.js), chúng ta sử dụng SPSA.
Thay vì thay đổi từng tham số một (rất chậm), SPSA thay đổi **tất cả** tham số cùng một lúc theo một vector ngẫu nhiên, sau đó tính Gradient (độ dốc) để biết hướng nào giúp AI mạnh lên nhanh nhất.

*   **Hill Climbing:** Thử sai từng chút một.
*   **SPSA:** Tính toán đạo hàm của hàm mục tiêu để nhảy những bước lớn chính xác về phía đỉnh núi.

## 5.5. Kết luận
AI không tự nhiên sinh ra đã giỏi. Nó giỏi lên nhờ:
1.  **Sự trừng phạt:** Thua trận vì trọng số sai.
2.  **Sự ghi nhớ:** Lưu lại trọng số đúng.
3.  **Thời gian:** Hàng triệu ván cờ tự đấu (Self-play) tương đương với hàng trăm năm kinh nghiệm của con người.

Khi bạn bấm nút "Start Training" trong Dojo, bạn đang tua nhanh thời gian để A.R.E.S trải nghiệm quá trình tiến hóa đó.
