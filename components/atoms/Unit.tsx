
import React from 'react';
import { Types, Codec } from '../../engine/index';
import { Palette, Effects, Spacing, Layer } from '../../design/tokens';

interface Props {
  value: number;
  active: boolean;
}

/**
 * @description  Visual representation of a piece.
 * @purpose      Render characters from piece bytes using SVG for perfect scaling.
 * @atomic       ATOM
 */
export const Unit: React.FC<Props> = React.memo(({ value, active }) => {
  const role = Codec.role(value);
  const side = Codec.side(value);
  const red = side === Types.Side.Red;
  
  const label = (() => {
    switch (role) {
      case Types.Role.General: return red ? '帥' : '將';
      case Types.Role.Advisor: return red ? '仕' : '士';
      case Types.Role.Elephant: return red ? '相' : '象';
      case Types.Role.Horse: return red ? '傌' : '馬';
      case Types.Role.Chariot: return red ? '俥' : '車';
      case Types.Role.Cannon: return red ? '炮' : '砲';
      case Types.Role.Soldier: return red ? '兵' : '卒';
      default: return '?';
    }
  })();

  const stroke = red ? Palette.Faction.Red : Palette.Faction.Black;
  const ink = red ? Palette.Faction.Red : Palette.Faction.Black;
  
  const transform = active 
    ? 'scale-110 -translate-y-2' 
    : 'hover:-translate-y-1 hover:scale-105';
    
  const shadow = active
    ? '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)' 
    : Effects.Shadow.Piece;
  
  return (
    <div 
      className={`
        w-full h-full rounded-full flex items-center justify-center 
        select-none transition-all
        ${transform}
      `}
      style={{
        backgroundColor: Palette.Board.Surface,
        border: `${Spacing.Border.Thin} solid ${stroke}`,
        boxShadow: shadow,
        zIndex: active ? Layer.Active : Layer.Piece,
        transitionDuration: 'var(--anim-pace, 300ms)' // DYNAMIC PACE
      }}
    >
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full pointer-events-none"
        style={{ overflow: 'visible' }}
      >
        <circle 
            cx="50" cy="50" r="42" 
            fill="none" 
            stroke="black" 
            strokeWidth="2" 
            strokeOpacity="0.3" 
        />
        <text 
            x="50" y="55" 
            textAnchor="middle" 
            dominantBaseline="middle"
            fontSize="55" 
            fontWeight="bold" 
            fill={ink}
            className="font-serif"
            style={{ filter: 'drop-shadow(0px 2px 0px rgba(0,0,0,0.1))' }}
        >
            {label}
        </text>
      </svg>
    </div>
  );
});

Unit.displayName = 'Unit';
