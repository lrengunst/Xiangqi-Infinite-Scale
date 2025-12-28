
import { Scheme, War, Zen } from './palette';

/**
 * @description  Theme Engine.
 * @purpose      Injects CSS variables into the DOM.
 * @complexity   O(1)
 */

export type Mode = 'war' | 'zen';

const map = (scheme: Scheme): Record<string, string> => {
  return {
    '--faction-red': scheme.Faction.Red,
    '--faction-black': scheme.Faction.Black,
    '--board-surface': scheme.Board.Surface,
    '--board-ink': scheme.Board.Ink,
    '--board-border': scheme.Board.Border,
    '--signal-active': scheme.Signal.Active,
    '--signal-target': scheme.Signal.Target,
    '--signal-danger': scheme.Signal.Danger,
    '--app-background': scheme.App.Background,
    '--app-panel': scheme.App.Panel,
    '--app-text': scheme.App.Text,
    '--app-muted': scheme.App.Muted,
  };
};

export const apply = (mode: Mode): void => {
  const scheme = mode === 'zen' ? Zen : War;
  const variables = map(scheme);
  
  const root = document.documentElement;
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
};

// NEW: Control Animation Pace
export const pace = (ms: number): void => {
    const root = document.documentElement;
    root.style.setProperty('--anim-pace', `${ms}ms`);
};

export const toggle = (current: Mode): Mode => {
  return current === 'war' ? 'zen' : 'war';
};
