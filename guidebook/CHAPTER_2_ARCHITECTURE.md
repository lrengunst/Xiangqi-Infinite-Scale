
# CHAPTER 2: THE ATOMIC ARCHITECTURE

## 2.1. The Iceberg Model (Mô hình Tảng băng trôi)
Hệ thống được thiết kế chia làm 3 tầng rõ rệt, giống như một tảng băng.

### Tầng 1: The Surface (View - UI)
*   **Công nghệ:** React 18, Tailwind CSS.
*   **Nhiệm vụ:** Hiển thị trạng thái (State) và bắt sự kiện (Input).
*   **Đặc điểm:** "Dumb Components". Các component như `Arena` hay `Unit` hoàn toàn không chứa logic game. Chúng chỉ nhận `props` và render.
*   **Design Pattern:** Atomic Design (Atom -> Molecule -> Organism).

### Tầng 2: The Bridge (Hooks & Workers)
*   **Công nghệ:** Web Workers, React Hooks.
*   **Nhiệm vụ:** Chuyển tải thông điệp (Message Passing) giữa UI và Engine.
*   **Đặc điểm:** Bất đồng bộ (Asynchronous). Đảm bảo UI không bao giờ bị block bởi tính toán nặng.

### Tầng 3: The Deep Core (Engine)
*   **Công nghệ:** Pure TypeScript, Bitwise Logic.
*   **Nhiệm vụ:** Thực thi luật chơi, tìm kiếm nước đi (AI), quản lý bộ nhớ.
*   **Đặc điểm:** Không phụ thuộc vào React hay DOM. Có thể chạy trên Node.js hoặc Deno.

## 2.2. Single Source of Truth
Trạng thái của game (`board`, `turn`, `history`) được quản lý tập trung tại `hooks/match.ts`.
Đây là nơi duy nhất được phép thay đổi dữ liệu (Mutation).

Khi chơi mạng (P2P):
1.  Bạn đi một nước -> `match.move()`.
2.  Trạng thái thay đổi -> `Arena` render lại.
3.  `Mesh` service gửi chuỗi FEN qua mạng.
4.  Đối thủ nhận FEN -> `match.sync()`.
5.  Trạng thái của đối thủ cập nhật -> `Arena` render lại.

## 2.3. Identity Purity (Sự thuần khiết định danh)
Chúng tôi tuân thủ quy tắc "Single Word Identity".
*   ✅ `generate`
*   ❌ `generateMoves`
*   ✅ `search`
*   ❌ `findBestMove`

Điều này giúp mã nguồn đọc như một bài thơ, giảm tải nhận thức (Cognitive Load) cho lập trình viên.
