
import React, { useMemo } from 'react';
import { Space, Review } from '../../engine';
import { Palette, Layer, Typography } from '../../design/tokens';
import { Unit } from '../atoms/Unit';

interface Props {
  hints: Review.Hint[];
  opacity?: number;
}

/**
 * @description  Augmented Reality Tactical Overlay.
 * @purpose      Visualizes moves and their refutations (Why is it a trap?).
 * @atomic       MOLECULE
 */
export const Assist: React.FC<Props> = React.memo(({ hints, opacity = 0.6 }) => {
  
  const bestOutcome = useMemo(() => {
      if (hints.length === 0) return 0;
      return Math.max(...hints.map(h => h.score));
  }, [hints]);

  if (hints.length === 0) return null;

  const COLORS = {
      BEST: Palette.Signal.Target,
      ALT:  '#06b6d4',
      WARN: Palette.Signal.Active,
      TRAP: Palette.Signal.Danger,
      MATE: '#a855f7'
  };

  const getColor = (kind: string) => {
      switch(kind) {
          case 'best': return COLORS.BEST;
          case 'mate': return COLORS.MATE;
          case 'trap': return COLORS.TRAP;
          case 'alt': return COLORS.ALT;
          default: return COLORS.WARN;
      }
  };

  const getLabel = (hint: Review.Hint) => {
      const { score, kind } = hint;
      if (kind === 'mate') return 'MATE';
      if (kind === 'best') return `BEST ${score > 0 ? '+' : ''}${score}`;
      if (kind === 'trap') return `TRAP ${score}`;
      return `${score > 0 ? '+' : ''}${score}`;
  };

  const statusColor = bestOutcome > 100 ? COLORS.BEST : bestOutcome < -100 ? COLORS.TRAP : COLORS.WARN;
  const statusText = bestOutcome > 20000 ? "MATE IN X" : 
                     bestOutcome < -20000 ? "MATED" :
                     bestOutcome > 0 ? `ADVANTAGE +${bestOutcome}` : 
                     bestOutcome < 0 ? `DISADVANTAGE ${bestOutcome}` : "EQUAL";

  return (
    <>
      {/* LAYER 0: HUD */}
      <div 
        className="absolute -top-9 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full flex items-center gap-2 backdrop-blur-md border animate-fade-in"
        style={{
            backgroundColor: 'rgba(0,0,0,0.6)',
            borderColor: statusColor,
            zIndex: Layer.Hud,
            boxShadow: `0 0 15px ${statusColor}40`
        }}
      >
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: statusColor }} />
          <span className={`${Typography.Font.Mono} text-xs font-bold text-white tracking-widest`}>
              {statusText}
          </span>
      </div>

      {/* LAYER 1: VECTORS */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: Layer.Trace }}>
        <svg viewBox="-50 -50 900 1000" className="w-full h-full">
          <defs>
              <marker id="arrow-best" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
                  <path d="M0,0 L0,4 L4,2 z" fill={COLORS.BEST} />
              </marker>
              <marker id="arrow-alt" markerWidth="3" markerHeight="3" refX="2" refY="2" orient="auto">
                  <path d="M0,0 L0,4 L4,2 z" fill={COLORS.ALT} />
              </marker>
              <marker id="arrow-trap" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
                  <path d="M0,0 L0,4 L4,2 z" fill={COLORS.TRAP} />
              </marker>
              <marker id="arrow-mate" markerWidth="5" markerHeight="5" refX="2" refY="2" orient="auto">
                  <path d="M0,0 L0,4 L4,2 z" fill={COLORS.MATE} />
              </marker>
              <marker id="arrow-warn" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
                  <path d="M0,0 L0,4 L4,2 z" fill={COLORS.WARN} />
              </marker>
              <marker id="arrow-refutation" markerWidth="3" markerHeight="3" refX="2" refY="2" orient="auto">
                  <path d="M0,0 L0,4 L4,2 z" fill={COLORS.TRAP} fillOpacity="0.5" />
              </marker>
              <filter id="glow-assist">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
          </defs>

          {hints.map((hint, index) => {
              // Only draw significant moves
              if (hint.kind !== 'best' && hint.kind !== 'mate' && Math.abs(hint.score) < 50) return null;

              const start = Space.expand(hint.source);
              const end = Space.expand(hint.target);
              
              const x1 = start.x * 100;
              const y1 = start.y * 100;
              const x2 = end.x * 100;
              const y2 = end.y * 100;

              const mx = (x1 + x2) / 2;
              const my = (y1 + y2) / 2;
              const len = Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
              const curve = 40; 
              
              const ux = -(y2 - y1) / len;
              const uy = (x2 - x1) / len;
              
              const cx = mx + ux * curve;
              const cy = my + uy * curve;

              const color = getColor(hint.kind);
              const marker = `url(#arrow-${hint.kind})`;
              
              const dash = hint.kind === 'trap' ? "10 5" : hint.kind === 'alt' ? "5 5" : "none";
              const width = hint.kind === 'best' ? 4 : hint.kind === 'alt' ? 2 : 3;
              const opacityLine = hint.kind === 'alt' ? 0.6 : 0.8;

              // Draw Refutation Arrow (If Trap)
              // Shows opponent's move: dotted red line
              let refutationArrow = null;
              if (hint.refutation) {
                  const rStart = Space.expand(hint.refutation.from);
                  const rEnd = Space.expand(hint.refutation.to);
                  refutationArrow = (
                      <path 
                          d={`M ${rStart.x * 100} ${rStart.y * 100} L ${rEnd.x * 100} ${rEnd.y * 100}`}
                          fill="none"
                          stroke={COLORS.TRAP}
                          strokeWidth="2"
                          strokeOpacity="0.5"
                          strokeDasharray="2 2"
                          markerEnd="url(#arrow-refutation)"
                      />
                  );
              }

              return (
                  <g key={`arrow-${index}`} opacity={opacityLine}>
                      <path 
                          d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
                          fill="none"
                          stroke={color}
                          strokeWidth={width}
                          strokeLinecap="round"
                          strokeDasharray={dash}
                          markerEnd={marker}
                          filter={hint.kind === 'best' || hint.kind === 'mate' ? "url(#glow-assist)" : "none"}
                      />
                      <circle cx={x1} cy={y1} r="3" fill={color} />
                      {refutationArrow}
                  </g>
              );
          })}
        </svg>
      </div>

      {/* LAYER 2: GHOST PIECES */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: Layer.Trace }}>
          {hints.map((hint, index) => {
              if (hint.kind !== 'best' && hint.kind !== 'mate' && hint.score < -200) return null;

              const pos = Space.expand(hint.target);
              const color = getColor(hint.kind);
              const isBest = hint.kind === 'best';
              const isTrap = hint.kind === 'trap';
              
              return (
                  <div
                      key={`ghost-${index}`}
                      className={`absolute flex items-center justify-center ${isTrap ? 'animate-pulse' : ''}`}
                      style={{
                          width: '11.11%',
                          height: '10%',
                          left: `${pos.x * 11.11}%`,
                          top: `${pos.y * 10}%`,
                          zIndex: isBest ? 10 : 5
                      }}
                  >
                      <div 
                        className="w-[85%] h-[85%]"
                        style={{
                            opacity: isBest ? opacity : opacity * 0.6,
                            filter: `drop-shadow(0 0 5px ${color}) grayscale(100%) opacity(0.8)`,
                            transform: isBest ? 'scale(1.0)' : 'scale(0.8)',
                        }}
                      >
                          <Unit value={hint.piece} active={false} />
                      </div>
                      
                      <div 
                        className={`
                            absolute -top-4 px-1.5 py-0.5 rounded border 
                            ${Typography.Font.Mono} text-[9px] font-bold tracking-tighter
                            shadow-lg backdrop-blur-md flex flex-col items-center
                        `}
                        style={{
                            backgroundColor: 'rgba(0,0,0,0.85)',
                            borderColor: color,
                            color: color,
                            zIndex: 20,
                            minWidth: '30px',
                            textAlign: 'center',
                            whiteSpace: 'nowrap'
                        }}
                      >
                          {getLabel(hint)}
                      </div>

                      {isTrap && (
                          <div className="absolute -bottom-4 text-red-500 font-bold text-lg animate-bounce">
                              ⚠️
                          </div>
                      )}
                  </div>
              );
          })}
      </div>
    </>
  );
});

Assist.displayName = 'Assist';
