
import React from 'react';
import { Palette, Layer } from '../../design/tokens';

/**
 * @description  Visualizes the AI's "Neural Activity".
 * @purpose      Latency Masking. Makes waiting for the AI feel like watching a supercomputer work.
 * @atomic       MOLECULE
 */
export const Scanner: React.FC = React.memo(() => {
  return (
    <div 
      className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg"
      style={{ zIndex: Layer.Trace }}
    >
      <style>
        {`
          @keyframes scan {
            0% { transform: translateY(-100%); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateY(100%); opacity: 0; }
          }
          @keyframes blink {
            0%, 100% { opacity: 0; }
            50% { opacity: 0.8; }
          }
        `}
      </style>

      {/* 1. The Laser Scanner Bar */}
      <div 
        className="absolute w-full h-[20%] bg-gradient-to-b from-transparent via-yellow-500/20 to-transparent"
        style={{ 
            animation: 'scan 2s linear infinite',
            borderBottom: `2px solid ${Palette.Signal.Active}`,
            boxShadow: `0 0 15px ${Palette.Signal.Active}`
        }}
      />

      {/* 2. Neural Hotspots (Simulated Search Nodes) */}
      {/* We render a static grid of potential nodes that blink randomly */}
      <div className="absolute inset-0 grid grid-cols-9 grid-rows-10">
          {Array.from({ length: 90 }).map((_, index) => {
              // Deterministic "random" delay based on index to avoid layout thrashing
              const delay = (index * 1337) % 2000; 
              const duration = 500 + ((index * 997) % 1000);
              // Only highlight ~20% of nodes to simulate pruning
              if (index % 5 !== 0) return null;

              return (
                  <div key={index} className="flex items-center justify-center">
                      <div 
                        className="w-full h-full border border-yellow-500/30 bg-yellow-500/10"
                        style={{
                            animation: `blink ${duration}ms infinite`,
                            animationDelay: `${delay}ms`
                        }}
                      />
                  </div>
              );
          })}
      </div>

      {/* 3. Status Text */}
      <div className="absolute bottom-2 right-2 flex flex-col items-end">
          <div className="text-[10px] font-mono text-yellow-500 animate-pulse tracking-widest bg-black/60 px-2 rounded">
              NEURAL_SEARCH_ACTIVE
          </div>
          <div className="text-[8px] font-mono text-yellow-500/50">
              PRUNING_ALPHA_BETA...
          </div>
      </div>
    </div>
  );
});

Scanner.displayName = 'Scanner';
