
import React, { useMemo } from 'react';
import { Palette, Effects } from '../../design/tokens';

interface Props {
  score: number; // Centipawns (e.g. +200, -50)
  flip: boolean;
}

/**
 * @description  Win Probability Gauge (Tug of War).
 * @purpose      Visual feedback of game balance.
 * @atomic       MOLECULE
 */
export const Gauge: React.FC<Props> = React.memo(({ score, flip }) => {
  
  const winRate = useMemo(() => {
      return 1 / (1 + Math.exp(-score / 400));
  }, [score]);

  const heightPercent = winRate * 100;

  return (
    <div 
      className={`
        w-2 md:w-3 h-full rounded-full overflow-hidden border border-white/10 relative
        ${Effects.Shadow.Panel}
      `}
      style={{
          backgroundColor: Palette.Faction.Black 
      }}
    >
        <div 
            className="absolute bottom-0 w-full transition-all ease-out"
            style={{
                height: `${heightPercent}%`,
                backgroundColor: Palette.Faction.Red,
                boxShadow: `0 0 10px ${Palette.Faction.Red}`,
                transitionDuration: 'var(--anim-pace, 700ms)' // DYNAMIC PACE (Slower than units usually)
            }}
        />
        
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/50 z-10" />
        
        <div 
            className="absolute left-full ml-1 top-1/2 -translate-y-1/2 text-[9px] font-mono font-bold opacity-0 hover:opacity-100 transition-opacity bg-black/80 px-1 rounded pointer-events-none"
            style={{ color: score > 0 ? Palette.Faction.Red : Palette.App.Text }}
        >
            {score > 0 ? '+' : ''}{score}
        </div>
    </div>
  );
});

Gauge.displayName = 'Gauge';
