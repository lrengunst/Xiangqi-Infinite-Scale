
import React from 'react';
import { Palette, Typography, Effects } from '../../design/tokens';
import { Telemetry } from '../../worker/protocol';
import { Format } from '../../engine';

interface Props {
  ready: boolean;
  thinking: boolean;
  mode: 'worker' | 'main';
  error: string | null;
  progress?: Telemetry | null; // Live data
  stats?: Telemetry | null;    // Last run result
}

/**
 * @description  Network & Compute Status Monitor.
 * @atomic       ORGANISM
 */
export const Network: React.FC<Props> = React.memo(({ ready, thinking, mode, error, progress, stats }) => {
  
  // Status Logic O(1)
  const paint = error 
    ? Palette.Signal.Danger 
    : thinking 
      ? Palette.Signal.Active 
      : ready 
        ? Palette.Signal.Target 
        : Palette.App.Muted;

  const label = error 
    ? "ERROR" 
    : thinking 
      ? "NEURAL_LINK" 
      : ready 
        ? "ONLINE" 
        : "OFFLINE";

  // Data Selector: Prefer Live Progress -> Then Last Result -> Null
  const data = thinking ? progress : stats;
  const isLive = thinking;

  // Simple Decoder for PV Line
  const renderLine = (moves: number[]) => {
      return moves.slice(0, 6).map((m, i) => {
          const from = m >> 8;
          const to = m & 0xFF;
          return (
              <span key={i} className="mr-2 opacity-80 inline-block">
                  {from}-{to}
              </span>
          );
      });
  };

  return (
    <div 
      className={`
        w-full max-w-[600px] mx-auto mb-4 p-3 rounded-lg flex flex-col gap-2
        ${Effects.Shadow.Panel} transition-colors duration-500
      `}
      style={{
        backgroundColor: Palette.App.Background,
        border: `1px solid ${thinking ? Palette.Signal.Active : Palette.App.Panel}`,
        boxShadow: thinking ? `0 0 15px ${Palette.Signal.Active}20` : 'none'
      }}
    >
      <div className="flex items-center justify-between">
          {/* LED Indicator */}
          <div className="flex items-center gap-3">
            <div 
              className={`w-3 h-3 rounded-full ${thinking ? 'animate-pulse' : ''}`}
              style={{ 
                backgroundColor: paint,
                boxShadow: `0 0 8px ${paint}`
              }}
            />
            <span className={`${Typography.Font.Mono} ${Typography.Size.Xs} font-bold`} style={{ color: Palette.App.Text }}>
              SYSTEM: {label}
            </span>
          </div>

          {/* Mode Indicator */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className={`${Typography.Size.Xs} text-neutral-500`}>EXECUTION MODE</p>
              <p className={`${Typography.Size.Sm} ${Typography.Font.Mono} font-bold`} style={{ color: mode === 'worker' ? Palette.Signal.Target : Palette.Signal.Active }}>
                {mode === 'worker' ? 'WEB_WORKER' : 'MAIN_THREAD'}
              </p>
            </div>
            {error && (
                <div 
                    className="px-2 py-1 rounded text-xs font-bold"
                    style={{ backgroundColor: Palette.Signal.Danger, color: 'white' }}
                >
                    !
                </div>
            )}
          </div>
      </div>

      {/* TELEMETRY VISUALIZER (PERSISTENT) */}
      {data && (
          <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-white/10 animate-fade-in">
              <div className="flex justify-between items-end mb-1">
                  <span className="text-[10px] font-mono text-neutral-500">
                      {isLive ? 'COMPUTING...' : 'LAST_COMPUTATION'}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">
                      TIME: <span className="text-white">{Math.round(data.time)}ms</span>
                  </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col">
                    <span className="text-[9px] text-neutral-500 font-mono">DEPTH</span>
                    <span className={`text-xs font-bold font-mono ${data.isBook ? 'text-green-400' : 'text-yellow-500'}`}>
                        {data.isBook ? 'OPENING_BOOK' : `LAYER ${data.depth}`}
                    </span>
                </div>
                <div className="flex flex-col text-center">
                    <span className="text-[9px] text-neutral-500 font-mono">NODES</span>
                    <span className="text-xs font-bold text-white font-mono">
                        {data.isBook ? '---' : Format.metric(data.nodes)}
                    </span>
                </div>
                <div className="flex flex-col text-right">
                    <span className="text-[9px] text-neutral-500 font-mono">SCORE</span>
                    <span className={`text-xs font-bold font-mono ${data.score && data.score > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {data.isBook ? 'PERFECT' : `${data.score && data.score > 0 ? '+' : ''}${data.score}`}
                    </span>
                </div>
              </div>
              
              {/* PV LINE VISUALIZATION */}
              {data.line && data.line.length > 0 && !data.isBook && (
                  <div className="text-[10px] font-mono text-neutral-400 truncate mt-1 p-2 bg-black/20 rounded border border-white/5">
                      <span className="text-yellow-500 mr-2 font-bold">> PV:</span>
                      {renderLine(data.line)}
                  </div>
              )}

              {/* Progress Bar */}
              {isLive && !data.isBook ? (
                  <div className="col-span-3 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                      <div 
                        className="h-full bg-yellow-500 transition-all duration-300 ease-out"
                        style={{ width: `${Math.min(100, (data.depth || 0) * 15)}%` }}
                      />
                  </div>
              ) : (
                  <div className="col-span-3 h-[1px] bg-white/10 mt-1" />
              )}
          </div>
      )}
    </div>
  );
});

Network.displayName = 'Network';
