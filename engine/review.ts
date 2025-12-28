
import { Board, Side } from './types';
import { generate } from './generate';
import { commit, revert } from './flow';
import { BUFFER } from './memory';
import { threat } from './query';
import { initial } from './score';
import * as Search from './search';

export interface Hint {
  source: number;
  target: number;
  piece: number;
  kind: 'best' | 'trap' | 'mate' | 'alt';
  score: number;
  refutation?: { from: number; to: number }; // NEW: The killer reply
}

/**
 * @description  Deep Tactical Scanner.
 * @purpose      Prevents blunders by checking the opponent's best reply.
 * @complexity   O(B^2) ~ 1600 nodes.
 */
export const scan = (board: Board, turn: Side): Hint[] => {
  const hints: Hint[] = [];
  const enemy = turn === Side.Red ? Side.Black : Side.Red;
  
  const offsetA = 0;
  const endA = generate(board, turn, offsetA);
  
  let bestScore = -Infinity;
  let bestMove = -1;

  for (let ptrA = offsetA; ptrA < endA; ptrA++) {
    const move = BUFFER[ptrA];
    const source = move >> 8;
    const target = move & 0xFF;
    const piece = board[source];

    const capA = commit(board, source, target);
    
    if (threat(board, turn)) {
      revert(board, source, target, capA);
      continue;
    }

    // --- OPPONENT RESPONSE ANALYSIS ---
    const offsetB = 500; // Use a safe buffer offset
    const endB = generate(board, enemy, offsetB);
    
    let worstEnemyResponse = -Infinity; // From opponent perspective, they want to MAX their score
    let killerMove = 0; 

    if (offsetB === endB) {
        // Opponent has no moves (Stale/Mate)
        // If we put them in Checkmate, score is MAX.
        // If Stale (Xiangqi), also MAX (Win).
        worstEnemyResponse = -20000; // We win, so their response score is terrible for them? No.
        // Wait, Search.assess returns score from Current Turn perspective.
        // If it's Enemy turn, assess returns Enemy - Us.
    } else {
        // Check opponent's best reply (Quiescence only for speed)
        for (let ptrB = offsetB; ptrB < endB; ptrB++) {
            const reply = BUFFER[ptrB];
            const srcB = reply >> 8;
            const tgtB = reply & 0xFF;
            
            const capB = commit(board, srcB, tgtB);
            
            if (threat(board, enemy)) {
                revert(board, srcB, tgtB, capB);
                continue;
            }

            // Evaluate from Enemy's perspective
            // We use simple quiescence to catch obvious tactical captures
            const val = Search.assess(board, enemy);
            
            if (val > worstEnemyResponse) {
                worstEnemyResponse = val;
                killerMove = reply;
            }

            revert(board, srcB, tgtB, capB);
        }
    }

    // Our score is the inverse of opponent's best score
    const score = -worstEnemyResponse;

    revert(board, source, target, capA);

    // Classify Move
    let kind: 'best' | 'trap' | 'mate' | 'alt' = 'alt';
    
    if (score < -1000) kind = 'trap'; // Losing material
    if (score < -15000) kind = 'mate'; // Getting mated

    if (score > bestScore) {
        bestScore = score;
        bestMove = move;
    }

    // Only suggest interesting moves
    if (kind === 'trap' || kind === 'mate' || score > bestScore - 150) {
        hints.push({ 
            source, 
            target, 
            piece, 
            kind, 
            score,
            refutation: (kind === 'trap' || kind === 'mate') && killerMove !== 0 
                ? { from: killerMove >> 8, to: killerMove & 0xFF } 
                : undefined
        });
    }
  }

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
