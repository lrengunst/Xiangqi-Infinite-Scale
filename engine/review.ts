
import { Board, Side } from './types';
import { generate } from './generate';
import { commit, revert } from './flow';
import { BUFFER } from './memory';
import { threat } from './query';
import { initial, delta } from './score';
import * as Search from './search';

export interface Hint {
  source: number;
  target: number;
  piece: number;
  kind: 'best' | 'trap' | 'mate' | 'alt';
  score: number;
  refutation?: { from: number; to: number }; 
}

/**
 * @description  Deep Tactical Scanner (The Advisor).
 * @purpose      Prevents blunders by checking the CAUSAL CHAIN of captures.
 * @algorithm    Iterative Scan + Quiescence Settlement.
 * @complexity   O(B * Q) where B is branch factor, Q is quiescence complexity.
 */
export const scan = (board: Board, turn: Side): Hint[] => {
  const hints: Hint[] = [];
  // const enemy = turn === Side.Red ? Side.Black : Side.Red;
  
  const offset = 0;
  const end = generate(board, turn, offset);
  
  let bestScore = -Infinity;
  let bestMove = -1;
  const currentScore = initial(board);

  for (let pointer = offset; pointer < end; pointer++) {
    const move = BUFFER[pointer];
    const source = move >> 8;
    const target = move & 0xFF;
    const piece = board[source];
    const captured = commit(board, source, target);
    
    if (threat(board, turn)) {
      revert(board, source, target, captured);
      continue;
    }

    // --- CAUSAL INFERENCE ---
    // Instead of manually checking one ply, we ask the Engine:
    // "If I make this move, and the dust settles (Quiescence), what is the score?"
    // This implicitly handles:
    // 1. Enemy recaptures (Trade chains)
    // 2. Hanging pieces
    // 3. Simple tactical threats
    
    // Calculate immediate score change
    const change = delta(piece, source, target, captured);
    const nextScore = currentScore + change;
    const nextTurn = turn === Side.Red ? Side.Black : Side.Red;

    // Resolve the position (Quiescence Search)
    // -INF, INF means we want the EXACT outcome, no pruning window.
    // The result is from the PERSPECTIVE of 'nextTurn' (The Enemy).
    // So we negate it to get OUR score.
    const settledScore = -Search.settle(board, nextTurn, nextScore);

    revert(board, source, target, captured);

    // Classify Move
    let kind: 'best' | 'trap' | 'mate' | 'alt' = 'alt';
    
    // If the settled score is much worse than current score, it's a trap (we lost material)
    if (settledScore < currentScore - 200) kind = 'trap'; 
    if (settledScore < -20000) kind = 'mate'; 

    if (settledScore > bestScore) {
        bestScore = settledScore;
        bestMove = move;
    }

    // Filter: Only show interesting moves
    // 1. It's a trap/blunder
    // 2. It's a mate threat
    // 3. It's relatively good (close to best move)
    if (kind === 'trap' || kind === 'mate' || settledScore > bestScore - 100) {
        hints.push({ 
            source, 
            target, 
            piece, 
            kind, 
            score: settledScore,
            // Refutation logic is implicit in Quiescence, 
            // extracting the exact refutation move would require modifying Quiescence to return a PV.
            // For now, we trust the score drop.
            refutation: undefined 
        });
    }
  }

  // Mark the absolute best move
  const finalHints = hints.map(h => ({
      ...h,
      kind: h.source === (bestMove >> 8) && h.target === (bestMove & 0xFF) ? 'best' : h.kind
  }));

  finalHints.sort((a, b) => b.score - a.score);

  return finalHints;
};

export const evaluate = (board: Board): number => {
    return initial(board);
};
