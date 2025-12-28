
/**
 * @description  Defines the rigorous communication protocol between UI and Brain.
 * @purpose      Type-safe message passing.
 */

import { Board, Side, Tuning } from '../engine/types.ts';

export const Command = {
  Think: 1,
  Abort: 2,
} as const;
export type Command = typeof Command[keyof typeof Command];

export const Signal = {
  Moved: 1,
  Error: 2,
  Ready: 3,
  Feedback: 4, // NEW: Real-time progress update
} as const;
export type Signal = typeof Signal[keyof typeof Signal];

// Single Word Identity: Request
export interface Request {
  command: typeof Command.Think;
  board: Board;
  side: Side;
  depth: number; // Configurable difficulty
  book: boolean; // NEW: Allow Opening Book usage
  history?: bigint[]; // Game history for repetition detection
  purge?: boolean; // NEW: Clear Memory Cache before thinking (Force fresh calc)
  tuning?: Tuning; // NEW: Heuristic parameters
  candidates?: number[]; // NEW: Root Splitting (Subset of moves to search)
  id?: number; // Worker ID for debugging
}

// Single Word Identity: Abort
export interface Abort {
  command: typeof Command.Abort;
}

export type Inbox = Request | Abort;

export interface Telemetry {
  nodes: number; // Nodes visited
  time: number;  // Execution time (ms)
  depth?: number; // Current depth reached
  score?: number; // Current evaluation
  best?: number;  // Current best move
  rate?: number;   // Nodes per second
  line?: number[]; // Principal Variation (The best line found)
  isBook?: boolean; // Indicates if the move came from Opening Book
  
  // NEW METRICS FOR CORTEX VISUALIZER
  hits?: number;    // Transposition Table Hits
  probes?: number;  // Transposition Table Lookups
  fill?: number;    // Transposition Table Fill Rate (0-100)
  
  // MULTI-THREAD METRICS
  workers?: number; // Number of threads used
}

// Single Word Identity: Result
export interface Result {
  signal: typeof Signal.Moved;
  move: number;
  score: number;
  telemetry: Telemetry; // Added stats
}

// Single Word Identity: Progress
export interface Progress {
  signal: typeof Signal.Feedback;
  telemetry: Telemetry;
}

// Single Word Identity: Error
export interface Failure {
  signal: typeof Signal.Error;
  reason: string;
}

// Single Word Identity: Ready
export interface Status {
  signal: typeof Signal.Ready;
}

export type Outbox = Result | Failure | Status | Progress;
