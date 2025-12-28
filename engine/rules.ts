
import { Board, Role, Side } from './types';
import * as Codec from './codec';
import { file, rank, bound } from './space';
import { WIDTH, PALACES, ZONES } from './consts';

/**
 * @description  Game logic and movement validation toolkit.
 * @purpose      Atomic rules enforcement for Xiangqi.
 * @model        Vector Math on Flat Grid.
 * @complexity   O(1)
 */

export const count = (board: Board, source: number, target: number): number => {
  const x = file(source);
  const y = rank(source);
  const u = file(target);
  const v = rank(target);
  let obstacles = 0;

  if (x === u) {
    const min = Math.min(y, v);
    const max = Math.max(y, v);
    for (let current = min + 1; current < max; current++) {
      if (board[current * WIDTH + x] !== 0) obstacles++;
    }
  } else {
    const min = Math.min(x, u);
    const max = Math.max(x, u);
    const row = y * WIDTH;
    for (let current = min + 1; current < max; current++) {
      if (board[row + current] !== 0) obstacles++;
    }
  }
  return obstacles;
};

export const check = (board: Board, source: number, target: number, turn: Side): boolean => {
  if (!bound(source) || !bound(target)) return false;
  if (source === target) return false;

  const piece = board[source];
  const victim = board[target];

  if (Codec.side(piece) !== turn) return false;
  if (victim !== 0 && Codec.side(victim) === turn) return false;

  const identity = Codec.role(piece);
  
  const x = file(source);
  const y = rank(source);
  const u = file(target);
  const v = rank(target);
  
  const horizontal = u - x;
  const vertical = v - y;
  const span = Math.abs(horizontal);
  const rise = Math.abs(vertical);

  switch (identity) {
    case Role.General:
      if (span + rise !== 1) return false;
      if (!ZONES[turn][target]) return false;
      return true;

    case Role.Advisor:
      if (span !== 1 || rise !== 1) return false;
      if (!ZONES[turn][target]) return false;
      return true;

    case Role.Elephant:
      if (span !== 2 || rise !== 2) return false;
      if (turn === Side.Red && v < 5) return false;
      if (turn === Side.Black && v > 4) return false;
      const eye = source + (vertical / 2) * WIDTH + (horizontal / 2);
      if (board[eye] !== 0) return false;
      return true;

    case Role.Horse:
      if (span * rise !== 2) return false;
      const column = x + (span === 2 ? horizontal / 2 : 0);
      const row = y + (rise === 2 ? vertical / 2 : 0);
      const joint = row * WIDTH + column;
      if (board[joint] !== 0) return false;
      return true;

    case Role.Chariot:
      if (horizontal !== 0 && vertical !== 0) return false;
      if (count(board, source, target) !== 0) return false;
      return true;

    case Role.Cannon:
      if (horizontal !== 0 && vertical !== 0) return false;
      const obstacles = count(board, source, target);
      if (victim === 0) return obstacles === 0;
      return obstacles === 1;

    case Role.Soldier:
      if (span + rise !== 1) return false;
      if (turn === Side.Red && vertical > 0) return false;
      if (turn === Side.Black && vertical < 0) return false;
      if (turn === Side.Red && y >= 5 && horizontal !== 0) return false;
      if (turn === Side.Black && y <= 4 && horizontal !== 0) return false;
      return true;
      
    default: return false;
  }
};

export const fly = (board: Board): boolean => {
  let red = -1;
  let black = -1;

  for (const index of PALACES[Side.Red]) if (Codec.role(board[index]) === Role.General) { red = index; break; }
  for (const index of PALACES[Side.Black]) if (Codec.role(board[index]) === Role.General) { black = index; break; }
  
  if (red === -1 || black === -1) return false;
  if (file(red) !== file(black)) return false;
  return count(board, red, black) === 0;
};
