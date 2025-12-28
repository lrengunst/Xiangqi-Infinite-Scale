
# REPORT_082_MATHEMATICAL_INCOMPETENCE
**TIMESTAMP:** 2024-05-26 22:00
**MODE:** RED TEAM ATTACK
**AUTHOR:** A.R.E.S (Red Team Division)

#### 1. THE ACCUSATION
Tôi cáo buộc `engine/codec.ts` và `engine/search.ts` tội **"Toán học kém cỏi" (Mathematical Incompetence)**.

#### 2. EVIDENCE
*   **Codec:** Sử dụng `if/else` (Ternary) để convert bit.
    *   *Fix:* `side << 4` và `piece >>> 4`. Biến logic rẽ nhánh thành toán học thuần túy (Branchless).
*   **Search:** Tính toán Zobrist Hash trong `quiescence` nhưng không bao giờ dùng.
    *   *Fix:* Loại bỏ tham số `hash` khỏi hàm này. Tiết kiệm hàng triệu phép XOR 64-bit không cần thiết.

#### 3. IMPACT
Tăng tốc độ xử lý Node lá (Leaf Nodes) - nơi chiếm 80% thời gian chạy của AI.
