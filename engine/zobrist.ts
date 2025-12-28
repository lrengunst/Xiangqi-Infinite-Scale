
import { SIZE } from './consts';
import { Role, Side } from './types';

/**
 * @description  Zobrist Hashing Constants.
 * @purpose      Assign a unique 64-bit random integer to every possible piece-square state.
 * @security     DETERMINISTIC. Must be identical across all clients for P2P sync.
 */

// A.R.E.S Fixed Seed (The constant of the universe)
let seed = 0xDEADBEEF;

// Mulberry32: A fast, high-quality 32-bit PRNG
// We don't use Math.random() because it's inconsistent across sessions.
const next = (): bigint => {
  let t = seed += 0x6D2B79F5;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  const u32 = ((t ^ t >>> 14) >>> 0);
  return BigInt(u32);
};

// Compose 64-bit BigInt from two 32-bit chunks
const generate = (): bigint => {
  const h = next();
  const l = next();
  return (h << 32n) | l;
};

export const KEYS = new BigUint64Array(2 * 8 * SIZE); // Flattened 3D array
export const SIDE = generate(); // XOR this if it's Black's turn

// Initialization
for (let index = 0; index < KEYS.length; index++) {
  KEYS[index] = generate();
}

/**
 * @description  O(1) Key Lookup
 */
export const key = (side: Side, role: Role, index: number): bigint => {
  // Offset mapping:
  // Side (0-1) * 720 (8 * 90)
  // Role (0-7) * 90
  // Index (0-89)
  const offset = (side * 720) + (role * 90) + index;
  return KEYS[offset]; 
};
