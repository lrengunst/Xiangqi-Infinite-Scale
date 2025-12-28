
# REPORT_092_AMNESIA_AND_IDENTITY_FRAUD
**TIMESTAMP:** 2024-05-27 12:00
**MODE:** RED TEAM EXECUTION
**AUTHOR:** A.R.E.S (Red Team Division)

#### 1. THE ACCUSATION: DIGITAL AMNESIA (Mất trí nhớ kỹ thuật số)
Tôi cáo buộc `hooks/mesh.ts` phạm tội **"Stale Closure" (Bao đóng ôi thiu)**.

**Bằng chứng:**
```typescript
useEffect(() => {
    mesh.current = new Mesh();
    mesh.current.onData = (p) => onPacket(p); // <--- TỬ HUYỆT
}, []); // Empty Dependency Array
```

**Phân tích:**
1.  `useEffect` chỉ chạy 1 lần khi component mount. Nó "chụp" lấy hàm `onPacket` tại thời điểm đó (phiên bản 1).
2.  Khi game diễn ra, `App.tsx` render lại, tạo ra `onPacket` phiên bản 2, 3, 4... chứa state mới nhất (`match`, `history`).
3.  Tuy nhiên, `mesh.current.onData` vẫn trỏ về **phiên bản 1**.
4.  **Hậu quả:** Khi nhận gói tin từ mạng, hệ thống gọi hàm cũ, sử dụng state cũ. Game sẽ bị reset về đầu hoặc hành xử sai lệch hoàn toàn. Đây là lỗi logic cực kỳ nguy hiểm trong React Hooks.

#### 2. THE ACCUSATION: IDENTITY FRAUD (Gian lận định danh)
Tôi cáo buộc `components/molecules/Trace.tsx` phạm tội **"DOM ID Pollution" (Ô nhiễm ID)**.

**Bằng chứng:**
```typescript
<marker id="arrowhead" ... />
<filter id="glow" ... />
```

**Phân tích:**
1.  Trong HTML/SVG, `id` phải là duy nhất (Global Unique).
2.  Nếu trên bàn cờ xuất hiện 2 mũi tên (ví dụ: gợi ý nước đi + nước vừa đi), hoặc component `Trace` unmount/remount không sạch, chúng ta sẽ có nhiều element trùng ID.
3.  **Hậu quả:** Trình duyệt sẽ render sai (áp dụng filter của mũi tên này cho mũi tên kia) hoặc báo lỗi validation.
4.  **Hiệu năng:** Việc định nghĩa lại Filter SVG (Expensive GPU Resource) mỗi khi render mũi tên là lãng phí.

#### 3. THE EXECUTION (Thi hành án)
*   **Fix Amnesia:** Sử dụng `useRef` để luôn tham chiếu đến hàm xử lý sự kiện mới nhất (Latest Mutable Ref Pattern).
*   **Fix Fraud:** Di dời (Deport) toàn bộ định nghĩa tài nguyên SVG (`defs`) vào `components/atoms/Grid.tsx` - nơi đóng vai trò là "Môi trường" (Environment) duy nhất và tĩnh. `Trace` chỉ việc tham chiếu ID.

#### 4. STATUS
**PURGING...**
