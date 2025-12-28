
import { flatten, expand } from './space';
import { Role, Side } from './types';

/**
 * @description  Log Parser & Formatter.
 * @purpose      Convert raw text logs into executable machine instructions.
 * @format       "1. RED: 6 (7,7) > (4,7)"
 */

export interface Step {
  turn: number;
  side: Side;
  role: Role;
  source: number;
  target: number;
  raw: string;
}

export const parse = (log: string): Step[] => {
  const lines = log.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const steps: Step[] = [];

  // Regex: 1. RED: 6 (7,7) > (4,7)
  const pattern = /(\d+)\.\s(RED|BLACK):\s(\d+)\s\((\d+),(\d+)\)\s>\s\((\d+),(\d+)/i;

  for (const line of lines) {
    const match = line.match(pattern);
    if (match) {
      const turn = parseInt(match[1], 10);
      const side = match[2].toUpperCase() === 'RED' ? Side.Red : Side.Black;
      const role = parseInt(match[3], 10) as Role;
      
      const fx = parseInt(match[4], 10);
      const fy = parseInt(match[5], 10);
      const tx = parseInt(match[6], 10);
      const ty = parseInt(match[7], 10);

      steps.push({
        turn,
        side,
        role,
        source: flatten(fx, fy),
        target: flatten(tx, ty),
        raw: line
      });
    }
  }

  return steps;
};

export const stringify = (step: Step): string => {
    const s = expand(step.source);
    const t = expand(step.target);
    const side = step.side === Side.Red ? "RED" : "BLACK";
    return `${step.turn}. ${side}: ${step.role} (${s.x},${s.y}) > (${t.x},${t.y})`;
};

/**
 * @description Format large numbers into human-readable metrics (k/M).
 * @example     10754074 -> "10.75M"
 */
export const metric = (n: number): string => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(2)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return n.toString();
};
