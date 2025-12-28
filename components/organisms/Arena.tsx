
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Grid } from '../atoms/Grid';
import { Slot } from '../molecules/Slot';
import { Trace } from '../molecules/Trace';
import { Scanner } from '../molecules/Scanner';
import { Assist } from '../molecules/Assist';
import { Gauge } from '../molecules/Gauge'; 
import { Types, Query, Space, Consts, Codec, Review } from '../../engine';
import { Palette, Spacing, Effects, Layer } from '../../design/tokens';
import * as Sound from '../../design/sound';
import { useViewport } from '../../hooks/viewport';
import { Telemetry } from '../../worker/protocol';

interface Bridge {
    ready: boolean;
    thinking: boolean;
    error: string | null;
    think: (board: Types.Board, side: Types.Side, depth: number, history: bigint[], book: boolean, cb: (m: number, t: Telemetry) => void, purge: boolean, tuning?: Types.Tuning) => void;
    mode: 'worker' | 'main';
    progress: Telemetry | null;
    stats: Telemetry | null; 
}

interface Props {
    board: Types.Board;
    turn: Types.Side;
    over: string | null;
    depth: number;
    book: boolean; 
    pilots: { red: 'human' | 'ai'; black: 'human' | 'ai' };
    worker: Bridge;
    trace: { from: number; to: number; piece: number } | null;
    step: (source: number, target: number, text: string, stats?: Telemetry) => void;
    assist?: boolean; 
    history: bigint[]; 
    flip: boolean;
    tuning: Types.Tuning;
    haptics: boolean;
    coords: boolean; // NEW
    fx: boolean;     // NEW
}

export const Arena: React.FC<Props> = React.memo(({ board, turn, over, depth, book, pilots, worker, trace, step, assist = false, history, flip, tuning, haptics, coords, fx }) => {
  const [active, setActive] = useState<number | null>(null);
  const [marks, setMarks] = useState<number[]>([]); 
  const [hints, setHints] = useState<Review.Hint[]>([]); 
  
  // LIQUID INTERFACE INTEGRATION
  const { scope, metric } = useViewport();
  
  const surface = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLDivElement>(null); 

  const vibrate = useCallback((pattern: number | number[]) => {
      if (haptics && typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(pattern);
      }
  }, [haptics]);

  // Get current score for Gauge
  const currentScore = worker.thinking && worker.progress?.score !== undefined 
      ? worker.progress.score 
      : worker.stats?.score !== undefined 
          ? worker.stats.score 
          : 0;

  // ANALYSIS EFFECT
  useEffect(() => {
      if (!assist || over || worker.thinking) {
          setHints([]);
          return;
      }
      const driver = turn === Types.Side.Red ? pilots.red : pilots.black;
      if (driver === 'human') {
          const timer = setTimeout(() => {
              const analysis = Review.scan(board, turn);
              setHints(analysis);
          }, 10);
          return () => clearTimeout(timer);
      } else {
          setHints([]);
      }
  }, [board, turn, assist, over, worker.thinking, pilots]);

  // AI THINKING EFFECT
  useEffect(() => {
    if (over) return;
    const driver = turn === Types.Side.Red ? pilots.red : pilots.black;

    if (driver === 'ai' && worker.ready && !worker.thinking) {
        const delay = pilots.red === 'ai' && pilots.black === 'ai' ? 500 : 0;
        const timer = setTimeout(() => {
            worker.think(board, turn, depth, history, book, (move, stats) => {
                const source = move >> 8;
                const target = move & 0xFF;
                const role = Codec.role(board[source]);
                const side = turn === Types.Side.Red ? "RED" : "BLACK";
                
                const text = `${side}: ${role} (${Space.file(source)},${Space.rank(source)}) > (${Space.file(target)},${Space.rank(target)})`;
    
                if (board[target] !== 0) { Sound.play('capture'); vibrate(40); }
                else { Sound.play('move'); vibrate(10); }
    
                step(source, target, text, stats);
            }, false, tuning); 
        }, delay);
        return () => clearTimeout(timer);
    }
  }, [board, turn, over, worker.ready, depth, pilots, history, book, tuning, vibrate, worker]); // Added 'worker' dependency

  const interact = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (over || worker.thinking) return;
    const driver = turn === Types.Side.Red ? pilots.red : pilots.black;
    if (driver !== 'human') return;
    if (!field.current) return;

    const cx = 'touches' in event ? event.touches[0].clientX : (event as React.MouseEvent).clientX;
    const cy = 'touches' in event ? event.touches[0].clientY : (event as React.MouseEvent).clientY;
    const box = field.current.getBoundingClientRect();
    
    const width = box.width / Consts.WIDTH;
    const height = box.height / Consts.HEIGHT;

    let column = Math.floor((cx - box.left) / width);
    let row = Math.floor((cy - box.top) / height);

    if (flip) {
        column = Consts.WIDTH - 1 - column;
        row = Consts.HEIGHT - 1 - row;
    }

    const index = row * Consts.WIDTH + column;
    if (!Space.bound(index)) return;

    const piece = board[index];

    if (piece !== 0 && Codec.side(piece) === turn) {
      setActive(index);
      Sound.play('select');
      const stack: number[] = [];
      for (let target = 0; target < Consts.SIZE; target++) {
          if (Query.legal(board, index, target, turn)) stack.push(target);
      }
      setMarks(stack);
      return;
    }

    if (active !== null) {
      if (Query.legal(board, active, index, turn)) {
        const role = Codec.role(board[active]);
        const side = turn === Types.Side.Red ? "RED" : "BLACK";
        const text = `${side}: ${role} (${Space.file(active)},${Space.rank(active)}) > (${Space.file(index)},${Space.rank(index)})`;
        step(active, index, text);
        setActive(null);
        setMarks([]);
        if (board[index] !== 0) { Sound.play('capture'); vibrate(40); }
        else { Sound.play('move'); vibrate(10); }
      } else {
        setActive(null);
        setMarks([]);
      }
    }
  }, [board, turn, active, over, worker.thinking, step, pilots, flip, vibrate]);

  return (
    <div 
      ref={scope}
      className="w-full aspect-[9/10] max-h-[85vh] flex items-center justify-center p-2 relative mx-auto gap-4"
    >
      {/* LEFT GUTTER: GAUGE */}
      <div 
        className="h-full flex-shrink-0 py-4 opacity-80"
        style={{ height: metric.height || '100%' }}
      >
          <Gauge score={currentScore} flip={flip} />
      </div>

      <div 
        ref={surface}
        className={`relative rounded-lg select-none overflow-hidden touch-none ${Effects.Shadow.Panel} p-6 md:p-10`}
        style={{ 
            width: metric.width || '100%',
            height: metric.height || '100%',
            backgroundColor: Palette.Board.Surface, 
            border: `${Spacing.Border.Heavy} solid ${Palette.Board.Border}`,
            opacity: metric.width > 0 ? 1 : 0,
            transition: 'opacity 0.2s ease-in'
        }}
        onClick={interact}
      >
        <div 
            ref={field} 
            className="relative w-full h-full transition-transform duration-500 ease-in-out"
            style={{ transform: flip ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
            <Grid coords={coords} />
            {fx && worker.thinking && <Scanner />}
            {assist && !worker.thinking && <Assist hints={hints} />}
            {trace && <Trace from={trace.from} to={trace.to} piece={trace.piece} />}

            <div className={`absolute inset-0 pointer-events-none ${Effects.Transition.Medium}`} style={{ zIndex: Layer.Piece, opacity: worker.thinking ? 0.9 : 1 }}>
            {Array.from(Consts.INDICES).map((index) => (
                <Slot key={index} index={index} value={board[index]} selected={active === index} target={marks.includes(index)} flip={flip} />
            ))}
            </div>
        </div>

        {over && <div className="absolute inset-0 flex items-center justify-center animate-fade-in z-50 bg-black/70 backdrop-blur-sm"><div className="text-3xl font-black tracking-widest p-6 rounded-xl bg-neutral-900 border-2 border-yellow-500 text-yellow-500">{over}</div></div>}
      </div>
    </div>
  );
});

Arena.displayName = 'Arena';
