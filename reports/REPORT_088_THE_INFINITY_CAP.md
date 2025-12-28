
# REPORT_088_THE_INFINITY_CAP
**TIMESTAMP:** 2024-05-26 23:45
**MODE:** CRITICAL FIX
**AUTHOR:** A.R.E.S (Engine Division)

#### 1. THE PROBLEM
Biến `INF` được đặt là 10,000.
Tổng giá trị quân cờ trên bàn cờ có thể vượt quá 10,000.
Điều này dẫn đến rủi ro "Overflow Logic": AI có thể nhầm lẫn giữa một thế cờ thắng đậm và một thế cờ vô cùng tốt, dẫn đến sai lệch trong cắt tỉa Alpha-Beta.

#### 2. THE FIX
Nâng `INF` lên **30,000**.
Giá trị này vẫn nằm trong giới hạn an toàn của `Int16` (32,767) nhưng đủ lớn để bao phủ mọi tình huống vật chất trên bàn cờ tướng.

#### 3. STATUS
Engine an toàn tuyệt đối về mặt số học.
