
import React, { useEffect, useRef } from 'react';
import { Palette, Spacing, Typography, Effects } from '../../design/tokens';
import { Button } from '../atoms/Button';
import { Snapshot, Codec, Consts, Codex, Hash, Types } from '../../engine';
import { LogEntry } from '../../hooks/match'; // Import Type

interface Props {
  moves: LogEntry[]; // UPDATED TYPE
  history: string[]; 
  current: number; 
  jump: (index: number) => void;
  resume: (index: number) => void;
}

/**
 * @description  Battle Timeline & Scrubber.
 * @style        Video Editor / Sci-Fi Timeline.
 * @atomic       ORGANISM
 */
export const History: React.FC<Props> = React.memo(({ moves, history, current, jump, resume }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const latest = current === moves.length - 1;

  useEffect(() => {
    if (scrollRef.current && latest) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moves, current, latest]);

  // INTELLIGENCE MODULE: Bulk Learning
  const memorize = () => {
      // history[0] is Genesis. history[1] is after Move 1.
      if (history.length < 2) {
          alert("Nothing to learn yet.");
          return;
      }
      
      if (!confirm(`Are you sure you want to teach A.R.E.S this entire sequence (${history.length - 1} moves)?\nExisting knowledge for these positions will be overwritten.`)) {
          return;
      }

      let learned = 0;

      try {
          for (let index = 0; index < history.length - 1; index++) {
              const fenPrev = history[index];
              const fenNext = history[index + 1];
              
              const prev = Snapshot.parse(fenPrev);
              const next = Snapshot.parse(fenNext);
              
              // Determine Turn: 
              // index=0 (Genesis) -> Red to move. index=1 -> Black to move.
              const turn = index % 2 === 0 ? Types.Side.Red : Types.Side.Black;
              
              // Calculate Hash of the position BEFORE the move
              const hash = Hash.compute(prev, turn);
              
              // Derive Move (Diffing)
              let source = -1;
              let target = -1;
              
              for (let k = 0; k < Consts.SIZE; k++) {
                  const p1 = prev[k];
                  const p2 = next[k];
                  
                  if (p1 !== p2) {
                      // Piece left this square?
                      if (p1 !== 0 && Codec.side(p1) === turn && p2 === 0) {
                          source = k;
                      }
                      // Piece arrived at this square?
                      // Case 1: Empty -> Piece (Move)
                      // Case 2: Enemy -> Piece (Capture)
                      if (p2 !== 0 && Codec.side(p2) === turn) {
                          target = k;
                      }
                  }
              }
              
              if (source !== -1 && target !== -1) {
                  const move = (source << 8) | target;
                  Codex.imprint(hash, move);
                  learned++;
              }
          }
          alert(`NEURAL UPDATE COMPLETE.\nAbsorbed ${learned} tactical patterns into permanent memory.`);
      } catch (e) {
          console.error(e);
          alert("NEURAL UPLOAD FAILED. Check console.");
      }
  };

  return (
    <div 
      className={`
        w-full max-w-[600px] mx-auto mt-0 rounded-xl overflow-hidden relative flex flex-col
        ${Effects.Shadow.Panel}
      `}
      style={{
          backgroundColor: Palette.App.Panel,
          border: `1px solid ${Palette.App.Muted}`,
          height: '360px'
      }}
    >
      {/* 1. Header & Scrubber */}
      <div 
        className="px-4 py-3 border-b flex flex-col gap-2"
        style={{ 
            backgroundColor: Palette.App.Background, 
            borderColor: Palette.App.Muted 
        }}
      >
        <div className="flex justify-between items-center">
            <span className={`${Typography.Size.Xs} ${Typography.Weight.Bold} text-neutral-400 tracking-wider`}>
            TIMELINE
            </span>
            <div className="flex gap-2 items-center">
                {/* MEMORIZE BUTTON */}
                <button 
                    onClick={memorize}
                    className={`${Typography.Font.Mono} text-[10px] text-yellow-500 hover:text-yellow-400 border border-yellow-500/30 hover:border-yellow-500 px-2 py-0.5 rounded transition-colors`}
                    title="Save current game to AI Memory"
                >
                    [MEMORIZE_GAME]
                </button>
                <span className={`${Typography.Size.Xs} ${Typography.Font.Mono} text-neutral-500`}>
                TURN: {current + 1} / {moves.length}
                </span>
            </div>
        </div>

        {/* Range Slider (The Scrubber) */}
        <div className="relative w-full h-6 flex items-center">
            <div className="absolute w-full h-1 bg-neutral-700 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-yellow-500 transition-all duration-300"
                    style={{ width: `${((current + 1) / Math.max(1, moves.length)) * 100}%` }}
                />
            </div>
            <input 
                type="range"
                min={-1}
                max={moves.length - 1}
                value={current}
                onChange={(e) => jump(parseInt(e.target.value))}
                className="absolute w-full h-full opacity-0 cursor-pointer"
            />
            {/* Ticks */}
            {moves.length > 0 && (
                <div 
                    className="absolute w-2 h-4 bg-white rounded-sm pointer-events-none transition-all duration-100"
                    style={{ 
                        left: `${((current + 1) / Math.max(1, moves.length)) * 100}%`,
                        transform: 'translateX(-50%)',
                        boxShadow: '0 0 10px white'
                    }}
                />
            )}
        </div>
      </div>

      {/* 2. List View (Log) */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-2 scrollbar-hide pb-12 bg-black/20"
      >
        {moves.length === 0 && current === -1 ? (
            <div className="text-center py-4 text-neutral-600 text-sm italic">
                Timeline Empty...
            </div>
        ) : (
            <div className="flex flex-col gap-1">
                 <div 
                    className={`px-2 py-1 rounded cursor-pointer ${Typography.Font.Mono} ${Typography.Size.Xs} flex justify-between`}
                    style={{
                        backgroundColor: -1 === current ? Palette.Signal.Active : 'transparent',
                        color: -1 === current ? 'black' : Palette.App.Text,
                        opacity: -1 === current ? 1 : 0.5
                    }}
                    onClick={() => jump(-1)} 
                >
                     <span className="w-8">0.</span>
                     <span className="flex-1">GENESIS</span>
                </div>

                {moves.map((entry, index) => (
                    <div 
                        key={index}
                        className={`
                            px-2 py-1 rounded cursor-pointer ${Typography.Font.Mono} ${Typography.Size.Xs} flex justify-between items-center transition-colors
                        `}
                        style={{
                            backgroundColor: index === current ? Palette.Signal.Active : 'transparent',
                            color: index === current ? 'black' : (index > current ? Palette.App.Muted : Palette.App.Text),
                            borderLeft: index === current ? '2px solid white' : '2px solid transparent'
                        }}
                        onClick={() => jump(index)}
                    >
                        <span className="opacity-50 w-8">{index + 1}.</span>
                        <span className="flex-1 font-bold">{entry.text}</span>
                        {/* SCORE INDICATOR */}
                        {entry.telemetry?.score !== undefined && (
                            <span className={`text-[9px] px-1 rounded ${index === current ? 'bg-black/20' : 'bg-white/10'} opacity-70`}>
                                {entry.telemetry.score > 0 ? '+' : ''}{entry.telemetry.score}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* 3. Resume Action */}
      {!latest && (
          <div 
            className="absolute bottom-0 left-0 w-full p-2 flex justify-center backdrop-blur-sm bg-black/60 border-t border-yellow-500/30"
            style={{ zIndex: 10 }}
          >
              <Button 
                label="FORK TIMELINE" 
                variant="primary" 
                size="small"
                action={() => resume(current + 1)}
              />
          </div>
      )}
    </div>
  );
});

History.displayName = 'History';
