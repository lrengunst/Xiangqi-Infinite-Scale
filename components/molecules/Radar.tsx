
import React from 'react';
import { Palette } from '../../design/tokens';

/**
 * @description  Decorative Radar/Map View.
 * @purpose      Visual immersion for "Tactical Map" slot.
 * @atomic       MOLECULE
 */
export const Radar: React.FC = React.memo(() => {
  return (
    <div className="w-full h-full relative overflow-hidden flex items-center justify-center opacity-50">
        {/* Radar Concentric Circles */}
        {[80, 55, 30].map(size => (
            <div 
                key={size}
                className="absolute rounded-full border opacity-30"
                style={{ 
                    width: `${size}%`, 
                    height: `${size}%`,
                    borderColor: Palette.Signal.Target 
                }} 
            />
        ))}
        
        {/* Crosshair */}
        <div className="absolute w-full h-[1px] opacity-20" style={{ backgroundColor: Palette.Signal.Target }} />
        <div className="absolute h-full w-[1px] opacity-20" style={{ backgroundColor: Palette.Signal.Target }} />

        {/* Sweep Animation */}
        <div 
            className="absolute w-[50%] h-[50%] top-0 right-0 origin-bottom-left animate-spin-slow"
            style={{
                background: `conic-gradient(from 0deg, transparent 0deg, transparent 270deg, ${Palette.Signal.Target} 360deg)`,
                opacity: 0.2,
                animationDuration: '3s'
            }}
        />

        {/* Blips (Simulated Activity) */}
        <div 
            className="absolute top-[30%] left-[40%] w-1.5 h-1.5 rounded-full animate-ping" 
            style={{ backgroundColor: Palette.Signal.Danger, animationDuration: '2s' }}
        />
        <div 
            className="absolute top-[60%] right-[30%] w-1 h-1 rounded-full animate-ping" 
            style={{ backgroundColor: Palette.Signal.Active, animationDuration: '4s' }}
        />
        
        {/* Digital Noise Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20 pointer-events-none" />
    </div>
  );
});

Radar.displayName = 'Radar';
