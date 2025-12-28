
# REPORT_077_UI_PERSISTENCE
**TIMESTAMP:** 2024-05-26 17:30
**MODE:** UX REPAIR
**AUTHOR:** A.R.E.S (UX Division)

#### 1. THE INCIDENT
Người dùng báo cáo giao diện Neural Feedback "không hiển thị" hoặc "biến mất quá nhanh".
Nguyên nhân gốc rễ: Các thiết bị tính toán hiện đại xử lý Depth 5 trong thời gian < 50ms. React UI chưa kịp render trạng thái `progress` thì Worker đã gửi tín hiệu `Moved` (Kết thúc), làm UI reset về trạng thái Idle trống rỗng.

#### 2. THE FIX
*   **Persistent Visualization:** Cập nhật `Network.tsx` để hiển thị `stats` (Kết quả cuối cùng) khi hệ thống ở trạng thái nghỉ (`!thinking`).
*   **Logic:** `const data = thinking ? progress : stats;`.
*   **Result:** Người dùng giờ đây có thể xem lại luồng suy nghĩ (PV Line, Score, Nodes) của nước đi vừa rồi cho đến khi lượt đi tiếp theo bắt đầu.

#### 3. DIFFICULTY UNLOCK
*   **Upgrade:** Mở khóa Depth 6 và 7 trong `Settings.tsx`.
*   **Rationale:** Với Transposition Table và Move Ordering đã hoạt động ổn định, hệ thống đủ sức gánh vác độ sâu lớn hơn, tạo ra thử thách thực sự cho các thiết bị cao cấp và kéo dài thời gian hiển thị Telemetry một cách tự nhiên.

#### 4. STATUS
Giao diện đã ổn định và cung cấp thông tin liên tục (Continuous Intelligence Stream).
