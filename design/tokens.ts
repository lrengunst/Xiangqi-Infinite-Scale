
/**
 * @description  DESIGN TOKENS (SINGLE SOURCE OF TRUTH)
 * @purpose      Enforce visual consistency and theming capability.
 * @law          ZERO HARDCODE. All UI components MUST import from here.
 */

export const Palette = {
  Faction: {
    Red: 'var(--faction-red)',
    Black: 'var(--faction-black)',
  },
  Board: {
    Surface: 'var(--board-surface)',
    Ink: 'var(--board-ink)',
    Border: 'var(--board-border)',
  },
  Signal: {
    Active: 'var(--signal-active)',
    Target: 'var(--signal-target)',
    Danger: 'var(--signal-danger)',
  },
  App: {
    Background: 'var(--app-background)',
    Panel: 'var(--app-panel)',
    Text: 'var(--app-text)',
    Muted: 'var(--app-muted)',
  }
};

export const Spacing = {
  Layout: {
    Xs: '0.5rem',
    Sm: '1rem',
    Md: '1.5rem',
    Lg: '2rem',
  },
  Border: {
    Thin: '1px',
    Thick: '2px',
    Heavy: '4px',
  }
};

export const Typography = {
  Font: {
    Serif: 'font-serif',
    Mono: 'font-mono',
    Sans: 'font-sans',
  },
  Weight: {
    Bold: 'font-bold',
    Black: 'font-black',
  },
  Size: {
    Xs: 'text-[10px]',
    Sm: 'text-xs',
    Base: 'text-sm',
    Lg: 'text-base',
    Xl: 'text-lg',
    X2: 'text-xl',
    X3: 'text-3xl',
  }
};

export const Layer = {
  Base: 0,
  Grid: 10,
  Piece: 20,
  Active: 30,
  Trace: 35,  // Visual Effects (Arrows, Scanner) - Above pieces, below UI
  Hud: 50,    // Dashboard controls
  Modal: 100, // Settings, Terminal
  Monitor: 999, // Performance Overlay
};

export const Effects = {
  Shadow: {
    Piece: 'inset 0 0 10px rgba(0,0,0,0.2), 0 4px 6px rgba(0,0,0,0.3)',
    Panel: 'shadow-2xl',
  },
  Transition: {
    Fast: 'transition-all duration-150',
    Medium: 'transition-all duration-300',
  }
};
