
# REPORT_046_THE_MESH
**TIMESTAMP:** 2024-05-24 14:00
**MODE:** NETWORK ACTIVATION
**AUTHOR:** A.R.E.S (Network Division)

#### 1. OBJECTIVE
Hiện thực hóa lời hứa "Infinite Scale" bằng khả năng kết nối ngang hàng (Peer-to-Peer) giữa các Client mà không cần Server trung gian.

#### 2. ARCHITECTURE: THE AIR-GAP HANDSHAKE
Do hạn chế về môi trường Sandbox (không có Signaling Server), tôi đã thiết kế giao thức **Manual Signaling**:
1.  **Offer:** Host tạo mã SDP (được nén Base64).
2.  **Transport:** Người dùng copy/paste mã này qua kênh chat (Zalo, Messenger, Slack...).
3.  **Answer:** Guest nhận mã, tạo mã phản hồi.
4.  **Link:** Host nhận mã phản hồi -> WebRTC DataChannel mở.

#### 3. COMPONENTS
*   **`services/mesh.ts`:** Core Logic. Sử dụng `RTCPeerConnection` và `RTCDataChannel`.
*   **`hooks/mesh.ts`:** React Adapter.
*   **`Terminal.tsx`:** Giao diện "Hacker" để thực hiện Handshake.

#### 4. DATA FLOW
*   **Local Move:** `Arena` -> `App.handleMove` -> `Mesh.send(FEN)`.
*   **Remote Move:** `Mesh.onData` -> `App` -> `Match.sync(FEN)`.
*   **Synchronization:** Sử dụng chuỗi FEN (Snapshot) để đồng bộ trạng thái. Điều này đảm bảo tính toàn vẹn dữ liệu (Self-correction) nếu có packet bị mất (dù WebRTC TCP-mode đảm bảo order).

#### 5. STATUS
Hệ thống P2P đã hoạt động. Người chơi có thể đấu với nhau từ hai trình duyệt khác nhau (thậm chí khác mạng Wifi nếu STUN server của Google hoạt động tốt).
