
# SESSION 070: THE DYSCALCULIA FIX

**Date:** 2024-05-27 10:05
**Event:** Red Team Critical Repair

**Incident:**
1.  **Logic Bug:** `sync` function in `match.ts` had inverted turn logic (`Length % 2 === 0` should be Black, was Red). This would have broken the game state integrity in P2P mode.
2.  **Performance Bug:** `Arena.tsx` was creating a new Array(90) on every render tick.

**Correction:**
1.  **Logic:** Fixed `nextTurn` calculation. Explicitly handle `Black Wins` vs `Red Wins`.
2.  **Render:** Introduced `INDICES` (Int8Array) in `consts.ts` and used it in `Arena.tsx`.

**Impact:**
- Network Play is now logically sound.
- Render loop generates 0 garbage arrays.

**Status:**
System Integrity Restored.
