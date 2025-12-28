import React from 'react';
import { Palette, Spacing, Typography, Effects } from '../../design/tokens';

interface Props {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium';
  action?: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * @description  Standard interactive element.
 * @atomic       ATOM
 */
export const Button: React.FC<Props> = React.memo(({ 
  label, 
  variant = 'primary', 
  size = 'medium', 
  action,
  disabled = false,
  className = ''
}) => {
  
  // O(1) Style Mapping
  const background = (() => {
    if (disabled) return Palette.App.Muted;
    switch (variant) {
      case 'primary': return '#1d4ed8'; // Blue (Pending Palette update)
      case 'danger': return Palette.Signal.Danger;
      case 'secondary': return Palette.App.Muted;
      default: return Palette.App.Panel;
    }
  })();

  const padding = size === 'small' ? `${Spacing.Layout.Xs} ${Spacing.Layout.Sm}` : `${Spacing.Layout.Xs} ${Spacing.Layout.Md}`;
  const text = Palette.App.Text;

  return (
    <button 
      onClick={action}
      disabled={disabled}
      className={`
        rounded ${Typography.Weight.Bold} ${Effects.Transition.Fast} 
        ${Typography.Font.Sans}
        ${!disabled ? 'hover:brightness-110 shadow-lg active:scale-95' : 'cursor-not-allowed opacity-50'}
        ${className}
      `}
      style={{
        backgroundColor: background,
        color: text,
        padding: padding,
        fontSize: size === 'small' ? '0.75rem' : '0.875rem',
        border: variant === 'secondary' ? `1px solid ${Palette.App.Muted}` : 'none'
      }}
    >
      {label}
    </button>
  );
});

Button.displayName = 'Button';