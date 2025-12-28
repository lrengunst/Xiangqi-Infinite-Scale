
import React, { useState } from 'react';
import { Palette, Typography, Effects } from '../../design/tokens';
import { Telemetry } from '../../worker/protocol';
import { Button } from '../atoms/Button';
import { Codex, Hash, Snapshot, Types, Codec, Consts, Space, Format } from '../../engine';
import { LogEntry } from '../../hooks/match'; 
import { Cortex } from '../molecules/Cortex';

interface Props {
  stats: Telemetry | null;
  progress: Telemetry | null;
  targetDepth: number;
  fen: string;
  logs: LogEntry[]; 
  history: string[];
  thinking: boolean;
  compute: () => void;
}

export const Analyzer: React.FC<Props> = React.memo(({ stats, progress, targetDepth, fen, logs, history, thinking, compute }) => {
  const [open, toggle] = useState(false);

  // Selector: Use live data if thinking, else final stats
  const activeData = thinking ? progress : stats;

  if (!open) {
      return (
          <div 
            className={`fixed bottom-0 left-0 p-2 px-4 rounded-tr-xl cursor-pointer transition-all border-t border-r border-yellow-500/30 bg-black/90 hover:bg-black hover:border-yellow-500 ${Effects.Shadow.Panel}`}
            style={{ zIndex: 999 }}
            onClick={() => toggle(true)}
          >
              <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${thinking ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                  <span className={`${Typography.Font.Mono} text-[10px] font-bold tracking-widest text-yellow-500`}>
                      A.R.E.S_BRAIN
                  </span>
              </div>
          </div>
      );
  }

  const rate = activeData && activeData.time > 0 
    ? Format.metric(Math.round((activeData.nodes / activeData.time) * 1000))
    : '0';

  const copy = () => {
      navigator.clipboard.writeText(fen);
      alert("FEN COPIED");
  };

  const dump = () => {
      const content = logs.map((entry, index) => {
          let line = `${index + 1}. ${entry.text}`;
          if (entry.telemetry) {
              const { score, depth, nodes, time, rate, hits } = entry.telemetry;
              const displayScore = score !== undefined ? (score > 0 ? `+${score}` : score) : 'N/A';
              line += ` | SCORE: ${displayScore} DEPTH: ${depth} NODES: ${Format.metric(nodes)} HITS: ${Format.metric(hits || 0)} TIME: ${Math.round(time)}ms NPS: ${Format.metric(rate || 0)}`;
          }
          return line;
      }).join('\n');
      navigator.clipboard.writeText(content);
      alert("RICH TELEMETRY LOGS COPIED TO CLIPBOARD");
  };

  const exportLib = () => {
      if (!history || history.length < 2) {
          alert("Need a move history to export.");
          return;
      }
      let sourceCode = `// NEW OPENING LINE (${new Date().toLocaleDateString()})\n[\n`;
      const binaryData: number[] = [];
      try {
          for (let index = 0; index < history.length - 1; index++) {
              const prev = Snapshot.parse(history[index]);
              const next = Snapshot.parse(history[index + 1]);
              const turn = index % 2 === 0 ? Types.Side.Red : Types.Side.Black;
              let source = -1;
              let target = -1;
              for (let k = 0; k < Consts.SIZE; k++) {
                  if (prev[k] !== next[k]) {
                      if (prev[k] !== 0 && Codec.side(prev[k]) === turn && next[k] === 0) source = k;
                      if (next[k] !== 0 && Codec.side(next[k]) === turn) target = k;
                  }
              }
              if (source !== -1 && target !== -1) {
                  const sv = Space.expand(source);
                  const tv = Space.expand(target);
                  const sidePrefix = turn === Types.Side.Red ? "R" : "B";
                  sourceCode += `    [${sv.x}, ${sv.y}, ${tv.x}, ${tv.y}], // ${sidePrefix}\n`;
                  binaryData.push(source);
                  binaryData.push(target);
              }
          }
          sourceCode += `]`;
          navigator.clipboard.writeText(sourceCode);
          alert("LIBRARY DATA COPIED");
      } catch (e) {
          alert("EXPORT FAILED");
      }
  };

  const imprint = () => {
      if (!stats || !stats.best) {
          alert("AI needs to think first!");
          return;
      }
      const turn = logs.length % 2 === 0 ? Types.Side.Red : Types.Side.Black;
      const board = Snapshot.parse(fen);
      const hash = Hash.compute(board, turn);
      Codex.imprint(hash, stats.best);
      alert("LESSON LEARNED!");
  };

  const purge = () => {
      if (confirm("WARNING: COMPLETE MEMORY WIPE?")) {
          Codex.wipe();
          alert("SYSTEM FORMATTED.");
      }
  };

  const percent = thinking && activeData 
      ? Math.min(100, ((activeData.depth || 0) / targetDepth) * 100) 
      : 0;

  // CPU LOAD DISPLAY LOGIC
  const getLoadText = () => {
      if (thinking) {
          if (activeData?.workers && activeData.workers > 1) {
              return `${activeData.workers} THREADS (ACTIVE)`;
          }
          return "MAIN_THREAD (BUSY)"; // Fallback message
      }
      return "IDLE";
  };

  return (
    <div 
      className={`fixed bottom-4 left-4 p-4 rounded-lg border w-[320px] flex flex-col gap-4 z-50 animate-fade-in ${Effects.Shadow.Panel} max-h-[80vh] overflow-y-auto`}
      style={{ 
          backgroundColor: Palette.App.Panel,
          borderColor: Palette.Signal.Active,
          color: Palette.App.Text
      }}
    >
        <div className="flex justify-between items-center border-b border-white/10 pb-2 sticky top-0 bg-inherit z-10">
            <h4 className={`${Typography.Font.Mono} text-xs font-bold text-yellow-500 tracking-widest`}>
                NEURAL_ANALYZER
            </h4>
            <div className="cursor-pointer text-[10px] font-mono hover:text-red-500 px-2" onClick={() => toggle(false)}>
                [MINIMIZE]
            </div>
        </div>

        {activeData ? (
            <div className={`grid grid-cols-2 gap-y-2 gap-x-4 ${Typography.Font.Mono} text-xs`}>
                <div className="opacity-50">NODES_VISITED</div>
                <div className="text-right font-bold text-white">{Format.metric(activeData.nodes)}</div>
                
                <div className="opacity-50">EXEC_TIME</div>
                <div className="text-right font-bold text-yellow-500">{Math.round(activeData.time)}ms</div>
                
                <div className="opacity-50">SPEED (RATE)</div>
                <div className="text-right font-bold text-green-500">{rate}</div>

                <div className="opacity-50">DATA_SOURCE</div>
                <div className={`text-right font-bold ${activeData.isBook ? 'text-green-400' : 'text-red-400'}`}>
                    {activeData.isBook ? 'OPENING_BOOK' : 'RAW_COMPUTE'}
                </div>
                
                <div className="opacity-50">CPU_LOAD</div>
                <div className={`text-right font-bold ${thinking ? 'text-yellow-500 animate-pulse' : 'text-neutral-500'}`}>
                    {getLoadText()}
                </div>
            </div>
        ) : (
            <div className="text-xs opacity-30 font-mono text-center py-2 border border-dashed border-white/10 rounded">
                AWAITING_TELEMETRY...
            </div>
        )}

        <Cortex fen={fen} stats={activeData} />

        <div className="border-t border-white/10 pt-3 flex flex-col gap-3">
            <div>
                <p className="text-[10px] font-mono opacity-50 mb-1 uppercase">Snapshot (FEN)</p>
                <div 
                    className="text-[10px] font-mono p-2 bg-black/40 rounded border border-white/5 break-all cursor-pointer hover:border-yellow-500/50 transition-colors"
                    onClick={copy}
                >
                    {fen.substring(0, 35)}...
                </div>
            </div>
            
            {thinking ? (
                <div className="flex flex-col gap-2 p-2 bg-black/40 rounded border border-yellow-500/30">
                    <div className="flex justify-between items-end">
                        <span className="text-[9px] font-mono text-yellow-500 animate-pulse">
                            CALCULATING...
                        </span>
                        <span className="text-[9px] font-mono text-white font-bold">
                            DEPTH {activeData?.depth || 0} / {targetDepth}
                        </span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-yellow-500 transition-all duration-300 ease-out shadow-[0_0_10px_#eab308]"
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                    <div className="text-[8px] font-mono text-neutral-500 text-center">
                        {activeData?.workers && activeData.workers > 1 ? 'DISTRIBUTING_TASKS' : 'MAIN_THREAD_SLICING'}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-2">
                    <Button label="COMPUTE" size="small" variant="primary" action={compute} />
                    <Button label="LOGS" size="small" variant="secondary" action={dump} />
                    <Button label="TEACH" size="small" variant="secondary" action={imprint} disabled={!stats?.best} />
                    <Button label="EXPORT LIB" size="small" variant="secondary" action={exportLib} />
                    <div className="col-span-2 mt-2">
                        <Button label="PURGE MEMORY" size="small" variant="danger" action={purge} />
                    </div>
                </div>
            )}
        </div>
    </div>
  );
});

Analyzer.displayName = 'Analyzer';
