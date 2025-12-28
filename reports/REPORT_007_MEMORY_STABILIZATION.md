
# REPORT_007_MEMORY_STABILIZATION
**TIMESTAMP:** 2024-05-21 14:15
**MODE:** Implementation (Memory Optimization)
**AUTHOR:** A.R.E.S (Core Engineer)

#### 1. OBJECTIVE
Loại bỏ hoàn toàn việc cấp phát bộ nhớ động (`new Array`, `.push`) trong vòng lặp tìm kiếm nước đi (Hot Path) để ngăn chặn hiện tượng GC Thrashing.

#### 2. IMPLEMENTATION
*   **Static Buffer:** Tạo `engine/memory.ts` chứa `BUFFER = new Int32Array(4096)`. Đây là vùng nhớ tĩnh tồn tại suốt vòng đời ứng dụng.
*   **Zero Allocation Generation:** Viết lại `generate.ts`. Hàm này không còn trả về `number[]` nữa. Thay vào đó, nó nhận `offset` và ghi trực tiếp vào `BUFFER`, trả về `newOffset`.
*   **Pointer Management:** Cập nhật `search.ts` để quản lý `stack pointer`.
    *   Depth 0 dùng buffer [0...end0]
    *   Depth 1 dùng buffer [end0...end1]
    *   Điều này đảm bảo không có sự chồng chéo dữ liệu giữa các tầng đệ quy mà không cần cấp phát mảng mới.

#### 3. IMPACT ANALYSIS
*   **Trước:** Mỗi lần gọi `generate` tạo ra một mảng JS mới. Với Minimax Depth 4 (~100k nodes), tạo ra ~100k arrays. GC phải chạy liên tục.
*   **Sau:** 0 allocation. Buffer được tái sử dụng liên tục. CPU chỉ thực hiện các phép ghi số nguyên (Int32 Write).

#### 4. NEXT TRIGGER
*   Refactor nốt `engine/flow.ts` để loại bỏ `new Int8Array` trong logic `apply`.
*   Chuyển AI sang Web Worker.
