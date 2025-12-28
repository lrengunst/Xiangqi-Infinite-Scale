
# REPORT_051_LOOP_BREAKER
**TIMESTAMP:** 2024-05-24 22:00
**MODE:** FEATURE EXECUTION
**AUTHOR:** A.R.E.S (Engine Division)

#### 1. OBJECTIVE
Ngăn chặn trạng thái lặp vô hạn (Infinite Loops) trong ván đấu bằng cách triển khai luật **3-fold Repetition Draw** (Hòa do lặp lại 3 lần).

#### 2. IMPLEMENTATION
*   **Zobrist Hashing:** Đã cài đặt `engine/zobrist.ts` và `engine/hash.ts`. Hệ thống gán một mã định danh duy nhất (64-bit integer) cho mỗi thế cờ.
*   **Collision Resistance:** Sử dụng `BigInt` (64-bit) đảm bảo xác suất trùng lặp hash (collisions) là gần như bằng 0 trong phạm vi một ván cờ (thậm chí hàng triệu ván).
*   **State Tracking:** `hooks/match.ts` giờ đây duy trì một mảng `hashes`. Mỗi khi thực hiện nước đi, Hash mới được tính toán và so sánh với lịch sử.

#### 3. LOGIC
Nếu `count(hashes, currentHash) >= 3` -> Trạng thái game chuyển thành **DRAW (REPETITION)**.

#### 4. IMPACT
*   **Fairness:** Game không còn bị treo nếu hai bên cố tình đi lặp lại.
*   **Foundation:** Zobrist Hash là nền tảng để cài đặt **Transposition Table** (Bảng chuyển vị) cho AI trong Phase 10, giúp tăng tốc độ tìm kiếm lên 5-10 lần.

#### 5. NEXT STEPS
Nghiên cứu cài đặt Transposition Table cho Web Worker.
