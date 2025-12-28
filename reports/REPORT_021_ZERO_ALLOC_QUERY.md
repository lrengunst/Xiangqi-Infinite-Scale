
# REPORT_021_ZERO_ALLOC_QUERY
**TIMESTAMP:** 2024-05-21 22:00
**MODE:** OPTIMIZATION
**AUTHOR:** A.R.E.S (Core Engineer)

#### 1. THE PROBLEM
The `mate` function in `engine/query.ts` was violating the "Zero Allocation" doctrine.
It called `apply` inside a loop iterating over generated moves. `apply` creates a new `Int8Array` (90 bytes) for every move.
With 40 moves, that's 3600 bytes allocated per frame/check. While small, this scales poorly and triggers GC in tight loops.

#### 2. THE FIX
Implemented **Sandbox Mutation Pattern**:
1.  Clone the board **ONCE** at the start of `mate`.
2.  Use `commit` (mutate) to apply a move.
3.  Check `threat`.
4.  Use `revert` (mutate) to undo the move.

#### 3. IMPACT
*   **Memory:** Allocation reduced from O(BranchFactor) to O(1).
*   **Speed:** Mutation is faster than Allocation + Copy.
*   **Safety:** Since `mate` clones the board first, it does not pollute the input board (React State safe).

#### 4. BONUS
Upgraded `Search.search` to return `{ move, score }`. This prepares the UI to display "AI Confidence" in future updates.
