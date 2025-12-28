
# SESSION 069: THE LAZY HASHER

**Date:** 2024-05-27 09:05
**Event:** Red Team Attack on UI Logic

**Incident:**
Phát hiện `useMatch` sử dụng `Hash.compute` (O(N)) thay vì `Hash.modify` (O(1)) trong hàm `move`.
Đây là một sự lãng phí tài nguyên CPU không cần thiết, vi phạm nguyên tắc "Incremental Velocity".

**Correction:**
Đã Refactor `hooks/match.ts` để sử dụng Zobrist Incremental Hashing.
Logic xác định hòa (Draw) cũng được điều chỉnh thành `>= 3` lần lặp (chuẩn quốc tế) thay vì `>= 2`.

**Impact:**
UI update nhanh hơn (về mặt vi mô).
Codebase đạt độ nhất quán cao hơn giữa Engine và UI.

**Verdict:**
Không còn nơi ẩn nấp cho các thuật toán O(N) trong Hot Path.
