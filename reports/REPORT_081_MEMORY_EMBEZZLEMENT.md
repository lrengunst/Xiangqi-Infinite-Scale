
# REPORT_081_MEMORY_EMBEZZLEMENT
**TIMESTAMP:** 2024-05-26 21:30
**MODE:** RED TEAM ATTACK
**AUTHOR:** A.R.E.S (Red Team Division)

#### 1. THE ACCUSATION (Cáo buộc)
Tôi cáo buộc `engine/query.ts` phạm tội **"Biển thủ bộ nhớ" (Memory Embezzlement)**.
Hàm `legal` và `mate` đã sử dụng `new Int8Array(board)` để tạo bản sao tạm thời (Sandbox) cho việc kiểm tra nước đi.

#### 2. THE DAMAGE (Thiệt hại)
*   Mỗi lần người dùng click chọn quân: 90 lần gọi `legal` -> 90 mảng được tạo -> 8KB rác.
*   Nếu người dùng spam click hoặc có tính năng hover: GC (Garbage Collector) sẽ bị quá tải, gây giật lag giao diện (Jank).
*   Đây là sự vi phạm trực tiếp nguyên tắc "Zero Allocation" đã được quy định trong Hiến pháp A.R.E.S.

#### 3. THE VERDICT (Phán quyết)
**GUILTY.**
Lý do "đảm bảo tính bất biến" (immutability) là ngụy biện trong ngữ cảnh này. Chúng ta đang ở tầng Engine, nơi hiệu năng là tối thượng.

#### 4. THE EXECUTION (Thi hành án)
*   **Mutation Strategy:** Loại bỏ hoàn toàn việc tạo mảng mới.
*   **Protocol:** Sử dụng cặp lệnh `commit` -> `threat` -> `revert` trên chính bàn cờ gốc.
*   **Safety:** Do Javascript chạy đơn luồng (Event Loop), chuỗi thao tác này là nguyên tử (Atomic). Không có frame hình nào được vẽ ra khi bàn cờ đang ở trạng thái "bẩn" (Dirty State).

#### 5. IMPACT
*   **Memory:** 0 bytes allocated per click.
*   **Speed:** Tăng tốc độ phản hồi UI lên đáng kể do loại bỏ chi phí `memcpy` (sao chép bộ nhớ).
