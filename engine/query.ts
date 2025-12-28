
import { Board, Role, Side } from './types';
import * as Codec from './codec';
import { commit, revert } from './flow';
import { bound, rank } from './space';
import { WIDTH, PALACES, ORTHOGONAL, HORSE } from './consts';
import { check, fly } from './rules';
import { generate } from './generate';
import { BUFFER } from './memory';

/**
 * @description  Analysis toolkit for game states.
 * @purpose      Detect check and checkmate conditions.
 * @optimization MUTATION over ALLOCATION.
 */

export const threat = (board: Board, turn: Side): boolean => {
  let general = -1;
  const palace = PALACES[turn];
  
  // Find General
  for (const index of palace) {
    if (board[index] !== 0 && Codec.side(board[index]) === turn && Codec.role(board[index]) === Role.General) {
      general = index; break;
    }
  }

  if (general === -1) return false;
  const enemy = turn === Side.Red ? Side.Black : Side.Red;

  // 1. Check Flying General
  if (fly(board)) return true;

  // 2. Check Linear Threats (Chariot, Cannon, Soldier, General)
  // Replaced local STEPS with shared ORTHOGONAL
  for (let i = 0; i < 4; i++) {
    const step = ORTHOGONAL[i];
    let current = general + step;
    let obstacles = 0;
    while (bound(current)) {
      if (Math.abs(step) === 1 && rank(current) !== rank(current - step)) break;
      const piece = board[current];
      if (piece !== 0) {
        if (Codec.side(piece) === enemy) {
          const identity = Codec.role(piece);
          if (identity === Role.Chariot && obstacles === 0) return true;
          if (identity === Role.Cannon && obstacles === 1) return true;
          if (identity === Role.Soldier && obstacles === 0) {
             const distance = Math.abs(current - general);
             if (distance === 1 || distance === WIDTH) return true; 
          }
          if (identity === Role.General && obstacles === 0) return true;
        }
        obstacles++;
        if (obstacles > 1) break;
      }
      current += step;
    }
  }

  // 3. Check Horse Threats
  // Replaced local HORSE with shared HORSE
  for (let i = 0; i < 8; i++) {
      const delta = HORSE[i];
      const target = general + delta;
      if (bound(target)) {
          const piece = board[target];
          if (piece !== 0 && Codec.side(piece) === enemy && Codec.role(piece) === Role.Horse) {
             if (check(board, target, general, enemy)) return true;
          }
      }
  }
  return false;
};

export const mate = (board: Board, turn: Side): boolean => {
  const start = 0;
  // API UPDATE: No buffer arg
  const end = generate(board, turn, start);
  
  for (let pointer = start; pointer < end; pointer++) {
    const move = BUFFER[pointer];
    const source = move >> 8;
    const target = move & 0xFF;
    
    const captured = commit(board, source, target);
    const safe = !threat(board, turn);
    revert(board, source, target, captured);

    if (safe) return false;
  }
  return true;
};

export const legal = (board: Board, source: number, target: number, turn: Side): boolean => {
  if (!check(board, source, target, turn)) return false;
  
  const captured = commit(board, source, target);
  const suicide = threat(board, turn);
  revert(board, source, target, captured);
  
  return !suicide;
};
