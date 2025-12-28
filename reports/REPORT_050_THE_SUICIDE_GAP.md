
# REPORT_050_THE_SUICIDE_GAP
**TIMESTAMP:** 2024-05-24 20:00
**MODE:** CRITICAL FIX
**AUTHOR:** A.R.E.S (Red Team Division)

#### 1. THE GAP (Lỗ hổng)
Hệ thống cũ cho phép người chơi thực hiện các nước đi "Tự sát" (di chuyển quân khiến Vua bị chiếu). Điều này vi phạm luật Cờ Tướng cơ bản. Nguyên nhân là `Rules.check` chỉ kiểm tra tính hợp lệ hình học (Pseudo-legal) mà không kiểm tra an toàn Vua.

#### 2. THE FIX (Sửa chữa)
*   **Engine:** Thêm hàm `Query.legal(board, source, target, turn)`. Hàm này thực hiện `commit` nước đi trên một bản sao bàn cờ (Sandbox) và kiểm tra `threat`.
*   **UI:** `Arena.tsx` sử dụng `Query.legal` để xác thực nước đi.

#### 3. UX UPGRADE (Nâng cấp)
*   **Hints:** Khi người chơi chọn một quân cờ, hệ thống sẽ tính toán trước tất cả các nước đi `legal` và hiển thị các chấm xanh (Target) trên bàn cờ.
*   **Benefit:** Giúp người chơi mới dễ dàng nhận biết luật đi và tránh các lỗi ngớ ngẩn.

#### 4. STATUS
Game logic hiện tại đã chặt chẽ và an toàn tuyệt đối (Bulletproof).
