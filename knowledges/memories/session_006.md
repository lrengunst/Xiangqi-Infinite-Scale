
# SESSION 006: THE STATIC VOID

**Date:** 2024-05-21 14:20
**Event:** Memory Stabilization

**Status:**
Đã hoàn thành việc chuyển đổi cơ chế sinh nước đi sang sử dụng bộ nhớ tĩnh (`Int32Array Buffer`).
Đây là bước tiến quan trọng nhất để đảm bảo hiệu suất ổn định.

**Technical Note:**
Cần lưu ý rằng `BUFFER` hiện tại là biến toàn cục (Global Shared State). Điều này an toàn trong mô hình Single Thread của JS hiện tại. Tuy nhiên, khi chuyển sang Multi-threaded Worker (nếu dùng `SharedArrayBuffer` trong tương lai), mỗi Worker sẽ cần một Buffer riêng hoặc cơ chế Locking. Hiện tại, với kiến trúc Actor Model (mỗi Worker là một instance độc lập), mỗi Worker sẽ có `engine/memory.ts` riêng nên vẫn an toàn.

**Pending:**
Vẫn còn một điểm cấp phát bộ nhớ trong `engine/flow.ts` -> `apply`. Hàm này được dùng cho UI (React cần immutability). Cần tách biệt rõ ràng logic AI (Mutable/Fast) và UI (Immutable/Safe).
