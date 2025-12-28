
# USER STORIES: THE TRINITY FRAMEWORK (UI / UX / DX)

**Context:** Hệ thống Core đã đạt trạng thái hoàn hảo (Perfect State). Giai đoạn tiếp theo tập trung xây dựng một Framework UI/UX/DX có khả năng mở rộng (Scalable) và tái sử dụng (Reusable), biến Game Client thành một nền tảng kỹ thuật số cao cấp.

---

## 1. GIAO DIỆN NGƯỜI DÙNG (USER INTERFACE - UI)
**Vision:** "Liquid Interface" - Giao diện lỏng, thích ứng và biến hình.

### US-101: O(1) Theme Engine (Động cơ Giao diện Hằng số)
*   **As a:** UI Architect.
*   **I want to:** Thay đổi toàn bộ bảng màu và kích thước của ứng dụng thông qua việc cập nhật Token CSS Variables, không trigger React Re-render.
*   **So that:** Người dùng có thể chuyển đổi Theme (Cyberpunk, Zen, War, Paper) tức thì với chi phí hiệu năng bằng 0 (Zero Cost).
*   **Tech Stack:** `design/theme.ts` (Bridge), CSS Custom Properties.

### US-102: Responsive Atomic Grid (Lưới Nguyên tử Thích ứng)
*   **As a:** Player.
*   **I want to:** Bàn cờ tự động tính toán lại tỷ lệ hiển thị dựa trên Viewport thiết bị.
*   **So that:** Tôi có trải nghiệm tối ưu trên cả màn hình dọc (Mobile - Portrait) và ngang (Desktop - Landscape) mà không bị vỡ bố cục.
*   **Constraint:** Sử dụng `ResizeObserver` để cập nhật biến `scale` toàn cục.

### US-103: Visual Physics Layer (Lớp Vật lý Thị giác)
*   **As a:** UI Animator.
*   **I want to:** Các quân cờ di chuyển dựa trên mô phỏng vật lý (Spring/Damping) thay vì thời gian tuyến tính (Linear Duration).
*   **So that:** Chuyển động có trọng lượng, quán tính và cảm giác "thực".
*   **Tech:** `requestAnimationFrame` interpolation.

---

## 2. TRẢI NGHIỆM NGƯỜI DÙNG (USER EXPERIENCE - UX)
**Vision:** "Sensory Immersion" - Đắm chìm đa giác quan.

### US-201: Procedural Audio Synthesis (Tổng hợp Âm thanh Thủ tục)
*   **As a:** Sound Engineer.
*   **I want to:** Sinh âm thanh động (Dynamic Audio) từ sóng hình học (Sine, Triangle) ngay tại runtime.
*   **So that:**
    *   Loại bỏ hoàn toàn việc tải file `.mp3` (Tiết kiệm băng thông).
    *   Mỗi nước đi có một biến thể âm thanh nhẹ (Pitch/Gain modulation) để tránh nhàm chán.
*   **Events:** `Select` (High ping), `Move` (Wood thud), `Capture` (Digital crunch).

### US-202: Haptic Feedback Protocol (Giao thức Rung phản hồi)
*   **As a:** Mobile User.
*   **I want to:** Cảm nhận rung động xúc giác (Tactile vibration) khi tương tác.
*   **So that:** Tôi biết chắc chắn mình đã đặt quân cờ xuống đúng vị trí mà không cần nhìn ngón tay.
*   **Patterns:**
    *   Click: 5ms.
    *   Move: 10ms.
    *   Capture: 40ms (Heavy impact).

### US-203: Latency Masking (Che giấu độ trễ)
*   **As a:** Network Architect.
*   **I want to:** Hiển thị trạng thái "Thinking" của đối thủ/AI thông qua các hiệu ứng thị giác (Particle/Glow).
*   **So that:** Thời gian chờ đợi trở nên thú vị, giảm cảm giác sốt ruột khi mạng lag hoặc AI tính sâu.

---

## 3. TRẢI NGHIỆM PHÁT TRIỂN (DEVELOPER EXPERIENCE - DX)
**Vision:** "Transparent Box" - Hộp trong suốt, quan sát được mọi thứ.

### US-301: Neural Inspector (Trình Soi Não)
*   **As a:** AI Developer.
*   **I want to:** Một Overlay hiển thị luồng suy nghĩ của AI (Search Tree Visualization).
*   **So that:** Tôi có thể hiểu tại sao AI lại chọn nước đi đó (Explainable AI) và debug các nước đi ngớ ngẩn.
*   **Metrics:** PV-Line (Principal Variation), Node Count, Depth, Pruning Ratio.

### US-302: Time Travel Debugger (Gỡ lỗi Du hành thời gian)
*   **As a:** Tester.
*   **I want to:** Thanh trượt (Slider) cho phép tua lại bất kỳ trạng thái nào trong quá khứ và "Fork" (Rẽ nhánh) trận đấu từ đó.
*   **So that:** Tôi có thể tái hiện bug (Bug Reproduction) hoặc kiểm thử các giả thuyết chiến thuật (What-if scenarios).

### US-303: The Tribunal Monitor (Màn hình Tòa Án)
*   **As a:** Performance Engineer.
*   **I want to:** Biểu đồ FPS và Memory Heap hiển thị thời gian thực (Overlay).
*   **So that:** Tôi phát hiện ngay lập tức (Red Flag) nếu một thay đổi UI mới gây ra Memory Leak hoặc tụt Frame.
