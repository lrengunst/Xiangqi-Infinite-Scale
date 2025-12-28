
# SESSION 064: THE MEMORY EMBEZZLEMENT

**Date:** 2024-05-26 21:35
**Event:** Red Team Attack on Memory Allocation

**Incident:**
Phát hiện hàm `legal` (xác thực nước đi) lén lút cấp phát bộ nhớ.
Đây là một "Món nợ kỹ thuật" nguy hiểm vì nó nằm ngay tại lớp tương tác người dùng (UI Interaction Layer).

**Correction:**
Đã viết lại `query.ts` sử dụng mô hình **Do-Undo (Mutation)** thay vì **Clone-Check**.
Bây giờ, việc kiểm tra luật chơi hoàn toàn miễn phí về mặt bộ nhớ (Heap).

**Philosophy:**
"Đừng sợ làm bẩn dữ liệu, miễn là bạn biết cách dọn dẹp nó trước khi ai đó nhìn thấy."
