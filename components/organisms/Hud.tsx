
import React from 'react';
import { Palette, Typography, Effects, Spacing } from '../../design/tokens';
import { Button } from '../atoms/Button';

interface Props {
  pilots: { red: string; black: string };
  reset: () => void;
  connect: () => void;
  config: () => void;
  flip: boolean;
  toggleFlip: () => void;
  library: () => void; // NEW
}

/**
 * @description  Tactical Command Header.
 * @purpose      Status monitoring and primary controls.
 * @atomic       ORGANISM
 */
export const Hud: React.FC<Props> = React.memo(({ pilots, reset, connect, config, flip, toggleFlip, library }) => {
  
  const Indicator = ({ label, type, color }: { label: string, type: string, color: string }) => (
      <div className="flex flex-col gap-1 items-center sm:items-start">
          <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 5px ${color}` }} />
              <span className={`${Typography.Font.Mono} ${Typography.Size.Xs} opacity-50`}>{label}</span>
          </div>
          <span className={`${Typography.Font.Mono} ${Typography.Size.Sm} font-bold uppercase`}>
              {type === 'ai' ? 'A.R.E.S' : 'MANUAL'}
          </span>
      </div>
  );

  return (
    <div 
      className={`
        w-full max-w-[600px] mx-auto p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4
        ${Effects.Shadow.Panel}
      `}
      style={{
          backgroundColor: Palette.App.Panel,
          border: `1px solid ${Palette.App.Muted}`,
          color: Palette.App.Text
      }}
    >
      <div className="flex gap-6">
        <Indicator label="RED" type={pilots.red} color={Palette.Faction.Red} />
        <div className="w-[1px] h-8 bg-white/10 hidden sm:block" />
        <Indicator label="BLACK" type={pilots.black} color={Palette.Faction.Black} />
      </div>
      
      <div className="flex gap-2 flex-wrap justify-center">
        <Button label="FLIP" variant={flip ? 'primary' : 'secondary'} size="small" action={toggleFlip} />
        <Button label="LIBRARY" variant="secondary" size="small" action={library} />
        <Button label="CONFIG" variant="secondary" size="small" action={config} />
        <Button label="MESH" variant="primary" size="small" action={connect} />
      </div>
    </div>
  );
});

Hud.displayName = 'Hud';
