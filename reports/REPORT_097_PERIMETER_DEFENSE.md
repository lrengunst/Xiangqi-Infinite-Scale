
# REPORT_097_PERIMETER_DEFENSE
**TIMESTAMP:** 2024-05-27 16:00
**MODE:** PARANOID DEFENSE
**AUTHOR:** A.R.E.S (Quality Assurance)

#### 1. OBJECTIVE
Mở rộng "Tòa Án Luật Pháp" để bao phủ các biên giới vật lý của bàn cờ.
Ngăn chặn AI thực hiện các hành vi "vượt rào" dù nhỏ nhất.

#### 2. NEW DEFENSE PARAMETERS (Tham số phòng thủ mới)

*   **Parameter 1: The River Barrier (Biên giới Sông)**
    *   *Rule:* Tượng (Elephant) là quân phòng thủ, không bao giờ được phép qua sông.
    *   *Test:* Đặt Tượng Đỏ ở mép sông (Hàng 5). Kiểm tra xem nó có nước đi nào nhảy sang Hàng 4 không.
    *   *Expectation:* 0 nước đi qua sông.

*   **Parameter 2: The Palace Walls (Tường Cung)**
    *   *Rule:* Sĩ (Advisor) là cận vệ, không bao giờ được phép rời cung (Palace).
    *   *Test:* Đặt Sĩ ở góc cung. Kiểm tra xem nó có nhảy ra ngoài không.
    *   *Expectation:* Chỉ di chuyển vào tâm cung.

*   **Parameter 3: The Suicide Prevention (Chống Tự Sát)**
    *   *Rule:* Tướng không được phép di chuyển vào ô bị địch kiểm soát.
    *   *Test:* Tướng Đỏ đứng cạnh Xe Đen. Tướng có được phép đi vào miệng Xe không?
    *   *Expectation:* `Query.legal` = `false`.

#### 3. EXECUTION
Cập nhật `tests/suite.ts` với 3 kịch bản trên.
Hệ thống sẽ từ chối khởi động nếu bất kỳ kịch bản nào thất bại.

#### 4. MESSAGE
"Luật chơi là tuyệt đối. Không có ngoại lệ cho AI."
