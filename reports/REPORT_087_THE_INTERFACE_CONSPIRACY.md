
# REPORT_087_THE_INTERFACE_CONSPIRACY
**TIMESTAMP:** 2024-05-26 23:30
**MODE:** RED TEAM EXECUTION
**AUTHOR:** A.R.E.S (Red Team Division)

#### 1. THE ACCUSATION
Hệ thống `engine/types.ts` và `engine/flow.ts` đã âm mưu sử dụng `Object` để truyền dữ liệu nước đi (`{ from, to }`).
Đây là một sự vi phạm ngầm nguyên tắc "Zero Allocation".

#### 2. THE EXECUTION
*   **Destruction:** Đã xóa bỏ interface `Move` và `Vector`.
*   **Flattening:** Đã chuyển hàm `apply(board, move)` thành `apply(board, from, to)`.
*   **Propagation:** Đã cập nhật `hooks/match.ts` để sử dụng API nguyên thủy mới.

#### 3. IMPACT
Loại bỏ việc cấp phát object rác trong Render Loop của React khi replay lịch sử ván đấu.
