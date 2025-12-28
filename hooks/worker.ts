import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Command, Signal, Inbox, Outbox, Telemetry } from '../worker/protocol';
import { Thread } from '../worker/thread';
import { Board, Side, Tuning } from '../engine/types';
import * as Engine from '../engine/index';

interface State {
  ready: boolean;
  thinking: boolean;
  error: string | null;
  mode: 'worker'; 
  stats: Telemetry | null; 
  progress: Telemetry | null;
  threads: number; 
  cores: number;   
}

export const useWorker = () => {
  const cluster = useRef<Thread[]>([]);
  const cores = typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency || 4) : 4;

  const [state, setState] = useState<State>({
    ready: false,
    thinking: false,
    error: null,
    mode: 'worker', 
    stats: null,
    progress: null,
    threads: cores, 
    cores: cores
  });

  const setThreads = useCallback((n: number) => {
      setState(s => ({ ...s, threads: Math.max(1, Math.min(s.cores, n)) }));
  }, []);

  useEffect(() => {
      const target = state.threads;
      cluster.current.forEach(t => t.kill());
      cluster.current = [];

      let readyCount = 0;
      const onThreadReady = () => {
          readyCount++;
          if (readyCount === target) {
              setState(s => ({ ...s, ready: true, error: null }));
          }
      };

      try {
          for (let i = 0; i < target; i++) {
              const thread = new Thread(
                  i,
                  (data) => {
                      if (data.signal === Signal.Ready) onThreadReady();
                      if (activeRouter.current) activeRouter.current(i, data);
                  },
                  (err) => {
                      console.error(`Thread ${i} Died`, err);
                      setState(s => ({ ...s, error: `Thread ${i} Crashed` }));
                  }
              );
              cluster.current.push(thread);
          }
      } catch (e) {
          console.error("Cluster Boot Failed", e);
          setState(s => ({ ...s, error: "Cluster Init Failed" }));
      }

      return () => {
          cluster.current.forEach(t => t.kill());
          activeRouter.current = null;
      };
  }, [state.threads]);

  const activeRouter = useRef<((id: number, data: Outbox) => void) | null>(null);

  const think = useCallback((
      board: Board, 
      side: Side, 
      depth: number, 
      history: bigint[], 
      book: boolean, 
      callback: (move: number, stats: Telemetry) => void, 
      purge: boolean = false,
      tuning?: Tuning
  ) => {
    
    setState(s => ({ ...s, thinking: true, error: null, progress: null }));
    const startTime = performance.now();

    // 1. Generate Root Candidates
    const genStart = 0;
    const genEnd = Engine.Gen.generate(board, side, genStart);
    const allMoves: number[] = [];
    for (let i = genStart; i < genEnd; i++) {
        const m = Engine.Memory.BUFFER[i];
        if (Engine.Query.legal(board, m >> 8, m & 0xFF, side)) allMoves.push(m);
    }

    if (allMoves.length === 0) {
        setState(s => ({ ...s, thinking: false, error: "Stalemate/Mate" }));
        return;
    }

    // 2. Distribute Work (Round-Robin / Card Dealing)
    const activeThreads = cluster.current;
    const threadCount = activeThreads.length;
    
    // Initialize buckets
    const buckets: number[][] = Array.from({ length: threadCount }, () => []);
    
    // Deal moves to buckets (0, 1, 2... 0, 1, 2...)
    // This balances hard moves (usually at start of list) across all workers
    allMoves.forEach((move, index) => {
        const workerIndex = index % threadCount;
        buckets[workerIndex].push(move);
    });

    let pending = threadCount;
    // Handle edge case where moves < threads
    if (allMoves.length < threadCount) {
        pending = allMoves.length;
    }

    let totalNodes = 0;
    let bestGlobal: { move: number, score: number } | null = null;

    activeRouter.current = (id, data) => {
        if (data.signal === Signal.Feedback) {
            if (id === 0) { 
                setState(s => ({ ...s, progress: { ...data.telemetry, workers: threadCount } }));
            }
        } else if (data.signal === Signal.Moved) {
            pending--;
            totalNodes += data.telemetry.nodes;

            if (data.move !== 0) {
                if (!bestGlobal || (data.score > bestGlobal.score)) {
                    bestGlobal = { move: data.move, score: data.score };
                }
            }

            if (pending === 0) {
                const duration = performance.now() - startTime;
                
                if (bestGlobal) {
                    const finalStats: Telemetry = {
                        nodes: totalNodes,
                        time: duration,
                        depth: depth,
                        score: bestGlobal.score,
                        best: bestGlobal.move,
                        rate: Math.round((totalNodes / Math.max(1, duration)) * 1000),
                        workers: threadCount
                    };
                    setState(s => ({ ...s, thinking: false, stats: finalStats, progress: null }));
                    callback(finalStats.best!, finalStats);
                } else {
                    setState(s => ({ ...s, thinking: false, error: "No Consensus" }));
                }
                activeRouter.current = null;
            }
        }
    };

    activeThreads.forEach((thread, index) => {
        // If we have fewer moves than threads, some threads get empty buckets
        const slice = buckets[index];
        if (slice.length === 0) {
             // Don't send empty work, it confuses the reducer logic if we expect N responses
             // Actually, simplest is to send it, worker returns immediately with 0 nodes.
        }

        const payload: Inbox = {
            command: Command.Think,
            board: board,
            side: side,
            depth: depth,
            history: history,
            book: book,
            purge: purge, // PASS PURGE CORRECTLY
            tuning: tuning,
            candidates: slice, 
            id: index
        };
        thread.send(payload);
    });

  }, [state.threads]);

  return useMemo(() => ({
    ready: state.ready,
    thinking: state.thinking,
    error: state.error,
    stats: state.stats,
    progress: state.progress,
    threads: state.threads,
    cores: state.cores,
    setThreads,
    think,
    mode: state.mode
  }), [state, setThreads, think]);
};
