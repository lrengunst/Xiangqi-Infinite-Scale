
# SESSION 071: THE AMNESIA FIX

**Date:** 2024-05-27 12:05
**Event:** Red Team Audit & Repair

**Incident:**
1.  **Network Amnesia:** `useMesh` hook sử dụng Stale Closure, dẫn đến việc xử lý sự kiện mạng với state cũ của ứng dụng.
2.  **DOM ID Pollution:** `Trace.tsx` khai báo `id` cục bộ, gây xung đột và lãng phí tài nguyên GPU khi render nhiều instance.

**Correction:**
1.  **Ref Pattern:** Áp dụng `useRef` cho event handler trong `useMesh` để luôn truy xuất logic mới nhất.
2.  **Resource Hoisting:** Di chuyển toàn bộ định nghĩa SVG (`defs`) vào `Grid.tsx` (Global Environment).

**Impact:**
- Đảm bảo tính toàn vẹn dữ liệu trong P2P (không bị rollback state).
- Tối ưu hóa render pipeline cho các hiệu ứng thị giác.

**Status:**
Hệ thống mạng và đồ họa: STABLE.
