
import React from 'react';
import { Palette, Layer } from '../../design/tokens';
import { Types, Space, Codec } from '../../engine';

interface Props {
  board: Types.Board;
  focus?: number; // Highlight the last moved piece index
}

/**
 * @description  Tactical Board Visualizer.
 * @purpose      Map real piece positions to radar coordinates with Liquid/Sonar effects.
 * @complexity   O(N) where N=90.
 * @atomic       MOLECULE
 */
export const Map: React.FC<Props> = React.memo(({ board, focus }) => {
  // Map 1D index to Radar Polar coordinates (approximate)
  const blips = Array.from(board).map((value: number, index) => {
    if (value === 0) return null;
    
    const x = Space.file(index); // 0-8
    const y = Space.rank(index); // 0-9
    const side = Codec.side(value);
    
    // Calculate normalized offset from center (4, 4.5)
    const dx = (x - 4) / 4;
    const dy = (y - 4.5) / 4.5;
    
    return {
      index,
      x: 50 + dx * 35,
      y: 50 + dy * 35,
      color: side === Types.Side.Red ? Palette.Faction.Red : Palette.App.Text,
      active: index === focus
    };
  }).filter(Boolean);

  return (
    <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-black/20">
        <style>
            {`
            @keyframes ripple {
                0% { transform: scale(1); opacity: 0.6; }
                100% { transform: scale(3); opacity: 0; }
            }
            `}
        </style>

        {/* Background Rings */}
        {[80, 55, 30].map(size => (
            <div 
                key={size}
                className="absolute rounded-full border opacity-10"
                style={{ 
                    width: `${size}%`, 
                    height: `${size}%`,
                    borderColor: Palette.Signal.Target 
                }} 
            />
        ))}
        
        {/* Axis */}
        <div className="absolute w-full h-[1px] opacity-10" style={{ backgroundColor: Palette.Signal.Target }} />
        <div className="absolute h-full w-[1px] opacity-10" style={{ backgroundColor: Palette.Signal.Target }} />

        {/* Sweep Animation */}
        <div 
            className="absolute w-[50%] h-[50%] top-0 right-0 origin-bottom-left animate-spin-slow"
            style={{
                background: `conic-gradient(from 0deg, transparent 0deg, transparent 270deg, ${Palette.Signal.Target} 360deg)`,
                opacity: 0.15,
                animationDuration: '4s'
            }}
        />

        {/* REAL-TIME LIQUID BLIPS */}
        {blips.map((blip, index) => (
            <div 
                key={index}
                className="absolute flex items-center justify-center w-2 h-2"
                style={{ 
                    left: `${blip?.x}%`, 
                    top: `${blip?.y}%`,
                    transform: 'translate(-50%, -50%)'
                }}
            >
                {/* Core */}
                <div 
                    className="w-1.5 h-1.5 rounded-full z-10"
                    style={{ 
                        backgroundColor: blip?.active ? Palette.Signal.Active : blip?.color,
                        boxShadow: blip?.active ? `0 0 8px ${Palette.Signal.Active}` : 'none'
                    }} 
                />
                
                {/* Liquid Ripple 1 */}
                <div 
                    className="absolute w-full h-full rounded-full border"
                    style={{ 
                        borderColor: blip?.active ? Palette.Signal.Active : blip?.color,
                        animation: `ripple ${blip?.active ? '1s' : '3s'} infinite ease-out`
                    }}
                />
                
                {/* Liquid Ripple 2 (Delayed) */}
                <div 
                    className="absolute w-full h-full rounded-full border"
                    style={{ 
                        borderColor: blip?.active ? Palette.Signal.Active : blip?.color,
                        animation: `ripple ${blip?.active ? '1s' : '3s'} infinite ease-out`,
                        animationDelay: '0.5s'
                    }}
                />
            </div>
        ))}

        {/* Noise Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-10 pointer-events-none" />
    </div>
  );
});

Map.displayName = 'Map';
