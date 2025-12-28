
# SESSION 017: THE ALLOCATION HUNT

**Date:** 2024-05-21 22:35
**Event:** Garbage Code Removal

**Incident:**
Phát hiện các mảng (Array) được khai báo bên trong vòng lặp sinh nước đi (`generate`) và luật bay (`fly`).

**Resolution:**
Đã di chuyển toàn bộ mảng hằng số ra khỏi scope của hàm.
Sửa logic sinh nước đi cho Pháo (Cannon) bị gộp chung với Xe (Chariot) gây lỗi logic tiềm ẩn.

**Status:**
Engine Core hiện tại tuân thủ tuyệt đối chuẩn "Zero Allocation".
