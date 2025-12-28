
# REPORT_117_INTERACTION_TUNING
**TIMESTAMP:** 2024-06-01 08:00
**MODE:** UX REFINEMENT
**AUTHOR:** A.R.E.S (Experience Division)

#### 1. OBJECTIVE
Cung cấp quyền kiểm soát chi tiết hơn về phản hồi xúc giác và định hướng bàn cờ.

#### 2. NEW SETTINGS
*   **HAPTIC_FEEDBACK:** Toggle bật/tắt `navigator.vibrate`. Quan trọng cho người dùng muốn tiết kiệm pin hoặc không thích rung.
*   **AUTO_ORIENTATION:** Tự động xoay bàn cờ (`flip`) dựa trên lượt đi hiện tại (`match.turn`).
    *   Lượt Đỏ -> Board Normal.
    *   Lượt Đen -> Board Inverted.
    *   *Use Case:* Chơi Hotseat (2 người trên 1 máy) hoặc người chơi muốn luôn nhìn từ góc nhìn của phe đang suy nghĩ.

#### 3. IMPLEMENTATION
*   **State Elevation:** Đưa `haptics` và `autoFlip` lên `App.tsx`.
*   **Injection:** Truyền `haptics` xuống `Arena` để kiểm soát rung.
*   **Effect:** Sử dụng `useEffect` trong `App` để theo dõi `match.turn` và cập nhật `flip` nếu `autoFlip` bật.

#### 4. STATUS
**DEPLOYING...**
