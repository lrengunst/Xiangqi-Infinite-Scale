
/**
 * @description  Raw color definitions.
 * @purpose      Data source for the Theme Engine.
 */

export interface Scheme {
  Faction: {
    Red: string;
    Black: string;
  };
  Board: {
    Surface: string;
    Ink: string;
    Border: string;
  };
  Signal: {
    Active: string;
    Target: string;
    Danger: string;
  };
  App: {
    Background: string;
    Panel: string;
    Text: string;
    Muted: string;
  };
}

export const War: Scheme = {
  Faction: {
    Red: '#b91c1c',   // Aggressive Red
    Black: '#0a0a0a', // Deep Black
  },
  Board: {
    Surface: '#e6cba5', // Parchment
    Ink: '#5c4033',     // Dried Blood/Ink
    Border: '#5c4033',
  },
  Signal: {
    Active: '#facc15', // Alert Yellow
    Target: '#22c55e', // Lock-on Green
    Danger: '#ef4444', // Critical Red
  },
  App: {
    Background: '#171717', // Void
    Panel: '#262626',      // Bunker
    Text: '#e5e5e5',       // Terminal Text
    Muted: '#525252',      // Dimmed
  }
};

export const Zen: Scheme = {
  Faction: {
    Red: '#be123c',   // Rose Red
    Black: '#1f2937', // Charcoal
  },
  Board: {
    Surface: '#f5f5f4', // Stone Paper
    Ink: '#44403c',     // Stone Gray
    Border: '#78716c',
  },
  Signal: {
    Active: '#0ea5e9', // Sky Blue
    Target: '#10b981', // Jade Green
    Danger: '#f43f5e', // Coral
  },
  App: {
    Background: '#e5e5e5', // Mist
    Panel: '#ffffff',      // Cloud
    Text: '#171717',       // Ink
    Muted: '#a3a3a3',      // Fog
  }
};
