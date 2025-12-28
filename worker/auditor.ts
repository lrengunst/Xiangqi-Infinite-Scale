
/**
 * @description  The Auditor (Cold Agent).
 * @purpose      Deep analysis of game logs to find suboptimal moves.
 */

import * as Engine from '../engine/index';

// Callbacks interface for portability
export interface Callbacks {
    mistake: (payload: any) => void;
    progress: (current: number, total: number) => void;
    done: () => void;
    error: (msg: string) => void;
}

export const analyze = async (log: string, depth: number, cb: Callbacks) => {
    try {
        const steps = Engine.Format.parse(log);
        const board = Engine.Factory.genesis();
        
        // CRITICAL: SYNC MEMORY
        Engine.Codex.refresh();
        
        // We need to track history for AI search context
        const history: bigint[] = [Engine.Hash.compute(board, Engine.Types.Side.Red)];
        
        const THRESHOLD = 300; 

        let count = 0;

        for (const step of steps) {
            count++;
            
            // Yield to Event Loop
            await new Promise(resolve => setTimeout(resolve, 10));

            try {
                // 1. Validate Move Integrity BEFORE doing anything expensive
                const isLegal = Engine.Query.legal(board, step.source, step.target, step.side);
                
                if (!isLegal) {
                    cb.error(`CRITICAL: Illegal move detected at line ${step.turn}: ${step.raw}. Aborting audit to prevent engine crash.`);
                    // STOP IMMEDIATELY. Continuing with a corrupted board causes Infinite Loops in Search.
                    break;
                }

                // 2. Snapshot State
                const currentFen = Engine.Snapshot.serialize(board);
                const currentHash = history[history.length - 1]; 
                
                // 3. Calculate BEST Move
                // Now safe to search because we know the state is valid
                const bestResult = Engine.Search.search(board, step.side, depth, undefined, 1, history);
                
                // 4. Score the PLAYED Move
                const playedMoveInt = (step.source << 8) | step.target;

                // Apply played move
                const captured = Engine.Flow.commit(board, step.source, step.target);
                
                // Evaluate Played Move
                const nextSide = step.side === Engine.Types.Side.Red ? Engine.Types.Side.Black : Engine.Types.Side.Red;
                const evalDepth = Math.max(1, depth - 1);
                const opponentResponse = Engine.Search.search(board, nextSide, evalDepth, undefined, 1, history);
                const playedScore = opponentResponse ? -opponentResponse.score : 0; 

                // Revert
                Engine.Flow.revert(board, step.source, step.target, captured);

                // 5. Compare & Report
                if (bestResult) {
                    const diff = bestResult.score - playedScore;
                    const isMissedMate = bestResult.score > 20000 && playedScore < 20000;
                    const isBlunder = diff > THRESHOLD;

                    if (isBlunder || isMissedMate) {
                        const bestSource = bestResult.move >> 8;
                        const bestTarget = bestResult.move & 0xFF;
                        const bestSourceVec = Engine.Space.expand(bestSource);
                        const bestTargetVec = Engine.Space.expand(bestTarget);
                        
                        const improvement = `${step.turn}. ${step.side === 0 ? 'RED' : 'BLACK'}: ${Engine.Codec.role(board[bestSource])} (${bestSourceVec.x},${bestSourceVec.y}) > (${bestTargetVec.x},${bestTargetVec.y})`;

                        cb.mistake({
                            turn: step.turn,
                            played: step.raw,
                            playedScore: playedScore,
                            best: improvement,
                            bestScore: bestResult.score,
                            bestMoveInt: bestResult.move, 
                            hash: currentHash,            
                            diff: diff,
                            fen: currentFen,
                            pv: bestResult.line 
                        });
                    }
                }

                // 6. Advance State
                const cap = Engine.Flow.commit(board, step.source, step.target);
                const hash = Engine.Hash.modify(history[history.length-1], board, playedMoveInt, cap);
                history.push(hash);
            
            } catch (stepError) {
                cb.error(`Runtime Error at line ${step.turn}: ${stepError}`);
                break; // Stop on runtime error too
            }
            
            cb.progress(count, steps.length);
        }

        cb.done();
    } catch (fatal) {
        cb.error(`FATAL AUDIT ERROR: ${fatal}`);
        cb.done();
    }
};

const isWorker = typeof window === 'undefined' && typeof self !== 'undefined';

if (isWorker) {
    const scope: Worker = self as any;
    scope.onmessage = (event) => {
        const { command, log, depth } = event.data;
        if (command === 'AUDIT') {
            analyze(log, depth, {
                mistake: (payload) => scope.postMessage({ signal: 'MISTAKE', payload }),
                progress: (current, total) => scope.postMessage({ signal: 'PROGRESS', current, total }),
                done: () => scope.postMessage({ signal: 'DONE' }),
                error: (msg) => scope.postMessage({ signal: 'ERROR', payload: msg })
            });
        }
    };
}
