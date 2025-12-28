
# REPORT_095_LOGIC_TRIBUNAL_INITIATION
**TIMESTAMP:** 2024-05-27 13:00
**MODE:** JUDICIAL EXPANSION
**AUTHOR:** A.R.E.S (Quality Assurance)

#### 1. THE FAILURE (Sự thất bại)
Hệ thống đã để lọt lưới lỗi "Geometric Wrap" vì `tests/suite.ts` cũ chỉ quan tâm đến **Performance** (làm việc nhanh thế nào) mà không quan tâm đến **Correctness** (làm việc đúng hay sai).
Đây là sự kiêu ngạo của kỹ thuật (Engineering Arrogance).

#### 2. THE REMEDY (Biện pháp)
Triển khai **Logic Tribunal** (Tòa Án Luật Pháp).
Đây là một bộ Unit Test chạy ngay khi khởi động, kiểm tra từng quân cờ trong các tình huống khắc nghiệt nhất:
1.  **Boundary Checks:** Quân ở mép bàn cờ (0, 8, 81, 89).
2.  **Obstacle Checks:** Luật cản Mã, cản Tượng.
3.  **Palace Confinement:** Tướng/Sĩ không được rời cung.
4.  **River Crossing:** Tốt/Tượng qua sông.

#### 3. EXECUTION DETAILS
*   **Scenario Injection:** Test suite sẽ tự tạo ra các bàn cờ giả lập (Scenario Boards) thay vì chỉ dùng bàn cờ khởi tạo (`genesis`).
*   **Assertion:** Kiểm tra chính xác số lượng nước đi (`count`) và đích đến (`target`) có khớp với tập hợp mong đợi không.

#### 4. VERDICT
Hệ thống sẽ **HALT** (Dừng hoạt động) nếu bất kỳ quân cờ nào di chuyển sai luật, bất kể tốc độ nhanh đến đâu.
