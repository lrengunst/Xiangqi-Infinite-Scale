
# USER STORIES: PHASE 2 (ATOMIC UI)

**Theme:** "The Commander's Interface" (Giao diện Tư Lệnh)
**Style:** Military Industrial / Data-First / High Contrast.

---

## EPIC: E-05 (Design System Framework)

### US-301: Hệ thống Token (The Token Foundation)
*   **As a:** UI Engineer.
*   **I want to:** Định nghĩa toàn bộ màu sắc, khoảng cách, font chữ trong một file cấu hình trung tâm (`tokens.ts`).
*   **So that:** Tôi có thể thay đổi toàn bộ giao diện từ "Cổ điển" sang "Cyberpunk" chỉ bằng cách đổi một file config (Theming), và đảm bảo tính nhất quán tuyệt đối.
*   **Technical Constraints:**
    *   Không sử dụng CSS Variables (để tối ưu performance JS-in-CSS hoặc Tailwind Config).
    *   Cấu trúc: `Palette`, `Spacing`, `Typography`, `Radius`.
    *   **Anti-Pattern:** Cấm viết `bg-[#123456]`. Phải viết `bg-surface-primary`.

### US-302: Nguyên tử Unit (The Unit Atom)
*   **As a:** Player.
*   **I want to:** Nhìn thấy quân cờ rõ ràng, sắc nét với các trạng thái: `Idle`, `Selected`, `Threatened`, `Moving`.
*   **So that:** Tôi nhận biết tình huống chiến trường ngay lập tức (O(1) cognitive load).
*   **Acceptance Criteria:**
    *   Refactor `Unit.tsx` để loại bỏ logic chọn màu hardcode.
    *   Sử dụng `Variant` prop: `variant="red" | "black"`.
    *   Animation: Transform scale mượt mà, không layout shift.

---

## EPIC: E-06 (Control Deck)

### US-303: Bảng điều khiển P2P (The Network Visualizer)
*   **As a:** Commander (User).
*   **I want to:** Nhìn thấy trạng thái kết nối của mạng lưới AI phân tán (Worker Nodes).
*   **So that:** Tôi biết được sức mạnh tính toán hiện tại (ví dụ: "3 Nodes Active - 15M NPS").
*   **Visual Spec:**
    *   Một Widget nhỏ góc màn hình (HUD style).
    *   Đèn tín hiệu (Led): Xanh (Ready), Vàng (Thinking), Đỏ (Disconnected).
    *   Biểu đồ xung nhịp (Pulse Graph) mô phỏng hoạt động của Worker.

### US-304: Lịch sử nước đi (Battle Log)
*   **As a:** Analyst.
*   **I want to:** Xem danh sách các nước đi đã thực hiện (Ký hiệu chuẩn: Pháo 2 bình 5).
*   **So that:** Tôi có thể truy vết lại ván đấu.
*   **Technical Constraints:**
    *   Sử dụng `Virtual List` (Windowing) nếu danh sách vượt quá 50 dòng (tối ưu DOM).
    *   Tự động cuộn xuống dưới cùng.

---

## EPIC: E-07 (Feedback Systems)

### US-305: Tòa Án Giao Diện (UI Tribunal)
*   **As a:** Developer.
*   **I want to:** Một Overlay hiển thị FPS và Memory Usage theo thời gian thực.
*   **So that:** Tôi phát hiện ngay lập tức nếu một bản update UI gây tụt frame.
*   **Implementation:**
    *   Sử dụng `requestAnimationFrame` để đo FPS.
    *   `performance.memory` (Chrome specific) để đo Heap Size.

---

## KIẾN TRÚC MẪU (ATOMIC STRUCTURE)

```typescript
// Example: design/tokens.ts
export const Palette = {
  Carbon: {
    900: '#171717', // Surface
    800: '#262626', // Panel
    // ...
  },
  Signal: {
    Red: '#ef4444',
    Green: '#22c55e',
    Amber: '#f59e0b',
  }
}

// Example: components/atoms/Led.tsx
export const Led = ({ status }: { status: 'ok' | 'warn' | 'err' }) => {
  // Logic mapping status -> Palette.Signal
}
```
