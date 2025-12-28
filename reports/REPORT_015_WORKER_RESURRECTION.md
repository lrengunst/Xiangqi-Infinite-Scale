
# REPORT_015_WORKER_RESURRECTION
**TIMESTAMP:** 2024-05-21 19:00
**MODE:** BATTLEFIELD REPAIR
**AUTHOR:** A.R.E.S (Infrastructure)

#### 1. THE INCIDENT
User reported `WORKER CRASH: [object Object]`.
*   **The Object:** It was an `ErrorEvent` being stringified incorrectly.
*   **The Crash:** Caused by the Blob Worker (REPORT_014) attempting to import TypeScript files (`.ts`) directly at runtime. Browsers cannot parse TS syntax.

#### 2. THE FIX
*   **Revert to Standard:** Switched back to `new Worker(new URL('../worker/boot.ts', import.meta.url))`. This relies on the Sandbox's dev server to intercept the request for `boot.ts`, transpile it to JS on the fly, and serve valid JS to the browser.
*   **Enhanced Logging:** `worker.onerror` now destructures the `ErrorEvent` to print `message`, `filename`, and `lineno`. No more `[object Object]`.

#### 3. TECHNICAL RATIONALE
We attempted to bypass the build system with Blobs to avoid path resolution issues, but we hit a harder wall: Lack of Runtime Transpilation. The correct path is to trust the environment's module loader (Vite/Webpack) to handle the `new URL` pattern, which is the modern standard for Workers.

#### 4. STATUS
Worker infrastructure should now be stable and provide clear error messages if logic fails.
