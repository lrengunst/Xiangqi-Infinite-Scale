
# REPORT_109_DOJO_RIGOR
**TIMESTAMP:** 2024-05-31 12:00
**MODE:** QUALITY ASSURANCE
**AUTHOR:** A.R.E.S (High Command)

#### 1. THE CONCERN (Mối quan ngại)
Người dùng báo cáo tốc độ mô phỏng trong Dojo quá nhanh, dấy lên nghi ngờ về chất lượng logic (Logic Integrity) của các ván đấu tập luyện.
Nghi vấn: "Garbage In, Garbage Out". Nếu AI đánh bậy bạ cho xong ván, bộ trọng số (Genome) sinh ra sẽ bị lệch lạc.

#### 2. DIAGNOSIS (Chẩn đoán)
*   **Depth 4:** Quá nông cho việc training nghiêm túc. Tại Depth 4, AI dễ bị dính các bẫy chiến thuật (Tactical Blunders) dẫn đến Checkmate sớm.
*   **Silent Crashes:** Nếu `Search` gặp lỗi, `Simulator` hiện tại trả về 'DRAW' ngay lập tức. Điều này có thể tạo ra ảo giác là ván đấu đã xong.
*   **Chaos Validity:** Cần đảm bảo các nước đi ngẫu nhiên đầu trận tuyệt đối tuân thủ luật `Query.legal`.

#### 3. THE REMEDY (Biện pháp)
1.  **Increase Difficulty:** Nâng độ sâu tìm kiếm (Depth) trong `tuner.ts` từ **4** lên **6**.
    *   *Hệ quả:* Tốc độ sẽ chậm đi khoảng 4-5 lần, nhưng chất lượng nước đi sẽ tiệm cận Grandmaster.
2.  **Strict Simulator:** Viết lại `simulator.ts` để:
    *   Bắt lỗi ngoại lệ (Exception) rõ ràng thay vì nuốt lỗi.
    *   Đảm bảo `Search` không bao giờ trả về `null` vô cớ.
3.  **Evolution Validation:** Chỉ chấp nhận kết quả nếu ván cờ kéo dài trên 10 nước (tránh trường hợp Crash Loop).

#### 4. STATUS
Đang triển khai bản vá nâng cao chất lượng giáo dục cho AI.
