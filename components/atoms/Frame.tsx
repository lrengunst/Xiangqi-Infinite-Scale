
import React from 'react';
import { Palette, Typography, Spacing } from '../../design/tokens';

interface Props {
  label: string;
  children?: React.ReactNode;
  active?: boolean;
  className?: string;
}

/**
 * @description  Container for dashboard modules.
 * @style        Sci-Fi Panel with corner accents.
 * @atomic       ATOM
 */
export const Frame: React.FC<Props> = React.memo(({ label, children, active = false, className = '' }) => {
  return (
    <div 
      className={`relative w-full rounded-lg border overflow-hidden flex flex-col ${className}`}
      style={{
        borderColor: active ? Palette.Signal.Active : 'rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Header */}
      <div 
        className="px-3 py-1 border-b flex justify-between items-center"
        style={{ 
            borderColor: 'rgba(255, 255, 255, 0.05)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)' 
        }}
      >
          <span className={`${Typography.Font.Mono} ${Typography.Size.Xs} tracking-widest uppercase opacity-50`}>
              {label}
          </span>
          <div 
            className={`w-1 h-1 rounded-full ${active ? 'animate-pulse' : ''}`} 
            style={{ backgroundColor: active ? Palette.Signal.Target : Palette.Signal.Danger }}
          />
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
          {children || (
              <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`${Typography.Font.Mono} ${Typography.Size.Xs} opacity-10`}>OFFLINE</span>
              </div>
          )}
          
          {/* Scanline Effect */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-5"
            style={{
                backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
                backgroundSize: '100% 2px, 3px 100%'
            }}
          />
      </div>

      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20 rounded-tl" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20 rounded-tr" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20 rounded-bl" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 rounded-br" />
    </div>
  );
});

Frame.displayName = 'Frame';
