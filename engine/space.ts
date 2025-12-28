
import { Vector } from './types';
import { WIDTH, SIZE } from './consts';

/**
 * @description  Spatial Topology Math & Lookups.
 * @complexity   O(1) - Array Access.
 */

// Precomputed Coordinate Lookups (180 bytes)
// RENAMED: LUT -> FILES/RANKS (Single Word Identity + Domain Language)
const FILES = new Int8Array(SIZE);
const RANKS = new Int8Array(SIZE);

// Initialization Block
for (let index = 0; index < SIZE; index++) {
  FILES[index] = index % WIDTH;
  RANKS[index] = Math.floor(index / WIDTH);
}

/**
 * @description Convert 2D coordinates to 1D index.
 * @param x Column (0-8)
 * @param y Row (0-9)
 */
export const flatten = (x: number, y: number): number => y * WIDTH + x;

/**
 * @description Convert 1D index to 2D Vector.
 * @warning     Allocates memory. Use only in UI (Cold Path).
 */
export const expand = (index: number): Vector => ({
  x: FILES[index],
  y: RANKS[index],
});

// Zero-Allocation Accessors (Hot Path)
export const file = (index: number): number => FILES[index]; // X
export const rank = (index: number): number => RANKS[index]; // Y

export const bound = (index: number): boolean => index >= 0 && index < SIZE;
