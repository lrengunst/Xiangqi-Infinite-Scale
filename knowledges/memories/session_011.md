
# SESSION 011: THE URL PARADOX

**Date:** 2024-05-21 19:35
**Event:** Infrastructure Repair

**Incident:**
`new URL()` failed. `import.meta.url` proved unreliable in the current runtime sandbox.

**Resolution:**
Switched to root-relative pathing (`/worker/boot.ts`). Simplicity wins.
Re-verified that `hooks/worker.ts` is robust against instantiation failures.

**Status:**
Monitoring for 404 errors (if the path is wrong) or Content-Type errors (if server doesn't transpile).
