
/**
 * @description  Primitive types for the Engine.
 * @purpose      Atomic data definitions for Xiangqi states.
 */

export const Side = {
  Red: 0,
  Black: 1,
} ;
export type Side = typeof Side[keyof typeof Side];

export const Role = {
  Empty: 0,
  General: 1,
  Advisor: 2,
  Elephant: 3,
  Horse: 4,
  Chariot: 5,
  Cannon: 6,
  Soldier: 7,
} ;
export type Role = typeof Role[keyof typeof Role];

export type Board = Int8Array;

export interface Vector {
  x: number;
  y: number;
}

// NEW: Heuristic Tuning Parameters
export interface Tuning {
  window: number; // Aspiration Window size
  margin: number; // Futility Pruning margin
  lmrDepth: number; // Depth to start LMR
  lmrCount: number; // Move count to start LMR
}
