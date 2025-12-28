
import * as Factory from './factory';
import * as Gen from './generate';
import * as Query from './query';
import * as Score from './score';
import * as Search from './search';
import * as Hash from './hash';
import * as Flow from './flow';
import * as Snapshot from './snapshot';
import * as Memory from './memory';
import * as Table from './table';
import * as Codex from './codex'; // NEW IMPORT
import { Side } from './types';

/**
 * @description  Game Simulation Logic (Framework Independent).
 * @purpose      Can run in Worker OR Main Thread.
 */

export interface TrainConfig {
    depth: number;
    limit: number; 
    weights?: Record<string, number>;
    fen?: string;
    chaos?: boolean;
    minMoves?: number; // NEW: Minimum moves before allowing a draw
}

export interface SimulationResult {
    winner: 'RED_WIN' | 'BLACK_WIN' | 'DRAW';
    moves: number;
    history: { hash: bigint, move: number }[]; // For learning
}

export interface SolveConfig {
    fen: string;
    depth: number;
}

export const solve = (config: SolveConfig): { move: number, score: number } | null => {
    Table.clear();
    // CRITICAL: Ensure we have the latest Codex knowledge
    Codex.refresh();

    const board = Snapshot.parse(config.fen);
    const parts = config.fen.split(' ');
    const turn = parts[1] === 'b' ? Side.Black : Side.Red;
    const history: bigint[] = [Hash.compute(board, turn)];

    return Search.search(board, turn, config.depth, undefined, 1, history, false);
};

// Helper: Get random legal move
const getRandomMove = (board: Int8Array, turn: Side, excludeMove: number = 0): number => {
    const start = 0;
    const end = Gen.generate(board, turn, start);
    const candidates: number[] = [];

    for (let ptr = start; ptr < end; ptr++) {
        const move = Memory.BUFFER[ptr];
        if (move === excludeMove) continue; // Skip the repetition move
        
        const source = move >> 8;
        const target = move & 0xFF;
        
        // Strict Legal Check
        if (Query.legal(board, source, target, turn)) {
            candidates.push(move);
        }
    }

    if (candidates.length === 0) return 0;
    return candidates[Math.floor(Math.random() * candidates.length)];
};

export const run = (config: TrainConfig): SimulationResult => {
    // CRITICAL: SYNC MEMORY at start of run
    Codex.refresh();

    // Track learning data
    const learningPath: { hash: bigint, move: number }[] = [];
    const minMoves = config.minMoves || 40; 

    try {
        let board: Int8Array;
        let turn: Side;
        
        if (config.fen) {
            board = Snapshot.parse(config.fen);
            const parts = config.fen.split(' ');
            turn = parts[1] === 'b' ? Side.Black : Side.Red;
        } else {
            board = Factory.genesis();
            turn = Side.Red;
        }

        let moves = 0;
        
        if (config.weights) {
            Score.recalibrate(config.weights);
        }

        const history: bigint[] = [];
        let hash = Hash.compute(board, turn);
        history.push(hash);

        // --- PHASE 1: CHAOS (Optional Random Opening) ---
        const CHAOS_DEPTH = config.chaos ? (config.fen ? 2 : 8) : 0; // If custom FEN, less chaos needed
        
        for (let index = 0; index < CHAOS_DEPTH; index++) {
            const randomMove = getRandomMove(board, turn);
            if (randomMove === 0) {
                return { 
                    winner: turn === Side.Red ? 'BLACK_WIN' : 'RED_WIN',
                    moves,
                    history: learningPath
                };
            }

            const source = randomMove >> 8;
            const target = randomMove & 0xFF;
            const captured = Flow.commit(board, source, target);
            
            hash = Hash.modify(hash, board, randomMove, captured);
            history.push(hash);
            
            turn = turn === Side.Red ? Side.Black : Side.Red;
        }

        // --- PHASE 2: BATTLE (AI vs AI) ---
        while (moves < config.limit) {
            // 1. Immediate Mate Check
            if (Query.mate(board, turn)) {
                return { 
                    winner: turn === Side.Red ? 'BLACK_WIN' : 'RED_WIN', 
                    moves, 
                    history: learningPath 
                };
            }

            // 2. Search
            const result = Search.search(
                board, 
                turn, 
                config.depth, 
                undefined, 
                1, 
                history,
                true
            );

            let move = result ? result.move : 0;

            // 3. REPETITION & STAGNATION BREAKER
            let isRepetition = false;
            
            if (move !== 0) {
                const src = move >> 8;
                const tgt = move & 0xFF;
                const cap = board[tgt];
                const nextHash = Hash.modify(hash, board, move, cap);
                
                let reps = 0;
                for (let i = history.length - 1; i >= 0; i--) {
                    if (history[i] === nextHash) reps++;
                }
                
                if (reps >= 1) isRepetition = true; 
            }

            // FORCED DEVIATION PROTOCOL
            // If repeating OR AI found no move -> Force Deviation
            if ((isRepetition && moves < minMoves) || move === 0) {
                const deviation = getRandomMove(board, turn, move);
                
                if (deviation !== 0) {
                    move = deviation; 
                } else if (move === 0) {
                    return { 
                        winner: turn === Side.Red ? 'BLACK_WIN' : 'RED_WIN', 
                        moves, 
                        history: learningPath 
                    };
                }
            }

            // Execute Move
            if (move !== 0) {
                learningPath.push({ hash, move });

                const source = move >> 8;
                const target = move & 0xFF;
                const captured = Flow.commit(board, source, target);
                
                hash = Hash.modify(hash, board, move, captured);
                history.push(hash);
                
                // Final Draw Check
                let reps = 0;
                for (let i = history.length - 2; i >= 0; i--) {
                    if (history[i] === hash) reps++;
                }
                if (reps >= 2 && moves >= minMoves) {
                    return { winner: 'DRAW', moves, history: learningPath };
                }
                
                turn = turn === Side.Red ? Side.Black : Side.Red;
                moves++;
            } else {
                return { winner: 'DRAW', moves, history: learningPath };
            }
        }

        // 4. Material Evaluation (Limit Reached)
        const score = Score.initial(board);
        let winner: 'RED_WIN' | 'BLACK_WIN' | 'DRAW' = 'DRAW';
        if (score > 200) winner = 'RED_WIN';
        if (score < -200) winner = 'BLACK_WIN';

        return { winner, moves, history: learningPath };
        
    } catch (e) {
        console.error("SIMULATOR_CRASH:", e);
        return { winner: 'DRAW', moves: 0, history: [] }; 
    }
};
