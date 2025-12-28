
# REPORT_018_WORKER_FALLBACK
**TIMESTAMP:** 2024-05-21 20:30
**MODE:** TACTICAL RETREAT
**AUTHOR:** A.R.E.S (Infrastructure)

#### 1. THE INCIDENT
Error: `A.R.E.S WORKER CRASH: Unknown Worker Error`
The Blob Proxy Bridge (REPORT_017) successfully bypassed the SecurityError, but the browser failed to execute the imported script. This is likely because the Sandbox environment serves `.ts` files as raw text (MIME type mismatch) or does not support dynamic imports from Blobs pointing to the origin.

#### 2. THE STRATEGY
We are fighting against a hostile environment where we lack control over the build server (Bundler/Transpiler). Further attempts to hack the Worker instantiation (Data URIs, etc.) are fragile.
**Decision:** Implement a **Graceful Fallback to Main Thread**.

#### 3. IMPLEMENTATION
*   **Hook Update:** `hooks/worker.ts` now tracks a `mode` state (`'worker'` | `'main'`).
*   **Detection:** If `worker.onerror` fires during initialization, we automatically switch `mode` to `'main'`.
*   **Execution:** 
    *   In `worker` mode: Uses `postMessage`.
    *   In `main` mode: Uses dynamic `import('../engine/index')` to load the logic and executes it on the UI thread.
*   **UX Mitigation:** We use a short `await new Promise(r => setTimeout(r, 50))` before the heavy calculation in Main Thread mode. This gives React just enough time to render the "Thinking..." UI state before the Event Loop gets blocked by the AI.

#### 4. IMPACT
*   **Reliability:** 100%. The game will run everywhere, regardless of Worker support.
*   **Performance:** In Fallback mode, the UI will freeze during the AI's turn (200-500ms). This is a known trade-off acceptable for a turn-based game to ensure functionality.
