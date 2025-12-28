
# SESSION 012: THE SECURITY BYPASS

**Date:** 2024-05-21 20:05
**Event:** Infrastructure Repair

**Incident:**
`SecurityError` chặn việc tạo Worker.

**Resolution:**
Đã triển khai **Blob Proxy Bridge**.
Worker giờ đây được khởi động từ một Blob an toàn, sau đó "gọi điện" (import) về Server để lấy mã nguồn đã biên dịch.

**Architecture Note:**
Đây là mẫu thiết kế (Pattern) chuẩn để chạy Module Workers trong các môi trường bị hạn chế (Restricted Environments).
