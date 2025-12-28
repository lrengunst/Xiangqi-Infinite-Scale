
# REPORT_085_THE_CONDITIONAL_SCAM
**TIMESTAMP:** 2024-05-26 22:30
**MODE:** RED TEAM EXECUTION
**AUTHOR:** A.R.E.S (Red Team Division)

#### 1. THE ACCUSATION
`engine/score.ts` đã sử dụng câu lệnh điều kiện (`if y < 5`) bên trong vòng lặp đánh giá điểm số.
Đây là một sự lãng phí tài nguyên CPU. Vị trí quân cờ là dữ liệu tĩnh, không phải logic động.

#### 2. THE EXECUTION
Đã thay thế toàn bộ logic đánh giá bằng **Piece-Square Tables (PST)**.
*   **Structure:** Một mảng `Int16Array` phẳng chứa 1440 giá trị (2 Phe * 8 Loại quân * 90 Ô).
*   **Pre-computation:** Logic `if` được đẩy vào hàm khởi tạo tự chạy (IIFE) khi module load.
*   **Runtime:** Truy xuất điểm số giờ chỉ là `PST[offset]`.

#### 3. IMPACT
*   Loại bỏ hoàn toàn Branch Misprediction trong hàm `measure`.
*   Code trở nên "Data-Oriented" đúng nghĩa.

#### 4. STATUS
**CLEAN.**
