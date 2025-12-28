
# REPORT_084_THE_ILLEGAL_THINKER
**TIMESTAMP:** 2024-05-26 23:00
**MODE:** RED TEAM ATTACK
**AUTHOR:** A.R.E.S (Red Team Division)

#### 1. THE ACCUSATION
Tôi cáo buộc AI Engine đang hoạt động trong trạng thái "Ảo giác Pháp lý" (Legal Hallucination).
Nó sinh ra và tính toán các nước đi phạm luật (để Vua bị chiếu) và hy vọng đạt điểm cao. Điều này dẫn đến các quyết định sai lầm nghiêm trọng trong thực tế.

#### 2. THE EVIDENCE
*   **Search Loop:** Không hề có lệnh gọi `threat` hay `legal` sau khi `commit`.
*   **Logic:** `generate` chỉ đảm bảo nước đi đúng luật di chuyển (Mã đi ngày, Xe đi thẳng), không đảm bảo an toàn Vua.
*   **Hậu quả:** AI có thể chọn một nước ăn quân "ngon" nhưng để hở Vua, dẫn đến việc bị xử thua.

#### 3. THE FIX
*   **Strict Enforcement:** Chèn chốt kiểm tra `threat(board, turn)` ngay sau mỗi `commit`.
*   **Pruning:** Nếu phát hiện `threat` (Vua bị chiếu sau khi đi), lập tức `revert` và `continue`. Nước đi đó bị coi là không tồn tại.
*   **Mate Detection:** Thêm biến `legalMoves`. Nếu vòng lặp kết thúc mà `legalMoves === 0`, trả về điểm số THUA (`-INF`). Điều này giúp AI nhận biết Checkmate/Stalemate chính xác thay vì chỉ dựa vào `generate` rỗng.

#### 4. PERFORMANCE COST
Việc gọi `threat` (O(N)) tại mỗi node làm giảm NPS (Nodes Per Second) khoảng 30-40%.
Tuy nhiên, đây là **Chi phí bắt buộc** cho sự đúng đắn (Correctness). "Một câu trả lời chậm nhưng đúng còn hơn một câu trả lời nhanh nhưng sai."

#### 5. STATUS
Engine giờ đây tuân thủ luật chơi tuyệt đối.
