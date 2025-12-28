
/**
 * @description  Transposition Table (TT).
 * @purpose      Cache search results to avoid re-calculating identical positions.
 * @memory       Fixed Static Size (~20MB). Zero Allocation.
 */

// Size = 2^20 (Approx 1 Million entries)
// Must be power of 2 for bitwise masking.
const SIZE = 1048576;
const MASK = BigInt(SIZE - 1);

export const Flag = {
  Exact: 0,
  Lower: 1,
  Upper: 2,
  None: 3
} as const;
export type Flag = typeof Flag[keyof typeof Flag];

// Struct of Arrays (SoA) layout for CPU Cache Locality
// We use BigUint64Array for Keys (Collision check)
// And Int32/16/8 for Data to save RAM.
const KEYS = new BigUint64Array(SIZE);
const SCORES = new Int16Array(SIZE);
const MOVES = new Uint16Array(SIZE); // Stores best move (from<<8 | to)
const DEPTHS = new Int8Array(SIZE);
const FLAGS = new Uint8Array(SIZE);

export const clear = (): void => {
  KEYS.fill(0n);
  SCORES.fill(0);
  MOVES.fill(0);
  DEPTHS.fill(0);
  FLAGS.fill(0);
};

export const save = (hash: bigint, depth: number, score: number, flag: Flag, move: number): void => {
  // Map 64-bit hash to Index using modulo (bitwise AND)
  const index = Number(hash & MASK);

  // Replacement Strategy:
  // 1. If slot is empty (Key == 0), take it.
  // 2. If same position (Key match), update it (deeper search preferred).
  // 3. If collision (Key mismatch), overwrite if new depth >= old depth.
  //    (Simple "Deepest or Newest" strategy)
  
  // Note: For simple engines, "Always Replace" is remarkably effective.
  // We implement "Depth Preferred" here.
  
  if (KEYS[index] !== 0n && KEYS[index] !== hash) {
      if (depth < DEPTHS[index]) return; // Existing entry is more valuable
  }

  KEYS[index] = hash;
  SCORES[index] = score;
  FLAGS[index] = flag;
  DEPTHS[index] = depth;
  MOVES[index] = move;
};

export const load = (hash: bigint, depth: number, alpha: number, beta: number): number | null => {
  const index = Number(hash & MASK);
  
  // Verify Identity (Collision Check)
  if (KEYS[index] !== hash) return null;

  // Verify Depth (Must be at least what we need)
  if (DEPTHS[index] < depth) return null;

  const score = SCORES[index];
  const flag = FLAGS[index];

  if (flag === Flag.Exact) return score;
  if (flag === Flag.Lower && score >= beta) return beta; // Beta Cutoff
  if (flag === Flag.Upper && score <= alpha) return alpha; // Alpha Cutoff

  return null;
};

/**
 * @description Retrieve the best move for the current position (if any).
 * @purpose     Used for Move Ordering (try best move first).
 */
export const hint = (hash: bigint): number => {
    const index = Number(hash & MASK);
    if (KEYS[index] === hash) return MOVES[index];
    return 0;
};
