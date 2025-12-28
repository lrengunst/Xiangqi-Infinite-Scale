
import { useState, useCallback, useRef, useMemo } from 'react';
import { Types, Factory, Flow, Query, Snapshot, Hash, Codec, Space } from '../engine';
import { Telemetry } from '../worker/protocol';

export interface LogEntry {
    text: string;
    telemetry?: Telemetry;
}

export interface Machine {
  board: Types.Board;
  turn: Types.Side;
  history: string[]; 
  hashes: bigint[];
  logs: LogEntry[];    
  cursor: number;
  over: string | null;
  trace: { from: number; to: number; piece: number } | null; 
  move: (source: number, target: number, text: string, stats?: Telemetry) => void;
  sync: (fen: string) => void;
  load: (sequence: string[], entries: LogEntry[]) => void; // NEW API
  reset: () => void;
  jump: (index: number) => void; 
  resume: (index: number) => void;
}

export const useMatch = (): Machine => {
  const [board, setBoard] = useState<Types.Board>(Factory.genesis());
  const [turn, setTurn] = useState<Types.Side>(Types.Side.Red);
  
  const [history, setHistory] = useState<string[]>([Snapshot.serialize(Factory.genesis())]);
  const [hashes, setHashes] = useState<bigint[]>([Hash.compute(Factory.genesis(), Types.Side.Red)]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [cursor, setCursor] = useState<number>(0);
  const [over, setOver] = useState<string | null>(null);
  const [trace, setTrace] = useState<{ from: number; to: number; piece: number } | null>(null);

  // STRICT RULESET VERIFICATION
  const verify = (current: Types.Board, side: Types.Side, pool: bigint[]) => {
       const next = side === Types.Side.Red ? Types.Side.Black : Types.Side.Red;
       
       // 1. Checkmate & Stalemate (In Xiangqi, Stalemate is LOSS for the one unable to move)
       if (Query.mate(current, next)) {
        setOver(side === Types.Side.Red ? "RED WINS" : "BLACK WINS");
        return next;
       }

       // 2. Repetition Rules (3-fold)
       // We scan backwards to count occurrences of the current hash.
       const hash = pool[pool.length - 1];
       let count = 0;
       for (const h of pool) { if (h === hash) count++; }
       
       if (count >= 3) {
           // ANTI-PERPETUAL CHECK:
           // If the side that just moved (side) puts the opponent (next) in check 
           // and causes a repetition -> They LOSE immediately.
           if (Query.threat(current, next)) {
               const winner = side === Types.Side.Red ? "BLACK" : "RED";
               setOver(`${winner} WINS (PERPETUAL CHECK)`);
           } else {
               // Honest repetition (neither side can force a win)
               setOver("DRAW (REPETITION)");
           }
       }
       return next;
  };

  const move = useCallback((source: number, target: number, text: string, stats?: Telemetry) => {
    if (over) return;
    if (cursor !== history.length - 1) return;

    setBoard(current => {
      const mover = current[source];
      const captured = current[target]; // Capture state BEFORE apply
      
      // REFACTOR: Pass primitives directly. Zero Allocation call.
      const next = Flow.apply(current, source, target);
      
      // OPTIMIZATION: Incremental Hashing (O(1)) instead of Hash.compute (O(N))
      const lastHash = hashes[hashes.length - 1];
      const moveInt = (source << 8) | target;
      
      const hash = Hash.modify(lastHash, next, moveInt, captured);
      
      const pool = [...hashes, hash];
      const side = verify(next, turn, pool);

      const fen = Snapshot.serialize(next);
      const stack = [...history, fen];
      
      setHistory(stack);
      setHashes(pool);
      setLogs(l => [...l, { text, telemetry: stats }]);
      setTurn(side);
      setCursor(stack.length - 1);
      setTrace({ from: source, to: target, piece: mover });
      
      return next;
    });
  }, [turn, hashes, over, cursor, history]);

  // NEW: Load Full Sequence (For Archives/Openings)
  const load = useCallback((sequence: string[], entries: LogEntry[]) => {
      // 1. Reconstruct Hashes for integrity
      // This ensures if the user continues playing from this line, the repetition check works correctly.
      const pool: bigint[] = [];
      
      // O(N) reconstruction where N is opening length (small, < 20)
      for (let i = 0; i < sequence.length; i++) {
          const b = Snapshot.parse(sequence[i]);
          // Index 0 (Genesis) = Red Turn for Hash calculation
          // Index 1 (After Red Move) = Black Turn for Hash calculation
          // Note: Hash.compute takes the side *to move*
          const side = i % 2 === 0 ? Types.Side.Red : Types.Side.Black;
          pool.push(Hash.compute(b, side));
      }

      // 2. Set State
      setHistory(sequence);
      setLogs(entries);
      setHashes(pool);
      
      // 3. Set Active Board to END of sequence
      const lastFen = sequence[sequence.length - 1];
      setBoard(Snapshot.parse(lastFen));
      setCursor(sequence.length - 1);
      
      // 4. Set Next Turn
      const nextTurn = sequence.length % 2 === 0 ? Types.Side.Red : Types.Side.Black;
      setTurn(nextTurn);
      
      // 5. Clear artifacts
      setOver(null);
      setTrace(null);
  }, []);

  const sync = useCallback((fen: string) => {
      if (over) return;
      setTrace(null); 

      const next = Snapshot.parse(fen);
      
      // Calculate Diff to generate Log Text
      // This is crucial for the Auditor to track P2P games correctly
      const lastFen = history[history.length - 1];
      const prev = Snapshot.parse(lastFen);
      
      // LOGIC FIX: Turn Parity
      // Length 1 (Start) -> Even Index 0.
      // Length 2 (After 1 move) -> Odd Index 1 -> Black's turn.
      const stackLength = history.length + 1;
      const nextTurn = stackLength % 2 === 0 ? Types.Side.Black : Types.Side.Red;
      const currentMover = nextTurn === Types.Side.Red ? Types.Side.Black : Types.Side.Red; // Who just moved?

      let text = "REMOTE: MOVED";
      let s = -1, t = -1;
      
      // O(1) Diff Scan (90 iterations)
      for(let i=0; i<90; i++) {
          const p1 = prev[i];
          const p2 = next[i];
          if (p1 !== p2) {
              // Piece left? (Source)
              if (p1 !== 0 && p2 === 0 && Codec.side(p1) === currentMover) s = i;
              // Piece arrived? (Target)
              if (p2 !== 0 && Codec.side(p2) === currentMover) t = i;
          }
      }
      
      if (s !== -1 && t !== -1) {
          const role = Codec.role(next[t]);
          const sideStr = currentMover === Types.Side.Red ? "RED" : "BLACK";
          text = `${sideStr}: ${role} (${Space.file(s)},${Space.rank(s)}) > (${Space.file(t)},${Space.rank(t)})`;
      }

      setBoard(next);
      
      const hash = Hash.compute(next, nextTurn);
      const pool = [...hashes, hash];
      
      setLogs(l => [...l, { text }]);
      
      const stack = [...history, fen];
      setHistory(stack);
      setHashes(pool);
      
      setTurn(nextTurn);
      setCursor(stack.length - 1);
      
      // Verify remote move logic (Duplicate verification for Client B)
      const hashCount = pool.filter(h => h === hash).length;
      if (hashCount >= 3) {
          if (Query.threat(next, nextTurn)) {
              // Remote player spammed check -> We Win
              const winner = currentMover === Types.Side.Red ? "BLACK" : "RED";
              setOver(`${winner} WINS (PERPETUAL CHECK)`);
          } else {
              setOver("DRAW (REPETITION)");
          }
      } else if (Query.mate(next, nextTurn)) {
          setOver(nextTurn === Types.Side.Red ? "BLACK WINS" : "RED WINS");
      }

  }, [history, turn, hashes, over]);

  const reset = useCallback(() => {
    const genesis = Factory.genesis();
    const h = Hash.compute(genesis, Types.Side.Red);
    setBoard(genesis);
    setTurn(Types.Side.Red);
    setHistory([Snapshot.serialize(genesis)]);
    setHashes([h]);
    setLogs([]);
    setCursor(0);
    setOver(null);
    setTrace(null);
  }, []);

  const jump = useCallback((index: number) => {
    if (index < 0 || index >= history.length) return;
    const fen = history[index];
    const restored = Snapshot.parse(fen);
    setBoard(restored);
    // Index 0 (Len 1) -> Red. Index 1 (Len 2) -> Black.
    // So if index is Even -> Red. Odd -> Black.
    setTurn(index % 2 === 0 ? Types.Side.Red : Types.Side.Black);
    setCursor(index);
    setTrace(null);
  }, [history]);

  const resume = useCallback((index: number) => {
      if (index < 0 || index >= history.length - 1) return; 
      
      const stack = history.slice(0, index + 1);
      const pool = hashes.slice(0, index + 1);
      const slice = logs.slice(0, index);

      setHistory(stack);
      setHashes(pool);
      setLogs(slice);
      
      const fen = stack[index];
      setBoard(Snapshot.parse(fen));
      setTurn(index % 2 === 0 ? Types.Side.Red : Types.Side.Black);
      setCursor(index);
      setOver(null);
      setTrace(null);
  }, [history, hashes, logs]);

  return useMemo(() => ({
    board,
    turn,
    history,
    hashes,
    logs,
    cursor,
    over,
    trace,
    move,
    sync,
    load,
    reset,
    jump,
    resume
  }), [board, turn, history, hashes, logs, cursor, over, trace, move, sync, load, reset, jump, resume]);
};
