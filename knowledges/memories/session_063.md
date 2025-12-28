
# SESSION 063: THE ALGORITHMIC DOUBLE TAXATION

**Date:** 2024-05-26 20:35
**Event:** Red Team Attack on Algorithmic Efficiency

**Incident:**
Phát hiện `generate.ts` hoạt động kém hiệu quả do phụ thuộc vào `rules.ts`.
Đây là ví dụ điển hình của việc ưu tiên Clean Code (DRY) hơn Performance trong một hệ thống cần tối ưu hóa cực đoan.

**Correction:**
Đã viết lại `generate.ts` theo phong cách "Dirty but Fast".
- Hardcode logic kiểm tra chân Mã/mắt Tượng.
- Hardcode logic cung Tướng (Palace) bằng mảng `Int8Array`.
- Loại bỏ hoàn toàn việc gọi hàm phụ trợ trong vòng lặp kín.

**Philosophy:**
Trong Engine Core, sự lặp lại code (Code Duplication) là chấp nhận được nếu nó mang lại hiệu suất O(1) thực sự.
