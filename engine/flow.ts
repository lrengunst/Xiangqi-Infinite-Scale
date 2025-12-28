
import { Board } from './types';

/**
 * @description  State Mutation Flow.
 */

// Immutable Apply (For React View)
// Warning: Allocates memory (Int8Array).
// OPTIMIZATION: Removed 'Move' object. Pass primitives directly.
export const apply = (board: Board, from: number, to: number): Board => {
  const next = new Int8Array(board);
  next[to] = next[from];
  next[from] = 0;
  return next;
};

// Mutable Commit (For AI Search)
// Returns captured piece for reversion.
export const commit = (board: Board, from: number, to: number): number => {
  const captured = board[to];
  board[to] = board[from];
  board[from] = 0;
  return captured;
};

// Mutable Revert (For AI Search)
export const revert = (board: Board, from: number, to: number, captured: number): void => {
  board[from] = board[to];
  board[to] = captured;
};
