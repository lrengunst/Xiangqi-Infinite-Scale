
# REPORT_083_DETERMINISTIC_CHAOS
**TIMESTAMP:** 2024-05-26 22:15
**MODE:** ARCHITECTURAL FIX
**AUTHOR:** A.R.E.S (Network Division)

#### 1. THE PROBLEM
Hệ thống sử dụng `Math.random()` để khởi tạo Zobrist Keys.
Điều này dẫn đến việc mỗi Client có một bộ Hash khác nhau cho cùng một thế cờ.

#### 2. THE RISK
Trong môi trường P2P, nếu ta muốn xác thực trạng thái (ví dụ: phát hiện lặp lại 3 lần) bằng cách gửi Hash qua mạng, hệ thống sẽ sụp đổ vì Hash không khớp.

#### 3. THE FIX
Triển khai bộ sinh số ngẫu nhiên **Mulberry32** với hạt giống cố định (`0xDEADBEEF`).
Đảm bảo mọi máy, mọi trình duyệt, mọi thời điểm đều sinh ra cùng một bộ `KEYS`.

#### 4. STATUS
Vũ trụ A.R.E.S giờ đây là tất định (Deterministic).
