
# REPORT_110_THE_GATEKEEPER
**TIMESTAMP:** 2024-05-31 14:00
**MODE:** QUALITY ASSURANCE
**AUTHOR:** A.R.E.S (High Command)

#### 1. THE FEAR (Nỗi sợ hãi)
Người dùng lo ngại "Red Win Rate" là một chỉ số phù phiếm. AI có thể tối ưu hóa cục bộ (Local Minima) bằng cách tăng giá trị quân cờ vô tội vạ, dẫn đến việc mất khả năng nhìn thấy các đòn phối hợp (Tactical blindness).

#### 2. THE SOLUTION: GATEKEEPER PROTOCOL
Để đảm bảo sự tăng trưởng là "Đúng đắn" (Correct Growth), chúng ta áp dụng cơ chế **"Trust but Verify"**:

*   **Step 1: Evolution (Tiến hóa):** Cho phép đột biến ngẫu nhiên và đấu thử 10-20 ván. Nếu Win Rate > 55%, coi là ứng viên tiềm năng (Candidate).
*   **Step 2: Validation (Thẩm định):** Ứng viên phải giải một bài toán đố (Puzzle) trong `engine/scenarios.ts`.
    *   Ví dụ: Thế cờ "Xe Pháo Tốt liên hoàn".
    *   Nếu trọng số mới khiến AI *không* tìm ra nước sát cục (do quá sợ mất quân hoặc đánh giá sai vị trí), ứng viên bị **LOẠI BỎ LẬP TỨC**.

#### 3. IMPACT
*   **Quality Control:** Đảm bảo AI không bao giờ "ngu đi" về mặt chiến thuật trong khi đang cố "khôn lên" về mặt chiến lược.
*   **Balanced Growth:** Trọng số (Weights) chỉ được phép thay đổi trong biên độ an toàn mà Logic (Search) cho phép.

#### 4. IMPLEMENTATION
Cập nhật `hooks/tuner.ts` để tích hợp bước `verifyCandidate` sử dụng `Simulator.solve`.
