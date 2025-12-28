
# MODULE RESOLUTION & BARREL FILES

## 1. THE LAW OF EXPLICIT SURFACES (Luật Bề Mặt Tường Minh)
*   **Nguyên tắc:** Mọi `index.ts` (Barrel File) đóng vai trò Public API phải sở hữu các reference thực sự đến module con.
*   **Cấm:** Sử dụng `export * from './module'` hoặc `export * as Name from './module'` trong các Core Engine package.
*   **Bắt buộc:** Sử dụng mẫu `import` định danh rồi `export` định danh đó.

## 2. RATIONALE (Biện luận)
*   **Stability:** Đảm bảo tương thích với mọi môi trường module (CommonJS, ESM, SystemJS, Bundled, Unbundled).
*   **Control:** Cho phép IDE (VSCode) gợi ý code (Intellisense) nhanh hơn và chính xác hơn.
*   **Performance:** Giúp trình biên dịch phát hiện vòng lặp phụ thuộc (Circular Dependency) sớm hơn (tại thời điểm import).
