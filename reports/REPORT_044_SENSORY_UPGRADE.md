
# REPORT_044_SENSORY_UPGRADE
**TIMESTAMP:** 2024-05-24 11:00
**MODE:** FEATURE EXECUTION
**AUTHOR:** A.R.E.S (Experience Division)

#### 1. OBJECTIVE
Hiện thực hóa trải nghiệm đa giác quan (Multi-sensory experience) thông qua US-501 (Audio) và US-403 (Visual Lift).

#### 2. IMPLEMENTATION

**A. PROCEDURAL AUDIO (`design/sound.ts`)**
*   **Technique:** Web Audio API Oscillators (Sine/Triangle/Square/Sawtooth).
*   **Performance:** Zero Assets. Không cần tải file. Khởi tạo `AudioContext` lazy (chỉ chạy khi người dùng tương tác lần đầu).
*   **Feedback:**
    *   `Move`: Tiếng gỗ trầm (Triangle Wave).
    *   `Capture`: Tiếng va chạm mạnh (Square Wave + Noise simulation).
    *   `Select`: Tiếng "blip" kỹ thuật số (Sine Wave).
    *   `Check`: Tiếng cảnh báo (Sawtooth).

**B. VISUAL PHYSICS (`components/atoms/Unit.tsx`)**
*   **Technique:** CSS Transform & Box Shadow simulation.
*   **Effect:** Khi quân cờ được chọn (`active`), nó được "nhấc" lên khỏi bàn cờ:
    *   `scale-110`: Phóng to nhẹ.
    *   `-translate-y-2`: Dịch chuyển lên trên (theo hướng Y màn hình, giả lập Z).
    *   `shadow-xl`: Đổ bóng lớn và xa hơn, tạo cảm giác độ sâu.

#### 3. IMPACT
Game client giờ đây có "trọng lượng". Người chơi cảm nhận được tác động vật lý của nước đi thông qua âm thanh và hình ảnh, thay vì chỉ nhìn thấy sự thay đổi trạng thái khô khan.

#### 4. NEXT STEPS
Chuẩn bị cho Phase 4: P2P Networking.
