
import React from 'react';
import { Palette, Typography } from '../../design/tokens';

interface Props {
    coords?: boolean;
}

/**
 * @description  Static SVG rendering of the Xiangqi board lines + Coordinates.
 * @purpose      Resolution-independent rendering with zero texture memory cost.
 * @atomic       ATOM
 */
export const Grid: React.FC<Props> = React.memo(({ coords = false }) => {
  const stroke = Palette.Board.Ink;
  const active = Palette.Signal.Active;
  const width = 0.5;

  return (
    <svg viewBox="-50 -50 900 1000" className="absolute inset-0 w-full h-full pointer-events-none select-none">
      <defs>
        <marker id="dot" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5">
          <circle cx="5" cy="5" r="5" fill={stroke} />
        </marker>

        <marker id="arrowhead" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
            <path d="M0,0 L0,4 L4,2 z" fill={active} />
        </marker>

        <filter id="glow">
             <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
             <feMerge>
                 <feMergeNode in="coloredBlur"/>
                 <feMergeNode in="SourceGraphic"/>
             </feMerge>
        </filter>
      </defs>
      
      <rect x="-40" y="-40" width="880" height="980" fill="transparent" stroke={stroke} strokeWidth="4" />

      {/* Horizontal Lines */}
      {Array.from({ length: 10 }).map((_, index) => (
        <line 
          key={`h-${index}`} 
          x1="0" y1={index * 100} 
          x2="800" y2={index * 100} 
          stroke={stroke} 
          strokeWidth={width * 4} 
        />
      ))}

      {/* Vertical Lines */}
      {Array.from({ length: 9 }).map((_, index) => {
        if (index === 0 || index === 8) {
          return (
            <line key={`v-${index}`} x1={index * 100} y1="0" x2={index * 100} y2="900" stroke={stroke} strokeWidth={width * 4} />
          );
        } else {
          return (
            <React.Fragment key={`v-${index}`}>
              <line x1={index * 100} y1="0" x2={index * 100} y2="400" stroke={stroke} strokeWidth={width * 4} />
              <line x1={index * 100} y1="500" x2={index * 100} y2="900" stroke={stroke} strokeWidth={width * 4} />
            </React.Fragment>
          );
        }
      })}

      {/* Palaces */}
      <line x1="300" y1="0" x2="500" y2="200" stroke={stroke} strokeWidth={width * 3} />
      <line x1="500" y1="0" x2="300" y2="200" stroke={stroke} strokeWidth={width * 3} />
      <line x1="300" y1="700" x2="500" y2="900" stroke={stroke} strokeWidth={width * 3} />
      <line x1="500" y1="700" x2="300" y2="900" stroke={stroke} strokeWidth={width * 3} />

      <text x="200" y="470" fontSize="50" fill={stroke} fontFamily="serif" textAnchor="middle">楚 河</text>
      <text x="600" y="470" fontSize="50" fill={stroke} fontFamily="serif" textAnchor="middle">漢 界</text>

      {/* Markers */}
      {[
         [100, 200], [700, 200], 
         [0, 300], [200, 300], [400, 300], [600, 300], [800, 300], 
         [100, 700], [700, 700], 
         [0, 600], [200, 600], [400, 600], [600, 600], [800, 600] 
      ].map(([mx, my], index) => {
         const isLeftEdge = mx === 0;
         const isRightEdge = mx === 800;
         return (
           <g key={`m-${index}`} transform={`translate(${mx}, ${my})`}>
              {!isLeftEdge && <path d="M-5 -5 L-15 -5 M-5 -5 L-5 -15" stroke={stroke} strokeWidth="2" fill="none" />}
              {!isRightEdge && <path d="M5 -5 L15 -5 M5 -5 L5 -15" stroke={stroke} strokeWidth="2" fill="none" />}
              {!isLeftEdge && <path d="M-5 5 L-15 5 M-5 5 L-5 15" stroke={stroke} strokeWidth="2" fill="none" />}
              {!isRightEdge && <path d="M5 5 L15 5 M5 5 L5 15" stroke={stroke} strokeWidth="2" fill="none" />}
           </g>
         );
      })}

      {/* Coordinates (0-8, 0-9) */}
      {coords && (
          <g>
              {/* X Axis (Top & Bottom) */}
              {Array.from({ length: 9 }).map((_, i) => (
                  <React.Fragment key={`x-${i}`}>
                      <text x={i * 100} y="-15" fontSize="20" fill={stroke} textAnchor="middle" className="font-mono">{i}</text>
                      <text x={i * 100} y="935" fontSize="20" fill={stroke} textAnchor="middle" className="font-mono">{i}</text>
                  </React.Fragment>
              ))}
              
              {/* Y Axis (Left & Right) */}
              {Array.from({ length: 10 }).map((_, i) => (
                  <React.Fragment key={`y-${i}`}>
                      <text x="-25" y={i * 100 + 10} fontSize="20" fill={stroke} textAnchor="middle" className="font-mono">{i}</text>
                      <text x="825" y={i * 100 + 10} fontSize="20" fill={stroke} textAnchor="middle" className="font-mono">{i}</text>
                  </React.Fragment>
              ))}
          </g>
      )}

    </svg>
  );
});

Grid.displayName = 'Grid';
