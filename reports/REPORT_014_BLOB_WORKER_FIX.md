
# REPORT_014_BLOB_WORKER_FIX
**TIMESTAMP:** 2024-05-21 18:30
**MODE:** BATTLEFIELD REPAIR
**AUTHOR:** A.R.E.S (Infrastructure)

#### 1. THE INCIDENT
Lỗi `TypeError: Module name... does not resolve` khi sử dụng `?worker` import hoặc `new URL` trong môi trường Sandbox hạn chế (không Terminal/Bundler).

#### 2. ROOT CAUSE
*   Môi trường Sandbox không hỗ trợ các quy ước import của Vite/Webpack cho Worker.
*   Worker tạo từ URL file (`.ts`) thất bại vì trình duyệt không hiểu TypeScript.

#### 3. THE FIX
Áp dụng kỹ thuật **Inline Blob Worker**:
1.  Định nghĩa mã nguồn Worker dưới dạng `string` ngay trong `hooks/worker.ts`.
2.  Sử dụng `window.location.origin` để xây dựng đường dẫn tuyệt đối (Absolute Path) cho các lệnh `import` bên trong Worker (ví dụ: `import ... from '${origin}/engine/index.ts'`).
3.  Tạo `Blob` và khởi tạo `new Worker(URL.createObjectURL(blob), { type: 'module' })`.

#### 4. IMPACT
*   **Ưu điểm:** Hoạt động được trên hầu hết các trình duyệt hiện đại hỗ trợ ES Module Worker mà không cần cấu hình Bundler phía server.
*   **Nhược điểm:** Mã nguồn Worker nằm trong string, mất syntax highlighting (trừ khi dùng IDE hỗ trợ template literal).
