
import { Board, Role, Side } from './types';
import * as Codec from './codec';
import { SIZE, WIDTH } from './consts';
import { flatten } from './space';
import { genesis } from './factory';

/**
 * @description  Serialization Toolkit (FEN Protocol).
 * @purpose      Convert Board Memory to Transport String and vice-versa.
 * @standard     Xiangqi FEN (Forsyth–Edwards Notation).
 */

const CHARS: Record<string, number> = {
  'k': Role.General, 'a': Role.Advisor, 'b': Role.Elephant,
  'n': Role.Horse,   'r': Role.Chariot, 'c': Role.Cannon, 'p': Role.Soldier,
  'K': Role.General, 'A': Role.Advisor, 'B': Role.Elephant,
  'N': Role.Horse,   'R': Role.Chariot, 'C': Role.Cannon, 'P': Role.Soldier
};

const SYMBOLS: Record<number, string> = {
  [Role.General]: 'k', [Role.Advisor]: 'a', [Role.Elephant]: 'b',
  [Role.Horse]: 'n',   [Role.Chariot]: 'r', [Role.Cannon]: 'c', [Role.Soldier]: 'p'
};

export const serialize = (board: Board): string => {
  let fen = '';
  let empty = 0;

  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const index = flatten(x, y);
      const piece = board[index];

      if (piece === 0) {
        empty++;
      } else {
        if (empty > 0) {
          fen += empty.toString();
          empty = 0;
        }
        const role = Codec.role(piece);
        const side = Codec.side(piece);
        const char = SYMBOLS[role];
        fen += side === Side.Red ? char.toUpperCase() : char.toLowerCase();
      }
    }
    if (empty > 0) {
      fen += empty.toString();
      empty = 0;
    }
    if (y < 9) fen += '/';
  }
  return fen;
};

export const parse = (fen: string): Board => {
  // If empty string, return clean board
  if (!fen) return genesis();
  
  const board = new Int8Array(SIZE);
  let x = 0;
  let y = 0;

  for (let index = 0; index < fen.length; index++) {
    const char = fen[index];
    
    if (char === '/') {
      y++;
      x = 0;
    } else if (/\d/.test(char)) {
      x += parseInt(char, 10);
    } else {
      const role = CHARS[char] as Role;
      if (role) {
        const side = char === char.toUpperCase() ? Side.Red : Side.Black;
        const pointer = flatten(x, y);
        board[pointer] = Codec.encode(side, role);
        x++;
      }
    }
  }
  return board;
};
