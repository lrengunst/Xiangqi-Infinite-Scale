
import { Board, Side } from './types';
import * as Codec from './codec';
import { SIZE } from './consts';
import { key, SIDE } from './zobrist';

/**
 * @description  Hashing Toolkit.
 * @purpose      Calculate unique board fingerprints.
 */

/**
 * @description  Full board hash calculation.
 * @complexity   O(N) - Only used when committing moves or syncing state.
 */
export const compute = (board: Board, turn: Side): bigint => {
  let h = 0n;
  
  // XOR hash for the current turn if it's Black
  if (turn === Side.Black) {
    h ^= SIDE;
  }

  for (let index = 0; index < SIZE; index++) {
    const piece = board[index];
    if (piece !== 0) {
      const side = Codec.side(piece);
      const role = Codec.role(piece);
      h ^= key(side, role, index);
    }
  }

  return h;
};

/**
 * @description  Incremental Hash Update.
 * @complexity   O(1) - XOR operations.
 * @purpose      Update the Zobrist Hash without recalculating the whole board.
 */
export const modify = (hash: bigint, board: Board, move: number, captured: number): bigint => {
  let next = hash;
  
  // 1. Flip Turn (XOR with SIDE key toggles it)
  next ^= SIDE;

  const source = move >> 8;
  const target = move & 0xFF;
  // Pre-condition: 'board' is the state AFTER the move (commit has run).
  // So board[target] is the Mover.
  
  const mover = board[target];
  
  // 1. Remove Mover from Source
  next ^= key(Codec.side(mover), Codec.role(mover), source);
  
  // 2. Add Mover to Target
  next ^= key(Codec.side(mover), Codec.role(mover), target);
  
  // 3. Remove Captured from Target (if any)
  if (captured !== 0) {
      next ^= key(Codec.side(captured), Codec.role(captured), target);
  }
  
  return next;
};
