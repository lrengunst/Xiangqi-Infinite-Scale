
import { Board, Role, Side } from './types';
import * as Codec from './codec';
import { SIZE, WIDTH } from './consts';
import { flatten, rank } from './space';

/**
 * @description  Evaluation Logic v2.5 (Grandmaster Tuned).
 * @tactic       Aggressive Mobility & Center Control.
 * @technique    Piece-Square Tables (PST) - O(1) Lookup.
 */

const PST = new Int16Array(2 * 8 * SIZE);

// Tuned Weights: Mobility is King.
export const MATERIAL = new Int16Array(8);
MATERIAL[Role.Empty]    = 0;
MATERIAL[Role.General]  = 20000; 
MATERIAL[Role.Advisor]  = 120;
MATERIAL[Role.Elephant] = 120;
MATERIAL[Role.Horse]    = 270;
MATERIAL[Role.Cannon]   = 285;
MATERIAL[Role.Chariot]  = 600; 
MATERIAL[Role.Soldier]  = 30;

// --- STRATEGIC MAPS ---

const MAP_SOLDIER = [
    0,0,0,0,0,0,0,0,0, 
    220,240,260,280,300,280,260,240,220, 
    180,200,220,240,260,240,220,200,180, 
    100,120,140,160,180,160,140,120,100, 
    50,60,80,100,120,100,80,60,50,       
    0,0,0,0,0,0,0,0,0, 
    0,0,0,0,0,0,0,0,0, 
    0,0,0,0,0,0,0,0,0, 
    0,0,0,0,0,0,0,0,0, 
    0,0,0,0,0,0,0,0,0
];

const MAP_CHARIOT = [
    10,15,15,15,15,15,15,15,10, 
    20,30,30,30,30,30,30,30,20, 
    20,30,30,30,30,30,30,30,20, 
    20,40,40,40,40,40,40,40,20, 
    20,40,40,40,40,40,40,40,20, 
    10,20,20,20,20,20,20,20,10, 
    10,15,15,15,15,15,15,15,10, 
    5,15,20,15,15,15,20,15,5,   
    10,15,20,10,10,10,20,15,10, 
    -10,20,20,20,20,20,20,20,-10 
];

const MAP_HORSE = [
    -10,5,5,5,5,5,5,5,-10, 
    -10,5,20,30,30,30,20,5,-10, 
    -10,10,25,40,40,40,25,10,-10, 
    -10,10,20,25,25,25,20,10,-10, 
    -10,5,15,20,20,20,15,5,-10, 
    -10,5,15,20,20,20,15,5,-10, 
    -10,10,15,20,20,20,15,10,-10, 
    -10,5,10,15,15,15,10,5,-10, 
    -10,-5,5,10,5,10,5,-5,-10, 
    -20,-10,-10,-10,-10,-10,-10,-10,-20 
];

const MAP_CANNON = [
    5,5,10,15,20,15,10,5,5, 
    5,5,5,5,5,5,5,5,5, 
    10,10,15,20,25,20,15,10,10, 
    5,10,10,10,15,10,10,10,5, 
    0,5,5,5,5,5,5,5,0, 
    0,0,0,0,0,0,0,0,0, 
    0,0,0,0,0,0,0,0,0, 
    0,5,0,5,10,5,0,5,0, 
    0,5,5,5,5,5,5,5,0, 
    0,0,0,0,0,0,0,0,0
];

const MAP_GENERAL = [
    0,0,0,0,0,0,0,0,0, 
    0,0,0,0,0,0,0,0,0, 
    0,0,0,0,0,0,0,0,0, 
    0,0,0,0,0,0,0,0,0, 
    0,0,0,0,0,0,0,0,0, 
    0,0,0,0,0,0,0,0,0, 
    0,0,0,-10,-5,-10,0,0,0, 
    0,0,0,0,5,0,0,0,0, 
    0,0,0,0,10,0,0,0,0 
];

const MAP_DEFENSE = new Int16Array(90).fill(0);

const MAPS = [
    MAP_DEFENSE, // Role 0
    MAP_GENERAL, // Role 1
    MAP_DEFENSE, // Role 2
    MAP_DEFENSE, // Role 3
    MAP_HORSE,   // Role 4
    MAP_CHARIOT, // Role 5
    MAP_CANNON,  // Role 6
    MAP_SOLDIER  // Role 7
];

const compile = () => {
    for (let sideIndex = 0; sideIndex < 2; sideIndex++) {
        const side = sideIndex as Side;
        for (let roleIndex = 0; roleIndex < 8; roleIndex++) {
            const role = roleIndex as Role;
            const base = MATERIAL[role];
            const map = MAPS[role];
            
            for (let index = 0; index < SIZE; index++) {
                let bonus = 0;
                if (map.length === 90) {
                    const lookupIndex = side === Side.Red ? index : (SIZE - 1 - index);
                    bonus = map[lookupIndex];
                }
                const value = base + bonus;
                const offset = (side * 720) + (role * 90) + index;
                PST[offset] = value; 
            }
        }
    }
};

compile();

try {
    const memory = localStorage.getItem('ARES_GENOME');
    if (memory) {
        const weights = JSON.parse(memory);
        recalibrate(weights);
    }
} catch (e) {}

export function recalibrate(weights: Partial<Record<string, number>>) {
    if (weights['Horse']) MATERIAL[Role.Horse] = weights['Horse'];
    if (weights['Chariot']) MATERIAL[Role.Chariot] = weights['Chariot'];
    if (weights['Cannon']) MATERIAL[Role.Cannon] = weights['Cannon'];
    if (weights['Advisor']) MATERIAL[Role.Advisor] = weights['Advisor'];
    if (weights['Elephant']) MATERIAL[Role.Elephant] = weights['Elephant'];
    if (weights['Soldier']) MATERIAL[Role.Soldier] = weights['Soldier'];
    compile();
};

export const measure = (piece: number, index: number): number => {
  if (piece === 0) return 0;
  const side = Codec.side(piece);
  const role = Codec.role(piece);
  const offset = (side * 720) + (role * 90) + index;
  return PST[offset];
};

export const initial = (board: Board): number => {
  let redScore = 0;
  let blackScore = 0;
  for (let index = 0; index < SIZE; index++) {
    const piece = board[index];
    if (piece !== 0) {
        const value = measure(piece, index);
        if (Codec.side(piece) === Side.Red) redScore += value;
        else blackScore += value;
    }
  }
  return redScore - blackScore;
};

export const delta = (moving: number, from: number, to: number, captured: number): number => {
  const side = Codec.side(moving);
  const valueFrom = measure(moving, from);
  const valueTo = measure(moving, to);
  const valueCap = captured !== 0 ? measure(captured, to) : 0;
  const diff = valueTo - valueFrom + valueCap; 
  return side === Side.Red ? diff : -diff;
};

// --- ADVANCED REPORTING (CORTEX) ---

interface Diagnosis {
    material: number;
    position: number;
    mobility: number;
    aggression: number; // New metric
    total: number;
    patterns: string[];
}

/**
 * @description Detailed breakdown of the board state for UI visualization.
 * @complexity  O(N) - Should only be called once per render, not in search loop.
 */
export const report = (board: Board): { red: Diagnosis, black: Diagnosis, total: number, winRate: number } => {
    const stats = {
        red: { material: 0, position: 0, mobility: 0, aggression: 0, total: 0, patterns: [] as string[] },
        black: { material: 0, position: 0, mobility: 0, aggression: 0, total: 0, patterns: [] as string[] }
    };

    // Helper: Is piece at specific coordinate?
    const at = (x: number, y: number, side: Side, role: Role): boolean => {
        const idx = flatten(x, y);
        const p = board[idx];
        return p !== 0 && Codec.side(p) === side && Codec.role(p) === role;
    };

    // 1. SCAN BOARD
    for (let index = 0; index < SIZE; index++) {
        const piece = board[index];
        if (piece !== 0) {
            const side = Codec.side(piece);
            const role = Codec.role(piece);
            
            const mat = MATERIAL[role];
            
            // Re-calculate positional bonus (map value)
            let pos = 0;
            const map = MAPS[role];
            if (map.length === 90) {
                const lookupIndex = side === Side.Red ? index : (SIZE - 1 - index);
                pos = map[lookupIndex];
            }

            // Mobility & Aggression
            let mob = 0;
            let agg = 0;
            
            const r = rank(index);
            const acrossRiver = side === Side.Red ? r < 5 : r > 4;

            if (role === Role.Chariot) { mob = 20; if (acrossRiver) agg += 40; }
            if (role === Role.Horse) { mob = 15; if (acrossRiver) agg += 25; }
            if (role === Role.Cannon) { mob = 15; if (acrossRiver) agg += 20; }
            if (role === Role.Soldier && acrossRiver) { agg += 30; } // Soldiers over river are huge threats
            
            const target = side === Side.Red ? stats.red : stats.black;
            target.material += mat;
            target.position += pos;
            target.mobility += mob;
            target.aggression += agg;
            target.total += (mat + pos + mob + agg);
        }
    }

    // 2. PATTERN RECOGNITION (FORMATIONS)
    
    // RED PATTERNS
    if (at(4, 7, Side.Red, Role.Cannon)) stats.red.patterns.push("CENTRAL_CANNON");
    if (at(2, 7, Side.Red, Role.Horse) && at(6, 7, Side.Red, Role.Horse)) stats.red.patterns.push("SCREEN_HORSE");
    if (at(4, 9, Side.Red, Role.General) && at(4, 8, Side.Red, Role.Advisor)) stats.red.patterns.push("IRON_DEFENSE");
    if (at(0, 9, Side.Red, Role.Chariot) || at(8, 9, Side.Red, Role.Chariot)) stats.red.patterns.push("CORNER_ROOK");

    // BLACK PATTERNS
    if (at(4, 2, Side.Black, Role.Cannon)) stats.black.patterns.push("CENTRAL_CANNON");
    if (at(2, 2, Side.Black, Role.Horse) && at(6, 2, Side.Black, Role.Horse)) stats.black.patterns.push("SCREEN_HORSE");
    if (at(4, 0, Side.Black, Role.General) && at(4, 1, Side.Black, Role.Advisor)) stats.black.patterns.push("IRON_DEFENSE");
    if (at(0, 0, Side.Black, Role.Chariot) || at(8, 0, Side.Black, Role.Chariot)) stats.black.patterns.push("CORNER_ROOK");

    const totalScore = stats.red.total - stats.black.total;

    // 3. WIN PROBABILITY (Sigmoid)
    // Map score (-2000 to 2000) to (0% to 100%)
    // Red advantage +500 -> 75%
    const winRate = 1 / (1 + Math.exp(-totalScore / 400));

    return {
        red: stats.red,
        black: stats.black,
        total: totalScore,
        winRate: Math.round(winRate * 100)
    };
};
