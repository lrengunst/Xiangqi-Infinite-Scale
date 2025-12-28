
import { Board, Role, Side } from './types';
import * as Codec from './codec';
import { rank, bound } from './space';
import { WIDTH, SIZE, ORTHOGONAL, DIAGONAL, HORSE, BLOCK, ELEPHANT, EYE, ZONES, HORSE_Y, ELEPHANT_Y } from './consts';
import { BUFFER } from './memory';

/**
 * @description  Move generator for pseudo-legal steps.
 * @purpose      Zero-allocation, O(1) logic, Self-contained validation.
 * @optimization INLINED logic avoids "Double Taxation" of calling Rules.check().
 *               GLOBAL BUFFER access avoids stack argument passing.
 */

export const generate = (board: Board, turn: Side, offset: number): number => {
  let pointer = offset;
  const red = turn === Side.Red;
  const zone = ZONES[turn]; // O(1) Lookup

  for (let index = 0; index < SIZE; index++) {
    const piece = board[index];
    if (piece === 0 || Codec.side(piece) !== turn) continue;

    const identity = Codec.role(piece);
    const row = rank(index);

    switch (identity) {
      case Role.Soldier:
        // Forward
        const forward = red ? index - WIDTH : index + WIDTH;
        if (bound(forward)) {
             const target = board[forward];
             if (target === 0 || Codec.side(target) !== turn) {
                 BUFFER[pointer++] = (index << 8) | forward;
             }
        }
        // Sideways (only after crossing river)
        const crossed = red ? row < 5 : row > 4;
        if (crossed) {
            const left = index - 1;
            if (rank(left) === row) { 
                const t = board[left];
                if (t === 0 || Codec.side(t) !== turn) BUFFER[pointer++] = (index << 8) | left;
            }
            const right = index + 1;
            if (rank(right) === row) {
                const t = board[right];
                if (t === 0 || Codec.side(t) !== turn) BUFFER[pointer++] = (index << 8) | right;
            }
        }
        break;

      case Role.Horse:
        for (let i = 0; i < 8; i++) {
            const target = index + HORSE[i];
            if (!bound(target)) continue;
            
            // GEOMETRY FIX: Prevent Array Wrapping
            if (rank(target) !== row + HORSE_Y[i]) continue;
            
            // BLOCK CHECK (Inline)
            const leg = index + BLOCK[i];
            if (board[leg] !== 0) continue;

            const victim = board[target];
            if (victim === 0 || Codec.side(victim) !== turn) {
                BUFFER[pointer++] = (index << 8) | target;
            }
        }
        break;
      
      case Role.Chariot:
        for (let i = 0; i < 4; i++) {
            const delta = ORTHOGONAL[i];
            let current = index + delta;
            while (bound(current)) {
                // Wrap check for Left/Right
                if (Math.abs(delta) === 1 && rank(current) !== rank(current - delta)) break;
                
                const victim = board[current];
                if (victim === 0) {
                    BUFFER[pointer++] = (index << 8) | current;
                } else {
                    if (Codec.side(victim) !== turn) {
                        BUFFER[pointer++] = (index << 8) | current;
                    }
                    break;
                }
                current += delta;
            }
        }
        break;
        
      case Role.Cannon:
        for (let i = 0; i < 4; i++) {
             const delta = ORTHOGONAL[i];
             let current = index + delta;
             let mount = false;

             while(bound(current)) {
                if (Math.abs(delta) === 1 && rank(current) !== rank(current - delta)) break;
                
                const victim = board[current];
                if (!mount) {
                    if (victim === 0) {
                        BUFFER[pointer++] = (index << 8) | current;
                    } else {
                        mount = true;
                    }
                } else {
                    if (victim !== 0) {
                        if (Codec.side(victim) !== turn) {
                            BUFFER[pointer++] = (index << 8) | current;
                        }
                        break;
                    }
                }
                current += delta;
             }
         }
        break;

      case Role.General:
         for(let i = 0; i < 4; i++) {
             const target = index + ORTHOGONAL[i];
             // Zone check (Inline)
             if (bound(target) && zone[target]) {
                 const victim = board[target];
                 if (victim === 0 || Codec.side(victim) !== turn) {
                     BUFFER[pointer++] = (index << 8) | target;
                 }
             }
         }
         break;

      case Role.Advisor:
         for(let i = 0; i < 4; i++) {
             const target = index + DIAGONAL[i];
             // Zone check (Inline)
             if (bound(target) && zone[target]) {
                 const victim = board[target];
                 if (victim === 0 || Codec.side(victim) !== turn) {
                     BUFFER[pointer++] = (index << 8) | target;
                 }
             }
         }
         break;

      case Role.Elephant:
         for(let i = 0; i < 4; i++) {
             const target = index + ELEPHANT[i];
             if (!bound(target)) continue;

             // GEOMETRY FIX
             if (rank(target) !== row + ELEPHANT_Y[i]) continue;

             // RIVER BOUNDARY (Inline)
             const r = rank(target);
             if (red) { if (r < 5) continue; } 
             else { if (r > 4) continue; }

             // EYE CHECK (Inline)
             const eye = index + EYE[i];
             if (board[eye] !== 0) continue;

             const victim = board[target];
             if (victim === 0 || Codec.side(victim) !== turn) {
                 BUFFER[pointer++] = (index << 8) | target;
             }
         }
         break;
    }
  }
  return pointer;
};

// Mirror optimization for capture generator
export const capture = (board: Board, turn: Side, offset: number): number => {
  let pointer = offset;
  const red = turn === Side.Red;
  const zone = ZONES[turn];

  for (let index = 0; index < SIZE; index++) {
    const piece = board[index];
    if (piece === 0 || Codec.side(piece) !== turn) continue;

    const identity = Codec.role(piece);
    const row = rank(index);

    switch (identity) {
      case Role.Soldier:
        const forward = red ? index - WIDTH : index + WIDTH;
        if (bound(forward)) {
             const target = board[forward];
             if (target !== 0 && Codec.side(target) !== turn) BUFFER[pointer++] = (index << 8) | forward;
        }
        const crossed = red ? row < 5 : row > 4;
        if (crossed) {
            const left = index - 1;
            if (rank(left) === row) {
                const t = board[left];
                if (t !== 0 && Codec.side(t) !== turn) BUFFER[pointer++] = (index << 8) | left;
            }
            const right = index + 1;
            if (rank(right) === row) {
                const t = board[right];
                if (t !== 0 && Codec.side(t) !== turn) BUFFER[pointer++] = (index << 8) | right;
            }
        }
        break;

      case Role.Horse:
        for (let i = 0; i < 8; i++) {
            const target = index + HORSE[i];
            if (!bound(target)) continue;
            if (rank(target) !== row + HORSE_Y[i]) continue;
            if (board[index + BLOCK[i]] !== 0) continue;
            const victim = board[target];
            if (victim !== 0 && Codec.side(victim) !== turn) BUFFER[pointer++] = (index << 8) | target;
        }
        break;
      
      case Role.Chariot:
        for (let i = 0; i < 4; i++) {
            const delta = ORTHOGONAL[i];
            let current = index + delta;
            while (bound(current)) {
                if (Math.abs(delta) === 1 && rank(current) !== rank(current - delta)) break;
                const victim = board[current];
                if (victim !== 0) {
                    if (Codec.side(victim) !== turn) BUFFER[pointer++] = (index << 8) | current;
                    break;
                }
                current += delta;
            }
        }
        break;
        
      case Role.Cannon:
        for (let i = 0; i < 4; i++) {
             const delta = ORTHOGONAL[i];
             let current = index + delta;
             let mount = false;
             while(bound(current)) {
                if (Math.abs(delta) === 1 && rank(current) !== rank(current - delta)) break;
                const victim = board[current];
                if (!mount) {
                    if (victim !== 0) mount = true;
                } else {
                    if (victim !== 0) {
                        if (Codec.side(victim) !== turn) BUFFER[pointer++] = (index << 8) | current;
                        break; 
                    }
                }
                current += delta;
             }
         }
        break;

      case Role.General:
         for(let i = 0; i < 4; i++) {
             const target = index + ORTHOGONAL[i];
             if (bound(target) && zone[target]) {
                 const victim = board[target];
                 if (victim !== 0 && Codec.side(victim) !== turn) BUFFER[pointer++] = (index << 8) | target;
             }
         }
         break;

      case Role.Advisor:
         for(let i = 0; i < 4; i++) {
             const target = index + DIAGONAL[i];
             if (bound(target) && zone[target]) {
                 const victim = board[target];
                 if (victim !== 0 && Codec.side(victim) !== turn) BUFFER[pointer++] = (index << 8) | target;
             }
         }
         break;

      case Role.Elephant:
         for(let i = 0; i < 4; i++) {
             const target = index + ELEPHANT[i];
             if (!bound(target)) continue;
             if (rank(target) !== row + ELEPHANT_Y[i]) continue;
             const r = rank(target);
             if (red) { if (r < 5) continue; } else { if (r > 4) continue; }
             if (board[index + EYE[i]] !== 0) continue;
             const victim = board[target];
             if (victim !== 0 && Codec.side(victim) !== turn) BUFFER[pointer++] = (index << 8) | target;
         }
         break;
    }
  }
  return pointer;
};
