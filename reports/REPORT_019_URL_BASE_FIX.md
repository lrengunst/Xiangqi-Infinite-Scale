
# REPORT_019_URL_BASE_FIX
**TIMESTAMP:** 2024-05-21 21:00
**MODE:** BATTLEFIELD REPAIR
**AUTHOR:** A.R.E.S (Infrastructure)

#### 1. THE INCIDENT
Error: `TypeError: "/worker/boot.ts" cannot be parsed as a URL.`
This occurs when `new URL()` is called with an invalid base. In strictly sandboxed environments (like some iframe-based IDEs), `window.location.href` can be `about:srcdoc` or a `blob:` URI. These are not valid base URLs for resolving relative paths like `/worker/boot.ts`.

#### 2. THE FIX
**Safe Base Resolution Logic:**
We implemented a defensive check block in `hooks/worker.ts`:
1.  Try to use `window.location.origin` (preferred).
2.  If `origin` is 'null' (sandboxed), try `window.location.href`.
3.  Wrap `new URL()` construction in a `try-catch` block.
4.  If construction fails (meaning we cannot build a valid URL to fetch the script), we **IMMEDIATELY THROW** to the outer catch block.

**Graceful Degradation:**
The outer catch block catches the specific URL error and switches `state.mode` to `'main'` (Main Thread Fallback). This prevents the React app from crashing and ensures the game remains playable, albeit on the main thread.

#### 3. IMPACT
The "Worker Instantiation Failed" error will now be suppressed into a warning: *"Worker Init Failed (Environment Restricted). Using Main Thread."*
The user experience remains uninterrupted.
