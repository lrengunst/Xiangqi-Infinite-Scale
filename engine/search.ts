
import { Board, Side, Tuning } from './types';
import { generate, capture } from './generate';
import { commit, revert } from './flow';
import { initial, delta, measure, MATERIAL } from './score'; 
import { BUFFER } from './memory';
import { compute, modify } from './hash';
import { threat } from './query';
import * as Table from './table';
import * as Library from './library';
import * as Codex from './codex';
import * as Codec from './codec';
import * as History from './history';

// --- PARAMETRIC CONFIGURATION (HEURISTICS) ---
// Mutable Configuration State (Updated per search)

const INF = 30000; 
const MATE = 29000;
const MAX_PLY = 2048; 

// Move Ordering Bonuses
const SCORE_TT = 2000000;
const SCORE_CAPTURE = 1000000;
const SCORE_KILLER_1 = 900000;
const SCORE_KILLER_2 = 800000;

// Default Tuning
export const DEFAULTS: Tuning = {
    window: 30,
    margin: 900,
    lmrDepth: 3,
    lmrCount: 4
};

// Current active configuration (Module Scope for Performance)
let CONFIG: Tuning = { ...DEFAULTS };

const LMR_TIER_1 = 8;    // Move count for level 2 reduction
const LMR_TIER_2 = 16;   // Move count for level 3 reduction

// ---------------------------------------------

const KILLERS = new Int32Array(MAX_PLY * 2);
const STACK = new BigUint64Array(8192);
let stackPointer = 0;

// METRICS
let NODES = 0;
let HITS = 0;     // Cache Hits (Cutoffs via TT)
let PROBES = 0;   // Cache Lookups

export interface Result {
  move: number;
  score: number;
  nodes: number;
  hits: number;   // New Metric
  probes: number; // New Metric
  line: number[];
  isBook?: boolean;
}

export const reset = (): void => {
    KILLERS.fill(0);
    History.clear();
};

const countRepetition = (hash: bigint): number => {
    let count = 0;
    for (let index = stackPointer - 1; index >= 0; index--) {
        if (STACK[index] === hash) {
            count++;
            if (count >= 2) break; 
        }
    }
    return count;
};

const scoreMove = (board: Board, move: number, ttMove: number, turn: Side, ply: number): number => {
    if (move === ttMove) return SCORE_TT; 

    const target = move & 0xFF;
    const victim = board[target];

    if (victim !== 0) {
        const aggressor = board[move >> 8]; 
        const vVal = MATERIAL[Codec.role(victim)];
        const aVal = MATERIAL[Codec.role(aggressor)];
        return SCORE_CAPTURE + (vVal * 10) - aVal;
    }

    if (ply < MAX_PLY) {
        if (move === KILLERS[ply * 2]) return SCORE_KILLER_1;
        if (move === KILLERS[ply * 2 + 1]) return SCORE_KILLER_2;
    }

    return History.read(turn, move);
};

const scoreCapture = (board: Board, move: number): number => {
    const source = move >> 8;
    const target = move & 0xFF;
    const victim = board[target];
    const aggressor = board[source];
    
    if (victim === 0) return 0;

    const vVal = MATERIAL[Codec.role(victim)];
    const aVal = MATERIAL[Codec.role(aggressor)];
    return (vVal * 10) - aVal;
};

const pick = (board: Board, start: number, end: number, pointer: number, ttMove: number, turn: Side, ply: number): void => {
    let bestScore = -Infinity;
    let bestIndex = -1;

    for (let index = pointer; index < end; index++) {
        const move = BUFFER[index];
        const val = scoreMove(board, move, ttMove, turn, ply);
        if (val > bestScore) {
            bestScore = val;
            bestIndex = index;
        }
    }

    if (bestIndex !== -1) {
        const temp = BUFFER[pointer];
        BUFFER[pointer] = BUFFER[bestIndex];
        BUFFER[bestIndex] = temp;
    }
};

const pickCapture = (board: Board, start: number, end: number, pointer: number): void => {
    let bestScore = -Infinity;
    let bestIndex = -1;

    for (let index = pointer; index < end; index++) {
        const move = BUFFER[index];
        const val = scoreCapture(board, move);
        if (val > bestScore) {
            bestScore = val;
            bestIndex = index;
        }
    }

    if (bestIndex !== -1) {
        const temp = BUFFER[pointer];
        BUFFER[pointer] = BUFFER[bestIndex];
        BUFFER[bestIndex] = temp;
    }
};

const trace = (board: Board, turn: Side, hash: bigint): number[] => {
    const line: number[] = [];
    const sandbox = new Int8Array(board);
    let currentHash = hash;
    let currentTurn = turn;

    for (let index = 0; index < 10; index++) {
        const move = Table.hint(currentHash);
        if (move === 0) break;
        line.push(move);
        const source = move >> 8;
        const target = move & 0xFF;
        const captured = commit(sandbox, source, target);
        currentHash = modify(currentHash, sandbox, move, captured);
        currentTurn = currentTurn === Side.Red ? Side.Black : Side.Red;
    }
    return line;
};

export const assess = (board: Board, turn: Side): number => {
    const score = initial(board);
    return quiescence(board, -INF, INF, turn, score, 2000);
};

export const search = (
    board: Board, 
    turn: Side, 
    depth: number,
    notify?: (stats: { depth: number; score: number; nodes: number; best: number; line: number[]; hits: number; probes: number }) => void,
    startDepth: number = 1,
    history: bigint[] = [],
    allowBook: boolean = true,
    tuning?: Tuning,
    candidates?: number[] // NEW: Root Splitting Constraint
): Result | null => {
  NODES = 0;
  HITS = 0;
  PROBES = 0;
  
  // Apply Tuning Configuration
  if (tuning) {
      CONFIG = tuning;
  } else {
      CONFIG = { ...DEFAULTS };
  }
  
  if (depth > MAX_PLY) {
      console.warn(`A.R.E.S: Depth ${depth} exceeds heuristic tables.`);
  } 

  stackPointer = 0;
  for (let index = 0; index < history.length; index++) {
      if (stackPointer < STACK.length) {
          STACK[stackPointer++] = history[index];
      }
  }

  const sandbox = new Int8Array(board);
  const baseline = initial(sandbox);
  const hash = compute(sandbox, turn);
  
  if (allowBook) {
      const taughtMove = Codex.recall(hash);
      if (taughtMove !== 0) {
          return { move: taughtMove, score: 9999, nodes: 0, line: [taughtMove], isBook: true, hits: 0, probes: 0 };
      }
      
      const bookMove = Library.consult(hash);
      if (bookMove !== 0) {
          return { move: bookMove, score: 0, nodes: 1, line: [bookMove], isBook: true, hits: 0, probes: 0 };
      }
  }
  
  let bestResult: Result | null = null;
  let alpha = -INF;
  let beta = INF;
  let val = 0;

  for (let d = startDepth; d <= depth; d++) {
      
      if (d > 3 && bestResult) {
          const delta = CONFIG.window; // Dynamic Window
          alpha = Math.max(-INF, bestResult.score - delta);
          beta = Math.min(INF, bestResult.score + delta);
      } else {
          alpha = -INF;
          beta = INF;
      }

      while (true) {
          // Pass candidates to PVS
          val = pvs(sandbox, d, 0, alpha, beta, turn, baseline, hash, 0, candidates);
          
          if (val <= alpha) {
              alpha = -INF;
              continue;
          }
          if (val >= beta) {
              beta = INF;
              continue;
          }
          break;
      }

      // If we are root splitting, we might not populate the TT fully for 'hint'
      // But 'bestResult' tracks the local best.
      const move = candidates ? bestResult?.move || 0 : Table.hint(hash);
      const line = candidates ? [move] : trace(board, turn, hash);
      
      // Update best result based on the iteration
      // Note: With candidates, we rely on PVS to return the score of the best candidate
      // We need to capture the best move from the loop, which PVS logic below does via Table
      // But if Table is shared/fragmented, we should rely on local tracking?
      // For now, Table works per-worker.
      
      const bestMoveFromTable = Table.hint(hash);

      if (bestMoveFromTable !== 0) {
          bestResult = { move: bestMoveFromTable, score: val, nodes: NODES, line, isBook: false, hits: HITS, probes: PROBES };
          if (notify) {
              notify({ depth: d, score: val, nodes: NODES, best: bestMoveFromTable, line, hits: HITS, probes: PROBES });
          }
      }
      
      if (val > MATE - 100 || val < -MATE + 100) break;
  }

  return bestResult;
};

const quiescence = (
    board: Board,
    alpha: number,
    beta: number,
    turn: Side,
    score: number,
    pointer: number
): number => {
    NODES++;

    const inCheck = threat(board, turn);

    if (!inCheck) {
        let value = turn === Side.Red ? score : -score;
        
        // Dynamic Margin
        if (value < alpha - CONFIG.margin) {
            return alpha;
        }
        if (value >= beta) return beta;
        if (value > alpha) alpha = value;
    }

    const start = pointer;
    const end = inCheck ? generate(board, turn, start) : capture(board, turn, start);

    for (let index = start; index < end; index++) {
        pickCapture(board, index, end, index);

        const move = BUFFER[index];
        const source = move >> 8;
        const target = move & 0xFF;
        const piece = board[source];

        const captured = commit(board, source, target);
        
        if (threat(board, turn)) {
            revert(board, source, target, captured);
            continue; 
        }
        
        const change = delta(piece, source, target, captured);
        const nextScore = score + change;
        const nextTurn = turn === Side.Red ? Side.Black : Side.Red;

        const val = -quiescence(board, -beta, -alpha, nextTurn, nextScore, end);

        revert(board, source, target, captured);

        if (val >= beta) return beta;
        if (val > alpha) alpha = val;
    }

    return alpha;
};

const pvs = (
    board: Board, 
    depth: number, 
    ply: number,
    alpha: number, 
    beta: number, 
    turn: Side, 
    score: number, 
    hash: bigint,
    pointer: number,
    candidates?: number[] // NEW ARG
): number => {
  NODES++;

  const isRoot = ply === 0;

  if (!isRoot) {
      const repetitions = countRepetition(hash);
      if (repetitions >= 2) return 0; 
  }

  PROBES++;
  // Don't cutoff at Root if we are constrained by candidates (we must search them)
  const cached = Table.load(hash, depth, alpha, beta);
  if (cached !== null && !isRoot && !candidates) {
      HITS++;
      return cached;
  }

  if (depth <= 0) {
    return quiescence(board, alpha, beta, turn, score, pointer);
  }

  const inCheck = threat(board, turn);
  const extension = inCheck ? 1 : 0;
  const newDepth = depth + extension;

  let bestTT = Table.hint(hash);

  if (depth >= 5 && bestTT === 0 && !candidates) {
      pvs(board, depth - 2, ply, alpha, beta, turn, score, hash, pointer);
      bestTT = Table.hint(hash);
  }

  let start = pointer;
  let end = pointer;

  // ROOT SPLITTING LOGIC
  if (isRoot && candidates) {
      // Inject candidates into BUFFER
      // We overwrite the buffer at this pointer because it's the root
      for (let i = 0; i < candidates.length; i++) {
          BUFFER[pointer + i] = candidates[i];
      }
      end = pointer + candidates.length;
  } else {
      end = generate(board, turn, start);
  }
  
  let value = -INF;
  let bestMove = 0;
  let flag: Table.Flag = Table.Flag.Upper;
  let legalMoves = 0;
  let foundPv = false;

  for (let index = start; index < end; index++) {
    pick(board, index, end, index, bestTT, turn, ply);
    
    const move = BUFFER[index];
    const source = move >> 8;
    const target = move & 0xFF;
    const piece = board[source];
    
    const captured = commit(board, source, target);
    
    if (threat(board, turn)) {
        revert(board, source, target, captured);
        continue;
    }
    legalMoves++;
    
    const change = delta(piece, source, target, captured);
    const nextScore = score + change;
    const nextHash = modify(hash, board, move, captured);
    const nextTurn = turn === Side.Red ? Side.Black : Side.Red;

    let val = -INF;

    let reduction = 0;
    
    if (foundPv && depth >= CONFIG.lmrDepth && legalMoves > CONFIG.lmrCount && captured === 0 && !inCheck) {
        reduction = 1;
        if (legalMoves > LMR_TIER_1) reduction = 2;
        if (legalMoves > LMR_TIER_2) reduction = 3;
        
        if (ply < MAX_PLY) {
            if (move === KILLERS[ply * 2] || move === KILLERS[ply * 2 + 1]) reduction = 0;
        }
        
        const reducedDepth = newDepth - 1 - reduction;
        if (reducedDepth < 1) reduction = newDepth - 2;
    }

    if (stackPointer < STACK.length) {
        STACK[stackPointer++] = nextHash;
    }

    if (foundPv) {
        val = -pvs(board, newDepth - 1 - reduction, ply + 1, -alpha - 1, -alpha, nextTurn, nextScore, nextHash, end);
        if (reduction > 0 && val > alpha) {
             val = -pvs(board, newDepth - 1, ply + 1, -alpha - 1, -alpha, nextTurn, nextScore, nextHash, end);
        }
        if (val > alpha && val < beta) {
            val = -pvs(board, newDepth - 1, ply + 1, -beta, -alpha, nextTurn, nextScore, nextHash, end);
        }
    } else {
        val = -pvs(board, newDepth - 1, ply + 1, -beta, -alpha, nextTurn, nextScore, nextHash, end);
    }
    
    stackPointer--;
    
    revert(board, source, target, captured);
    
    if (val > value) {
        value = val;
        bestMove = move;
    }
    
    if (value > alpha) {
      alpha = value;
      flag = Table.Flag.Exact;
      foundPv = true;
    }
    
    if (alpha >= beta) {
        flag = Table.Flag.Lower;
        bestMove = move;
        if (captured === 0 && ply < MAX_PLY) {
            KILLERS[ply * 2 + 1] = KILLERS[ply * 2];
            KILLERS[ply * 2] = move;
            History.write(turn, move, depth);
        }
        break; 
    }
  }

  if (legalMoves === 0) {
      return -MATE + ply; 
  }

  Table.save(hash, depth, value, flag, bestMove);

  return value;
};
