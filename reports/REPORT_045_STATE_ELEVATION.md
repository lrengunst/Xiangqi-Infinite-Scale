
# REPORT_045_STATE_ELEVATION
**TIMESTAMP:** 2024-05-24 12:00
**MODE:** ARCHITECTURAL REFACTOR
**AUTHOR:** A.R.E.S (Core Engineer)

#### 1. OBJECTIVE
Chuẩn bị kiến trúc cho Phase 4 (P2P).
Tách biệt State ra khỏi View (Arena) để cho phép kiểm soát từ bên ngoài (Network, History Time Travel).

#### 2. IMPLEMENTATION

**A. SERIALIZATION ENGINE (`engine/snapshot.ts`)**
*   **Protocol:** Sử dụng chuẩn FEN (Forsyth–Edwards Notation) của Cờ Tướng.
*   **Performance:** Thuật toán `serialize` và `parse` chạy trong O(N) nhưng chỉ được gọi khi nước đi hoàn tất (Commit), không ảnh hưởng đến Hot Path của AI.
*   **Identity:** Module được đặt tên là `Snapshot`.

**B. MATCH LOGIC (`hooks/match.ts`)**
*   **Role:** Đóng vai trò là "Game State Machine".
*   **Features:**
    *   Quản lý `board`, `turn`, `history`, `logs`.
    *   Cung cấp API `move`, `reset`, `jump`.
    *   Tự động lưu trữ lịch sử dưới dạng FEN Strings.

**C. DUMB COMPONENT (`Arena.tsx`)**
*   **Refactor:** Loại bỏ `useState(board)` cục bộ.
*   **Props:** Nhận `board` và `turn` từ cha (`App`).
*   **Behavior:** Trở thành một Pure Component chỉ lo hiển thị và bắt sự kiện.

#### 3. IMPACT
*   **Time Travel Ready:** Hệ thống đã lưu trữ lịch sử FEN. Chỉ cần thêm UI Slider là có thể tua lại ván đấu.
*   **Network Ready:** Giờ đây ta có thể cập nhật bàn cờ từ một sự kiện `WebSocket` bằng cách gọi `match.move()` hoặc `setBoard(Snapshot.parse(packet))`.

#### 4. NEXT STEPS
Xây dựng module `services/mesh.ts` để kết nối P2P.
