
import React from 'react';
import { Unit } from '../atoms/Unit';
import { Space } from '../../engine/index';
import { Palette, Layer } from '../../design/tokens';

interface Props {
  index: number;
  value: number;
  selected: boolean;
  target: boolean;
  flip?: boolean;
}

/**
 * @description  A single coordinate zone.
 * @atomic       MOLECULE
 */
export const Slot: React.FC<Props> = React.memo(({ index, value, selected, target, flip = false }) => {
  const x = Space.file(index);
  const y = Space.rank(index);
  
  return (
    <div 
      className="absolute flex items-center justify-center pointer-events-none"
      style={{
        width: '11.11%',
        height: '10%',
        left: `${x * 11.11}%`,
        top: `${y * 10}%`,
        zIndex: value !== 0 ? Layer.Piece : Layer.Grid
      }}
    >
      {(target && value === 0) && (
        <div className="relative flex items-center justify-center w-8 h-8">
            <div 
                className="absolute inset-0 rounded-full border-2 opacity-20 animate-ping"
                style={{ borderColor: Palette.Signal.Target }}
            />
            <div 
                className="w-4 h-4 rounded-full opacity-80 shadow-lg" 
                style={{ 
                    backgroundColor: Palette.Signal.Target,
                    boxShadow: `0 0 10px ${Palette.Signal.Target}`
                }}
            />
        </div>
      )}
      
      {value !== 0 && (
        <div 
            className="w-[85%] h-[85%] relative pointer-events-auto transition-transform"
            style={{ 
                transform: flip ? 'rotate(180deg)' : 'rotate(0deg)',
                transitionDuration: 'var(--anim-pace, 500ms)' // DYNAMIC PACE
            }}
        >
          <Unit value={value} active={selected} />
          
          {target && (
            <div 
              className="absolute inset-0 rounded-full ring-4 opacity-50 animate-pulse" 
              style={{ 
                  boxShadow: `0 0 0 4px ${Palette.Signal.Target}`
              }}
            />
          )}
        </div>
      )}
    </div>
  );
});

Slot.displayName = 'Slot';
