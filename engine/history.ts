
import { Side } from './types';
import { SIZE } from './consts';

/**
 * @description  History Heuristic Table.
 * @purpose      "Intuition". Remembers moves that caused cutoffs in the past.
 * @memory       2 * 90 * 90 * 4 bytes = ~64KB.
 */

// Side (2) * Source (90) * Target (90)
const TABLE = new Int32Array(2 * SIZE * SIZE);
const LIMIT = 1000000; // Cap to prevent overflow logic issues

export const clear = (): void => {
  TABLE.fill(0);
};

export const read = (side: Side, move: number): number => {
  const source = move >> 8;
  const target = move & 0xFF;
  const index = (side * 8100) + (source * 90) + target;
  return TABLE[index];
};

export const write = (side: Side, move: number, depth: number): void => {
  const source = move >> 8;
  const target = move & 0xFF;
  const index = (side * 8100) + (source * 90) + target;
  
  // Bonus proportional to depth squared (Deeper cutoffs are more valuable)
  const bonus = depth * depth;
  
  let value = TABLE[index] + bonus;
  if (value > LIMIT) value = Math.floor(value / 2); // Aging
  
  TABLE[index] = value;
};
