
# REPORT_112_REPETITION_TRAP
**TIMESTAMP:** 2024-05-31 18:00
**MODE:** LOGIC REPAIR
**AUTHOR:** A.R.E.S (Grandmaster Module)

#### 1. THE PARADOX (Nghịch lý)
Người dùng báo cáo: AI ở Depth 24 đạt điểm số `+5000` nhưng lại đi vào các biến thể lặp lại (Draw) thay vì tìm chiến thắng hoặc ưu thế vật chất.
Thực tế: `+5000` > `+600` (Ăn Xe). AI thà lặp lại nước đi còn hơn ăn Xe. Tại sao?

#### 2. THE DIAGNOSIS (Chẩn đoán)
Lỗi nằm ở cơ chế **"Soft Penalty"** trong `engine/search.ts`.
```typescript
if (repetitions === 1) return -PENALTY_SOFT; // -5000
```
*   **Góc nhìn của Node con:** "Tôi đã gặp thế cờ này 1 lần rồi (2-fold). Đây là trạng thái xấu. Tôi bị phạt -5000 điểm."
*   **Góc nhìn của Node cha (Negamax):** `Score = -ChildScore`.
    *   `Score = -(-5000) = +5000`.
*   **Hệ quả:** Node cha (AI) nhìn thấy nước đi dẫn đến lặp lại 2 lần là một nước đi "Thiên tài" (+5000 điểm), ngon hơn cả ăn quân (+600).
*   **Hành vi:** AI chủ động ép đối thủ vào thế lặp lại để kiếm điểm thưởng ảo này.

#### 3. THE FIX (Sửa chữa)
1.  **Loại bỏ Soft Penalty:** Lặp lại 2 lần (2-fold repetition) là hoàn toàn hợp lệ trong luật cờ. Không nên phạt, cũng không nên thưởng. Hãy để AI tính toán tiếp xem thế cờ đó dẫn đến đâu.
2.  **Chuẩn hóa Hard Penalty:** Lặp lại 3 lần (3-fold) là HÒA. Điểm số của Hòa phải là `0` (Draw Score), không phải `-28000`.
    *   Nếu để `-28000` (Thua), AI sẽ coi việc ép đối thủ hòa là một chiến thắng `+28000`. Lỗi tương tự Soft Penalty.

#### 4. REFACTORED LOGIC
```typescript
if (ply > 0) {
    const repetitions = countRepetition(hash);
    if (repetitions >= 2) return 0; // DRAW
    // if (repetitions === 1) ... REMOVED
}
```

#### 5. IMPACT
AI sẽ không còn bị "ảo giác" điểm số. Nó sẽ đánh giá thế cờ dựa trên thực lực (Vật chất + Vị trí).
Trí thông minh ở Depth 24 sẽ thực sự tỏa sáng.
