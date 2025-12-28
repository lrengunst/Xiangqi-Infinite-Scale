
import React, { useEffect, useState } from 'react';
import { Typography, Palette } from '../../design/tokens';

const MESSAGES = [
    "SYSTEM: NODE_24 CONNECTED",
    "TRAFFIC: ENCRYPTED [AES-256]",
    "HANDSHAKE: ESTABLISHED",
    "PACKET LOSS: 0.00%",
    "SYNC: 12ms LATENCY",
    "A.R.E.S: WATCHING",
    "SEARCH: DEPTH 12 REACHED",
    "HASH: 0x8F3A... VERIFIED",
    "MEM: HEAP STABLE",
    "GC: IDLE MODE"
];

/**
 * @description  Scrolling Text Feed.
 * @purpose      Visual immersion for "Global Chat" slot.
 * @atomic       MOLECULE
 */
export const Feed: React.FC = React.memo(() => {
  const [lines, setLines] = useState<string[]>(MESSAGES.slice(0, 6));

  useEffect(() => {
      const interval = setInterval(() => {
          setLines(current => {
              const next = [...current];
              if (next.length > 7) next.shift();
              const randomMsg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
              const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
              next.push(`[${timestamp}] ${randomMsg}`);
              return next;
          });
      }, 1500); // Faster updates
      return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full p-3 overflow-hidden flex flex-col justify-end">
        {lines.map((line, index) => (
            <div 
                key={index} 
                className={`${Typography.Font.Mono} text-[9px] truncate tracking-wide`}
                style={{ 
                    color: Palette.Signal.Target,
                    opacity: 0.4 + (index / lines.length) * 0.6, // Fade in effect
                    textShadow: index === lines.length - 1 ? `0 0 5px ${Palette.Signal.Target}` : 'none'
                }}
            >
                {line}
            </div>
        ))}
    </div>
  );
});

Feed.displayName = 'Feed';
