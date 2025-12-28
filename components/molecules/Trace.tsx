
import React from 'react';
import { Space } from '../../engine';
import { Palette, Layer } from '../../design/tokens';
import { Unit } from '../atoms/Unit';

interface Props {
  from: number;
  to: number;
  piece: number;
}

/**
 * @description  Visual Trace System (Ghost + Ballistic Arrow).
 * @purpose      Indicate previous move clearly with animation.
 * @atomic       MOLECULE
 */
export const Trace: React.FC<Props> = React.memo(({ from, to, piece }) => {
  const start = Space.expand(from);
  const end = Space.expand(to);

  const x1 = start.x * 100;
  const y1 = start.y * 100;
  const x2 = end.x * 100;
  const y2 = end.y * 100;

  // Bezier Control Point Calculation
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const vx = x2 - x1;
  const vy = y2 - y1;
  const len = Math.sqrt(vx * vx + vy * vy);
  
  const offset = 40; 
  const px = -vy / len * offset;
  const py = vx / len * offset;
  
  const cx = mx + px;
  const cy = my + py;

  const color = Palette.Signal.Active;

  return (
    <>
      <style>
        {`
          @keyframes draw {
            from { stroke-dashoffset: 1000; }
            to { stroke-dashoffset: 0; }
          }
          @keyframes fade {
            from { opacity: 0; }
            to { opacity: 0.4; }
          }
        `}
      </style>

      {/* 1. THE GHOST (At 'from' position) */}
      <div 
        className="absolute flex items-center justify-center pointer-events-none"
        style={{
          width: '11.11%',
          height: '10%',
          left: `${start.x * 11.11}%`,
          top: `${start.y * 10}%`,
          zIndex: Layer.Base,
          opacity: 0.4,
          filter: 'grayscale(100%) blur(1px)',
          animation: 'fade 0.5s ease-out'
        }}
      >
         <div className="w-[85%] h-[85%]">
            <Unit value={piece} active={false} />
         </div>
      </div>

      {/* 2. THE BALLISTIC ARROW (Overlay) */}
      {/* Optimized: Definitions moved to Grid.tsx to prevent ID collision and re-allocation */}
      <svg 
        viewBox="-50 -50 900 1000" 
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: Layer.Trace }}
      >
        {/* Path Animation */}
        <path 
          d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="1000"
          strokeDashoffset="1000"
          markerEnd="url(#arrowhead)" 
          filter="url(#glow)"
          style={{
              animation: 'draw 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards'
          }}
        />
        
        {/* Origin Dot */}
        <circle cx={x1} cy={y1} r="4" fill={color} filter="url(#glow)" opacity="0.6" />
        
        {/* Target Impact Ring */}
        <circle cx={x2} cy={y2} r="8" fill="none" stroke={color} strokeWidth="2" opacity="0.6">
            <animate attributeName="r" from="0" to="20" dur="1s" begin="0.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.8" to="0" dur="1s" begin="0.4s" repeatCount="indefinite" />
        </circle>
      </svg>
    </>
  );
});

Trace.displayName = 'Trace';
