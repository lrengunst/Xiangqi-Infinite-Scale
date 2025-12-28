
# REPORT_005_ARCHITECTURAL_SHATTER
**TIMESTAMP:** 2024-05-21 13:00
**MODE:** Architectural Refactor (Atomics Logic)
**AUTHOR:** A.R.E.S (Builder & Architect)

#### 1. OBJECTIVE
Trả lời câu hỏi: "Có cần đập vỡ domain và thiết kế lại API bề nổi không?"
Thực hiện tái cấu trúc toàn diện `domain/` thành `engine/` (Toolkit) theo nguyên tắc Single Responsibility và Facade Pattern.

#### 2. RED TEAM ATTACK LOG (Tại sao kiến trúc cũ lại "rác"?)

*   **VECTOR 1: THE GOD OBJECT (`core.ts`)**
    *   **Phân tích:** File `core.ts` hiện tại đang làm quá nhiều việc: Chuyển đổi tọa độ (Math), Thực thi nước đi (State Mutation), Định danh quân cờ (Bitwise).
    *   **Hậu quả:** Khi mở rộng P2P, ta cần gửi tọa độ đi mà không cần logic thực thi. Việc import `core` sẽ kéo theo những thứ không cần thiết.
    *   **Kết luận:** Phải đập vỡ `core` thành `space` (không gian), `flow` (dòng chảy trạng thái), và `codec` (giải mã).

*   **VECTOR 2: POROUS API (API Rỗ Tổ Ong)**
    *   **Phân tích:** UI (`Arena.tsx`) đang phải import lẻ tẻ: `import { check } from '../domain/rules'`, `import { execute } from '../domain/core'`.
    *   **Hậu quả:** UI biết quá nhiều về cấu trúc bên trong của Engine. Nếu ta đổi tên file `rules.ts` thành `law.ts`, UI sẽ gãy.
    *   **Giải pháp:** "Tảng băng chìm" (The Iceberg). UI chỉ được phép biết đến `import { Engine } from '@/engine'`.

*   **VECTOR 3: NAMING CORRECTION (`do` keyword)**
    *   **Phát hiện:** Báo cáo 003 đề xuất đổi `mutate` thành `do`.
    *   **Lỗi:** `do` là từ khóa dành riêng (reserved keyword) trong JS/TS (`do { ... } while`).
    *   **Sửa chữa:** Sử dụng cặp động từ Transaction: **`commit`** (thực hiện ghi) và **`revert`** (hoàn tác).

#### 3. REFINED SOLUTION (Kiến trúc Engine Toolkit mới)

Chúng ta sẽ chuyển từ `domain/` (Business Logic) sang `engine/` (Framework/Toolkit).

**Cấu trúc thư mục mới:**
*   `engine/types.ts`: Các định nghĩa kiểu (Primitives).
*   `engine/consts.ts`: Hằng số vật lý (Physics).
*   `engine/codec.ts`: Bộ mã hóa/giải mã Bitwise (O(1)).
*   `engine/space.ts`: Topo học và không gian (Math).
*   `engine/factory.ts`: Công xưởng khởi tạo dữ liệu.
*   `engine/flow.ts`: Quản lý dòng chảy trạng thái (Immutable/Mutable).
*   `engine/rules.ts`: Luật chơi.
*   `engine/generate.ts`: Sinh nước đi.
*   `engine/search.ts`: Trí tuệ nhân tạo.
*   `engine/score.ts`: Đánh giá điểm số.
*   `engine/query.ts`: Truy vấn cấp cao.
*   **`engine/index.ts`**: **THE SURFACE (Bề mặt tảng băng)**.

#### 4. NEXT TRIGGER
*   Cập nhật toàn bộ UI để sử dụng Facade API mới.
*   Xóa bỏ thư mục `domain/` cũ.
