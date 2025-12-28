
# SESSION 062: THE DATA STRUCTURE FRAUD

**Date:** 2024-05-26 19:35
**Event:** Red Team Attack on Data Structures

**Incident:**
Phát hiện việc sử dụng Javascript Object `{}` và Array `[]` cho các dữ liệu tĩnh quan trọng (`MATERIAL`, `VECTORS`).
Đây là một sự vi phạm ngầm đối với nguyên tắc Data-Oriented Design.

**Correction:**
Đã thay thế toàn bộ bằng `Int16Array` và `Int8Array`.
Đã viết lại các vòng lặp để tránh Iterator overhead.

**Impact:**
Tăng tốc độ truy xuất dữ liệu trong các vòng lặp kín (Move Gen & Eval).
Đảm bảo sự trung thực tuyệt đối với tuyên bố "Low Level Optimization".
