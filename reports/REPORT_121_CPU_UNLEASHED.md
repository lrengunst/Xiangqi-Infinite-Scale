
# REPORT_121_CPU_UNLEASHED
**TIMESTAMP:** 2024-06-03 08:00
**MODE:** PERFORMANCE BREAKTHROUGH
**AUTHOR:** A.R.E.S (System Architect)

#### 1. INVESTIGATION (Điều tra)
*   **Current State:** Hệ thống sử dụng 1 Main Thread (UI) + 1 Web Worker (AI).
*   **Hardware Reality:** Đa số thiết bị hiện đại có 4-16 nhân CPU.
*   **Bottleneck:** Logic tìm kiếm AI (`Search`) chạy tuần tự. Khi gặp các nhánh phức tạp, 1 nhân CPU phải gánh toàn bộ khối lượng tính toán, trong khi các nhân khác nhàn rỗi (Idle).
*   **Verdict:** Lãng phí tài nguyên nghiêm trọng. "Hơi chậm" là phản hồi chính xác.

#### 2. STRATEGY: ROOT SPLITTING (Chia rễ)
Do hạn chế của môi trường Web (không có `SharedArrayBuffer` trong một số context bảo mật), chúng ta không thể dùng chung Bảng chuyển vị (Transposition Table) hiệu quả.
Giải pháp tối ưu nhất là **Root Splitting**:
1.  **Main Thread:** Sinh ra tất cả nước đi hợp lệ ở độ sâu 0 (Ví dụ: 30 nước).
2.  **Distribution:** Chia 30 nước này thành các gói (Chunks) gửi cho N Workers.
    *   Worker 1: Tính 10 nước đầu.
    *   Worker 2: Tính 10 nước giữa.
    *   Worker 3: Tính 10 nước cuối.
3.  **Aggregation:** Main Thread nhận kết quả, so sánh điểm số và chọn nước đi tốt nhất.

#### 3. EXPECTED GAIN (Lợi ích kỳ vọng)
*   **Linear Speedup:** Tốc độ lý thuyết tăng theo số nhân (trừ đi chi phí giao tiếp).
*   **Responsiveness:** Giảm thời gian chờ đợi cho người dùng từ 5s -> 1.5s (trên máy 4 nhân).

#### 4. EXECUTION PLAN
*   Refactor `engine/search.ts` để chấp nhận bộ lọc `candidates`.
*   Nâng cấp `hooks/worker.ts` thành `Cluster Manager`.
*   Cập nhật `Settings.tsx` để người dùng kiểm soát số luồng.

#### 5. STATUS
**EXECUTING...**
