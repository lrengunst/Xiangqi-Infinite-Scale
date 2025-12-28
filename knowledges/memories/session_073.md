
# SESSION 073: THE GEOMETRIC WRAP FIX

**Date:** 2024-05-27 12:35
**Event:** Critical Logic Repair

**Incident:**
Phát hiện lỗ hổng nghiêm trọng: Quân Mã và Tượng có thể thực hiện các nước đi "dịch chuyển tức thời" (Teleport) xuyên biên giới bàn cờ do lỗi cuộn mảng 1 chiều (Array Wrapping).

**Correction:**
Đã thêm `HORSE_Y` và `ELEPHANT_Y` vào `consts.ts` để định nghĩa thay đổi hàng hợp lệ.
Cập nhật `generate.ts` để kiểm tra `rank(target)` so với `row + EXPECTED_Y`.

**Impact:**
Loại bỏ hoàn toàn các nước đi phi lý. AI giờ đây tuân thủ tuyệt đối quy tắc hình học Euclide trên lưới 9x10.

**Status:**
Engine Logic: SECURE.
