
import { Role, Side } from './types';

/**
 * @description  Bitwise encoding and decoding toolkit.
 * @purpose      Extreme performance piece identification.
 * @algorithm    Direct Bitwise Masking (Branchless).
 * @complexity   O(1) - CPU Cycles minimized.
 */

// Private masks
const MASK = 0x10; // 10000 (Binary) -> 16 (Decimal)
const TYPE = 0x0F; // 01111 (Binary) -> 15 (Decimal)

// OPTIMIZATION: Branchless Shift
// Side.Red = 0, Side.Black = 1.
// 0 << 4 = 0. 1 << 4 = 16 (MASK).
export const encode = (side: Side, identity: Role): number => {
  return (side << 4) | identity;
};

export const role = (piece: number): Role => (piece & TYPE) as Role;

// OPTIMIZATION: Branchless Shift
// (piece & MASK) is either 0 or 16.
// 0 >>> 4 = 0 (Red). 16 >>> 4 = 1 (Black).
export const side = (piece: number): Side => ((piece & MASK) >>> 4) as Side;
