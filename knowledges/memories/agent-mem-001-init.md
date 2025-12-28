# MEMORY LOG 001

**Date:** 2024-05-21
**Event:** System Initialization & Audit

Tôi đã tiếp nhận dự án Xiangqi Infinite Scale. Mã nguồn ban đầu là một bản phác thảo React cơ bản (Proof of Concept).

**Phát hiện:**
1. Cấu trúc `Int8Array` là một khởi đầu tốt (Data-Oriented).
2. Logic AI hiện tại quá ngây thơ (Naive implementation) cho một hệ thống "Infinite Scale".
3. Chưa có cơ chế Worker để xử lý tác vụ nặng.

**Quyết định:**
Kích hoạt chế độ "Red Team" để đập bỏ các giả định sai lầm về quản lý bộ nhớ và luồng. Bắt đầu quá trình Refactor hướng tới kiến trúc Actor Model (Main Thread + Worker Threads).
