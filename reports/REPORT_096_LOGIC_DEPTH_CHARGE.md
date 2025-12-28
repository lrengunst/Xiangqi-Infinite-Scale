
# REPORT_096_LOGIC_DEPTH_CHARGE
**TIMESTAMP:** 2024-05-27 15:00
**MODE:** PARANOID AUDIT
**AUTHOR:** A.R.E.S (Red Team Division)

#### 1. OBJECTIVE
Kích hoạt "Bom chìm" (Depth Charge) vào các tầng sâu nhất của Logic Engine.
Mục tiêu: Tìm kiếm các lỗi logic liên quan đến trạng thái bàn cờ phức tạp mà các bài test cơ bản không thể phát hiện.

#### 2. ATTACK VECTORS (Các hướng tấn công)

*   **Vector 1: The Flying General Paradox (Nghịch lý Lộ Mặt Tướng)**
    *   *Scenario:* Tướng Đỏ và Tướng Đen nằm trên cùng một cột. Có một quân Pháo Đỏ đứng giữa.
    *   *Action:* Pháo Đỏ di chuyển sang ngang.
    *   *Expectation:* Nước đi phải bị cấm (Illegal) vì để lộ mặt Tướng.
    *   *Risk:* Nếu Engine chỉ kiểm tra nước đi của quân Pháo mà quên kiểm tra "tác dụng phụ" lên Tướng, hệ thống sẽ cho phép nước đi này.

*   **Vector 2: The Absolute Pin (Ghim Quân Tuyệt Đối)**
    *   *Scenario:* Xe Đen đang ngắm Tướng Đỏ. Mã Đỏ đứng chắn đường.
    *   *Action:* Mã Đỏ nhảy đi chỗ khác.
    *   *Expectation:* Cấm. Mã Đỏ bị "ghim" (Pinned).
    *   *Risk:* Generator sinh ra nước đi cho Mã (hợp lệ về hình học), nhưng `Query.legal` phải chặn lại.

*   **Vector 3: The River Boundary (Biên giới Sông)**
    *   *Scenario:* Tốt Đỏ ở hàng 3 (chưa qua sông) và hàng 5 (đã qua sông).
    *   *Action:* Thử đi ngang.
    *   *Expectation:* Hàng 3 cấm đi ngang. Hàng 5 cho phép đi ngang.

#### 3. EXECUTION
Cập nhật `tests/suite.ts` với các kịch bản (Scenario) cụ thể trên.
Hệ thống sẽ **CRASH** ngay lập tức nếu logic ngăn chặn các nước đi này không hoạt động.

#### 4. VERDICT
Không có sự khoan nhượng cho các lỗi logic. Một Game Engine cho phép đi sai luật là một phế phẩm.
