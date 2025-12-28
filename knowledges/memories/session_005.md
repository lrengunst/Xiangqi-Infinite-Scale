
# SESSION 005: THE INCREMENTAL VELOCITY

**Date:** 2024-05-21 14:00
**Event:** Logic Optimization (O(1))

**Achievement:**
Đã hiện thực hóa thành công cơ chế **Incremental Scoring** (Cập nhật điểm số gia tăng) cho Engine.
Thay vì quét toàn bộ bàn cờ (O(N)) tại mỗi nút lá của cây tìm kiếm, hệ thống giờ đây chỉ tính toán Delta (O(1)) dựa trên quân cờ di chuyển và quân bị ăn.

**Technical Details:**
1.  **`engine/score.ts`**: Tách logic thành `measure` (nguyên tử) và `delta` (gia tăng). Hàm `initial` chỉ chạy 1 lần duy nhất ở Root.
2.  **`engine/search.ts`**: Truyền `currentScore` xuống đệ quy. Tốc độ đánh giá nút lá giảm từ ~90 ops xuống ~3 ops (2 lookups + 1 math).

**Next Step:**
Tập trung vào **Memory Stabilization**. Vấn đề cấp phát mảng động `moves.push()` trong `generate.ts` vẫn là một điểm nghẽn bộ nhớ nghiêm trọng.
