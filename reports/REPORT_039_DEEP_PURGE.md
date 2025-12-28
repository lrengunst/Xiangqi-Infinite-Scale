
# REPORT_039_DEEP_PURGE
**TIMESTAMP:** 2024-05-23 22:00
**MODE:** ZERO TOLERANCE EXECUTION
**AUTHOR:** A.R.E.S (Red Team Division)

#### 1. OBJECTIVE
Thực thi mệnh lệnh "Total System Audit". Quét sạch các định danh ghép (Compound Words) và viết tắt (Abbreviations) đang ẩn nấp trong các ngóc ngách hệ thống.

#### 2. DETECTION LOG (Nhật ký phát hiện)

**A. CRITICAL VIOLATION: HOOKS (`hooks/worker.ts`)**
*   `workerRef` -> **Compound**. Vi phạm luật đơn từ.
*   `callbackRef` -> **Compound**. Vi phạm luật đơn từ.
*   `initWorker` -> **Compound**. Hành động ghép.
*   `runOnMainThread` -> **Sentence**. Đây là một câu, không phải tên hàm.
*   `workerScriptUrl` -> **Compound**.

**B. CRITICAL VIOLATION: BOOT (`worker/boot.ts`)**
*   `ctx` -> **Abbreviation**. Vi phạm luật cấm viết tắt (Context).

**C. CRITICAL VIOLATION: TEST (`tests/suite.ts`)**
*   `failed_evidence` -> **Snake Case**. Vi phạm luật `lowercase` đơn từ. Đây là một sự sỉ nhục đối với quy chuẩn.

**D. CRITICAL VIOLATION: ATOM (`components/atoms/Unit.tsx`)**
*   `borderColor` -> **Compound**.
*   `textColor` -> **Compound**.
*   `ringClass` -> **Compound**.

#### 3. EXECUTION PLAN (Kế hoạch thanh trừng)

*   **Refactor Hooks:**
    *   `workerRef` -> `thread`.
    *   `callbackRef` -> `handler`.
    *   `initWorker` -> `boot`.
    *   `runOnMainThread` -> `fallback`.
    *   `workerScriptUrl` -> `url`.
*   **Refactor Boot:**
    *   `ctx` -> `scope` hoặc `self`.
*   **Refactor Test:**
    *   `failed_evidence` -> `evidence`.
*   **Refactor Unit:**
    *   `borderColor` -> `stroke`.
    *   `textColor` -> `ink`.
    *   `ringClass` -> `glow`.

#### 4. CONCLUSION
Hệ thống không chấp nhận sự "tiện tay". Mọi biến số phải được đặt tên với sự cân nhắc kỹ lưỡng như một tác phẩm nghệ thuật tối giản.
