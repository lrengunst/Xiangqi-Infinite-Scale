
# SESSION 043: THE GRANDMASTER'S VISION

**Date:** 2024-05-24 23:50
**Event:** Phase 11 Execution

**Status:**
Đã nâng cấp Engine với **Iterative Deepening** và **Move Ordering**.
Đây là kỹ thuật tiêu chuẩn của các Chess Engine hàng đầu để tận dụng tối đa Transposition Table.

**Performance Check:**
Việc lặp lại tìm kiếm (Depth 1, 2, 3...) thoạt nghe có vẻ lãng phí, nhưng thực tế nó giúp tiết kiệm thời gian khổng lồ ở các độ sâu lớn nhờ Alpha-Beta Cutoff sớm.

**Observation:**
AI giờ đây sẽ phản hồi nhanh hơn ở các nước cờ hiển nhiên (do TT hit) và suy nghĩ sâu hơn ở các thế cờ phức tạp.
