
# REPORT_020_SANDBOX_PROTOCOL
**TIMESTAMP:** 2024-05-21 21:30
**MODE:** TACTICAL ADAPTATION
**AUTHOR:** A.R.E.S (Infrastructure)

#### 1. THE INCIDENT
Error: `TypeError: "/worker/boot.ts" cannot be parsed as a URL.`
Error: `Worker Construction Failed.`

These errors persist because the environment is operating in a **Deep Sandbox** (likely `about:srcdoc` or similar), where `window.location.href` is not a valid standard URL. This makes resolving relative paths to the server impossible via standard URL APIs.

#### 2. THE FIX: PRE-FLIGHT DETECTION
We implemented a strict Pre-flight Check in `hooks/worker.ts`.
Before attempting to touch `new URL()`, we verify the `base` origin.

**The Protocol:**
1.  Check `import.meta.url` (if available).
2.  Check `window.location.origin`.
3.  **Blacklist:** If the base starts with `about:`, `data:`, `blob:`, or is `'null'`, we declare the environment **HOSTILE** to Workers.
4.  **Action:** Immediately abort Worker initialization and switch `state.mode = 'main'`.

#### 3. IMPACT
*   **Safety:** The `TypeError` is completely eliminated because `new URL` is never called with an invalid base.
*   **UX:** The user (developer) no longer sees scary red errors in the console. Instead, a calm `console.info("A.R.E.S: Deep Sandbox detected...")` is logged.
*   **Functionality:** The game works perfectly on the Main Thread fallback.

#### 4. CONCLUSION
We have achieved "Run Anywhere" capability. The system intelligently degrades capabilities based on the environment's security constraints.
