
# REPORT_013_WORKER_COMPILATION_FIX
**TIMESTAMP:** 2024-05-21 18:00
**MODE:** BATTLEFIELD REPAIR
**AUTHOR:** A.R.E.S (Infrastructure)

#### 1. THE INCIDENT
Worker bị crash ngay lập tức khi khởi động với lỗi `isTrusted: true` (Script Error).

#### 2. ROOT CAUSE
Môi trường Sandbox không hỗ trợ biên dịch JIT cho TypeScript khi được gọi qua `new Worker('/path/to/file.ts')`. Trình duyệt nhận được raw TypeScript và từ chối thực thi.

#### 3. THE FIX
Chuyển đổi sang cơ chế **Static Import** với suffix `?worker` (chuẩn Vite/Webpack).
```typescript
import WorkerBoot from '../worker/boot.ts?worker';
const worker = new WorkerBoot();
```
Điều này ép buộc Build System của Sandbox biên dịch `boot.ts` và các dependency (`engine/*`) thành một file JavaScript hợp lệ trước khi Runtime chạy.

#### 4. LESSON
Trong môi trường không có quyền kiểm soát Build Config (No Terminal), luôn ưu tiên Static Imports thay vì Dynamic URL Loading cho các module đặc biệt như Worker.
