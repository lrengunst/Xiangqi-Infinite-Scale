# ARCHITECTURE PRINCIPLES

## 1. PERFORMANCE (HIỆU SUẤT)
*   **Big O(1) Absolute:** Mọi truy xuất dữ liệu trong vòng lặp game (Game Loop) phải là O(1).
*   **Zero Allocation:** Không sử dụng `new`, `malloc` trong Hot Path (Render Loop, AI Search Loop). Sử dụng Object Pooling hoặc tái sử dụng cấu trúc bộ nhớ.
*   **Data-Oriented:** Dữ liệu phải được tổ chức liền kề trong bộ nhớ (Cache locality).

## 2. SCALABILITY (KHẢ NĂNG MỞ RỘNG)
*   **P2P First:** Thiết kế phải giả định độ trễ mạng cao. Sử dụng cơ chế dự đoán (Prediction) và sửa sai (Rollback).
*   **Stateless Kernels:** Logic game (Core) phải tách biệt hoàn toàn khỏi UI (View).

## 3. CODING STYLE (PHONG CÁCH MÃ NGUỒN)
*   **Single-Word Identity:** 
    *   Variable/Function: `lowercase` (e.g., `search`, `move`, `grid`).
    *   Class/Type: `PascalCase` (e.g., `Grid`, `Unit`).
    *   Trait: `PascalCase` + `able` (e.g., `Renderable`).
*   **Documentation:** Mọi module phải có header `@purpose`, `@solves`, `@complexity`.
