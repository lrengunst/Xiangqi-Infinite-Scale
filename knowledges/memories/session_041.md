
# SESSION 041: THE LOOP BREAKER

**Date:** 2024-05-24 22:05
**Event:** Phase 9 Execution

**Status:**
Đã tích hợp thành công Zobrist Hashing.
Luật hòa do lặp lại (Repetition Draw) đã hoạt động.

**Technical Achievement:**
Sử dụng `BigInt` cho Hashing đảm bảo độ chính xác cao mà vẫn duy trì hiệu năng O(N) cho thao tác tính hash (thực tế là O(1) so với kích thước input nhỏ của bàn cờ 90 ô).

**Note:**
Hiện tại Hash được tính lại toàn bộ (Full Recompute) sau mỗi nước đi trong `match.ts`. Điều này chấp nhận được ở tầng UI. Đối với AI (Phase sau), ta sẽ cần tính toán Incremental (XOR in/out) để đạt tốc độ tối đa.
