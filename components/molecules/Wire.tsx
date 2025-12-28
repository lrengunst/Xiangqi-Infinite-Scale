
import React from 'react';
import { Typography, Palette } from '../../design/tokens';

interface Props {
  events: string[];
}

/**
 * @description  Real-time Event Stream.
 * @purpose      Visualize actual system interactions and network traffic.
 * @atomic       MOLECULE
 */
export const Wire: React.FC<Props> = React.memo(({ events }) => {
  // Only show the last 8 events
  const stream = events.slice(-8);

  return (
    <div className="w-full h-full p-3 overflow-hidden flex flex-col justify-end gap-1">
        {stream.length === 0 ? (
            <div className="text-[8px] font-mono opacity-20 animate-pulse">AWAITING_TRAFFIC...</div>
        ) : (
            stream.map((line, index) => (
                <div 
                    key={index} 
                    className={`${Typography.Font.Mono} text-[9px] truncate tracking-tighter uppercase`}
                    style={{ 
                        color: Palette.Signal.Target,
                        opacity: 0.3 + (index / stream.length) * 0.7,
                        textShadow: index === stream.length - 1 ? `0 0 5px ${Palette.Signal.Target}` : 'none'
                    }}
                >
                    <span className="opacity-40 mr-1">></span>
                    {line}
                </div>
            ))
        )}
    </div>
  );
});

Wire.displayName = 'Wire';
