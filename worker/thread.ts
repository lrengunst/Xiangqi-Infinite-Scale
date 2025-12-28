import { Inbox, Outbox } from './protocol';

type Handler = (data: Outbox) => void;

/**
 * @module       Worker Runtime Assembler (V5 - THE RESTORATION)
 * @description  Fixes "ReferenceError: Can't find variable: evaluate".
 * @optimization Zero-Allocation, Flat Memory Architecture.
 */

// -----------------------------------------------------------------------------
// SECTOR 0: HEADER (Debug & Safety)
// -----------------------------------------------------------------------------
const SECTOR_HEADER = `
"use strict";

// --- THE LIGHTHOUSE: GLOBAL ERROR TRAP ---
self.onerror = function(msg, url, line, col, error) {
    const reason = "WORKER_CRASH: " + msg + " (Line " + line + ")";
    console.error(reason);
    self.postMessage({ signal: 2, reason: reason }); // Signal.Error = 2
    return true; // Suppress default browser error
};

console.log("[A.R.E.S] WORKER_BOOT_SEQUENCE_INIT");
`;

// -----------------------------------------------------------------------------
// SECTOR 1: PHYSICS & CONSTANTS
// -----------------------------------------------------------------------------
const SECTOR_PHYSICS = `
// --- PHYSICS ---
const WIDTH = 9;
const HEIGHT = 10;
const SIZE = 90;
const Side = { Red: 0, Black: 1 };
const Role = { Empty: 0, General: 1, Advisor: 2, Elephant: 3, Horse: 4, Chariot: 5, Cannon: 6, Soldier: 7 };

const MASK_SIDE = 0x10;
const MASK_ROLE = 0x0F;
const role = (p) => p & MASK_ROLE;
const side = (p) => (p & MASK_SIDE) >>> 4;
const encode = (s, r) => (s << 4) | r;

const FILES = new Int8Array(90);
const RANKS = new Int8Array(90);
for (let i = 0; i < 90; i++) { FILES[i] = i % 9; RANKS[i] = Math.floor(i / 9); }
const file = (i) => FILES[i];
const rank = (i) => RANKS[i];
const bound = (i) => i >= 0 && i < 90;

const ORTHOGONAL = new Int8Array([-9, 9, -1, 1]);
const DIAGONAL = new Int8Array([-10, -8, 8, 10]);
const HORSE = new Int8Array([-19, -17, -11, -7, 7, 11, 17, 19]);
const HORSE_Y = new Int8Array([-2, -2, -1, -1, 1, 1, 2, 2]);
const BLOCK = new Int8Array([-9, -9, -1, 1, -1, 1, 9, 9]);
const ELEPHANT = new Int8Array([-20, -16, 16, 20]);
const ELEPHANT_Y = new Int8Array([-2, -2, 2, 2]);
const EYE = new Int8Array([-10, -8, 8, 10]);

const ZONES = [new Int8Array(90), new Int8Array(90)];
[66, 67, 68, 75, 76, 77, 84, 85, 86].forEach(i => ZONES[0][i] = 1);
[3, 4, 5, 12, 13, 14, 21, 22, 23].forEach(i => ZONES[1][i] = 1);
`;

// -----------------------------------------------------------------------------
// SECTOR 2: MEMORY & HASHING
// -----------------------------------------------------------------------------
const SECTOR_MEMORY = `
// --- MEMORY ---
const BUFFER = new Int32Array(8192);
const HISTORY = new Int32Array(2 * 90 * 90);
const KILLERS = new Int32Array(128);

// Mulberry32
let seed = 0xDEADBEEF;
const rand32 = () => {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0);
};
const rand64 = () => (BigInt(rand32()) << 32n) | BigInt(rand32());

const KEYS = new BigUint64Array(2 * 8 * 90);
const SIDE_KEY = rand64();
for(let i=0; i<KEYS.length; i++) KEYS[i] = rand64();

const key = (s, r, i) => KEYS[(s * 720) + (r * 90) + i];

const computeHash = (board, turn) => {
    let h = 0n;
    if (turn === 1) h ^= SIDE_KEY;
    for(let i=0; i<90; i++) {
        const p = board[i];
        if (p) h ^= key(side(p), role(p), i);
    }
    return h;
};

const modifyHash = (h, board, move, cap) => {
    let next = h ^ SIDE_KEY;
    const sIdx = move >> 8;
    const tIdx = move & 0xFF;
    const p = board[tIdx];
    next ^= key(side(p), role(p), sIdx);
    next ^= key(side(p), role(p), tIdx);
    if (cap) next ^= key(side(cap), role(cap), tIdx);
    return next;
};

const TT_SIZE = 1048576;
const TT_MASK = BigInt(TT_SIZE - 1);
const TT_KEYS = new BigUint64Array(TT_SIZE);
const TT_VALS = new Int16Array(TT_SIZE);
const TT_MOVES = new Uint16Array(TT_SIZE);
const TT_FLAGS = new Uint8Array(TT_SIZE);
const TT_DEPTHS = new Int8Array(TT_SIZE);

const ttSave = (hash, depth, val, flag, move) => {
    const i = Number(hash & TT_MASK);
    if (TT_KEYS[i] !== 0n && TT_KEYS[i] !== hash) {
        if (depth < TT_DEPTHS[i]) return;
    }
    TT_KEYS[i] = hash;
    TT_VALS[i] = val;
    TT_FLAGS[i] = flag;
    TT_DEPTHS[i] = depth;
    TT_MOVES[i] = move;
};

const ttLoad = (hash, depth, alpha, beta) => {
    const i = Number(hash & TT_MASK);
    if (TT_KEYS[i] !== hash) return null;
    if (TT_DEPTHS[i] < depth) return null;
    
    const val = TT_VALS[i];
    const flag = TT_FLAGS[i];
    
    if (flag === 0) return val;
    if (flag === 1 && val >= beta) return beta;
    if (flag === 2 && val <= alpha) return alpha;
    return null;
};

const ttHint = (hash) => {
    const i = Number(hash & TT_MASK);
    return (TT_KEYS[i] === hash) ? TT_MOVES[i] : 0;
};

const ttClear = () => {
    TT_KEYS.fill(0n);
    HISTORY.fill(0);
    KILLERS.fill(0);
};
`;

// -----------------------------------------------------------------------------
// SECTOR 3: GENERATION & RULES
// -----------------------------------------------------------------------------
const SECTOR_RULES = `
// --- RULES ---
function threat(board, turn) {
    let king = -1;
    const start = turn === 0 ? 66 : 3;
    const end = turn === 0 ? 87 : 24;
    for(let i=start; i<end; i++) {
        const p = board[i];
        if(p && role(p) === 1 && side(p) === turn) { king = i; break; }
    }
    if (king === -1) return true;

    const enemy = turn ^ 1;
    for (let k = 0; k < 4; k++) {
        const d = ORTHOGONAL[k];
        let c = king + d;
        let obs = 0;
        while(bound(c)) {
            if (Math.abs(d) === 1 && RANKS[c] !== RANKS[c-d]) break;
            const p = board[c];
            if (p) {
                if (side(p) === enemy) {
                    const r = role(p);
                    if (r === 5 && obs === 0) return true;
                    if (r === 6 && obs === 1) return true;
                    if (r === 7 && obs === 0) {
                        const dist = Math.abs(c - king);
                        if (dist === 1 || dist === 9) return true;
                    }
                    if (r === 1 && obs === 0) return true;
                }
                obs++;
                if (obs > 1) break;
            }
            c += d;
        }
    }
    for (let k = 0; k < 8; k++) {
        const d = HORSE[k];
        const t = king + d;
        if (bound(t) && RANKS[t] === RANKS[king] + HORSE_Y[k]) {
            const p = board[t];
            if (p && side(p) === enemy && role(p) === 4) {
                if (board[king + BLOCK[k]] === 0) return true;
            }
        }
    }
    return false;
}

function generate(board, turn, offset, captureOnly) {
    let ptr = offset;
    const red = turn === 0;
    const zone = ZONES[turn];

    for (let i = 0; i < 90; i++) {
        const p = board[i];
        if (p === 0 || side(p) !== turn) continue;
        const r = role(p);
        const row = RANKS[i];

        if (r === 7) {
            const fwd = red ? i - 9 : i + 9;
            if (bound(fwd)) {
                const t = board[fwd];
                if ((!captureOnly && t === 0) || (t && side(t) !== turn)) BUFFER[ptr++] = (i << 8) | fwd;
            }
            if ((red && row < 5) || (!red && row > 4)) {
                [-1, 1].forEach(d => {
                    const tIdx = i + d;
                    if (RANKS[tIdx] === row) {
                        const t = board[tIdx];
                        if ((!captureOnly && t === 0) || (t && side(t) !== turn)) BUFFER[ptr++] = (i << 8) | tIdx;
                    }
                });
            }
        } 
        else if (r === 4) {
            for (let k = 0; k < 8; k++) {
                const tIdx = i + HORSE[k];
                if (!bound(tIdx)) continue;
                if (RANKS[tIdx] !== row + HORSE_Y[k]) continue;
                if (board[i + BLOCK[k]]) continue;
                const v = board[tIdx];
                if ((!captureOnly && v === 0) || (v && side(v) !== turn)) BUFFER[ptr++] = (i << 8) | tIdx;
            }
        }
        else if (r === 5 || r === 6) {
            for (let k = 0; k < 4; k++) {
                const d = ORTHOGONAL[k];
                let c = i + d;
                let mount = false;
                while (bound(c)) {
                    if (Math.abs(d) === 1 && RANKS[c] !== RANKS[c-d]) break;
                    const v = board[c];
                    if (!mount) {
                        if (v === 0) {
                            if (!captureOnly && r === 5) BUFFER[ptr++] = (i << 8) | c;
                            if (!captureOnly && r === 6) BUFFER[ptr++] = (i << 8) | c;
                        } else {
                            if (r === 5 && side(v) !== turn) { BUFFER[ptr++] = (i << 8) | c; break; }
                            if (r === 5) break; 
                            mount = true;
                        }
                    } else {
                        if (v) {
                            if (side(v) !== turn && r === 6) BUFFER[ptr++] = (i << 8) | c;
                            break;
                        }
                    }
                    c += d;
                }
            }
        }
        else if (r === 1 || r === 2) {
            const vec = r === 1 ? ORTHOGONAL : DIAGONAL;
            for (let k = 0; k < 4; k++) {
                const tIdx = i + vec[k];
                if (bound(tIdx) && zone[tIdx]) {
                    const v = board[tIdx];
                    if ((!captureOnly && v === 0) || (v && side(v) !== turn)) BUFFER[ptr++] = (i << 8) | tIdx;
                }
            }
        }
        else if (r === 3) {
            for (let k = 0; k < 4; k++) {
                const tIdx = i + ELEPHANT[k];
                if (bound(tIdx) && RANKS[tIdx] === row + ELEPHANT_Y[k] && 
                   ((red && RANKS[tIdx] >= 5) || (!red && RANKS[tIdx] <= 4)) &&
                   board[i + EYE[k]] === 0) {
                    const v = board[tIdx];
                    if ((!captureOnly && v === 0) || (v && side(v) !== turn)) BUFFER[ptr++] = (i << 8) | tIdx;
                }
            }
        }
    }
    return ptr;
}
`;

// -----------------------------------------------------------------------------
// SECTOR 4: INTELLIGENCE
// -----------------------------------------------------------------------------
const SECTOR_BRAIN = `
// --- BRAIN ---
const PST = new Int16Array(1440);
(function() {
    const MAT = [0, 20000, 120, 120, 270, 600, 285, 30];
    const MAPS = [
        [], // Empty
        [0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0, 0,0,0,-10,-10,-10,0,0,0, 0,0,0,0,0,0,0,0,0, 0,0,0,0,5,0,0,0,0], // Gen
        [0,0,0,0,0,0,0,0,0], // Adv
        [0,0,0,0,0,0,0,0,0], // Ele
        [-10,5,5,5,5,5,5,5,-10, -10,5,20,30,30,30,20,5,-10, -10,10,25,40,40,40,25,10,-10, -10,10,20,25,25,25,20,10,-10, -10,5,15,20,20,20,15,5,-10, -10,5,15,20,20,20,15,5,-10, -10,10,15,20,20,20,15,10,-10, -10,5,10,15,15,15,10,5,-10, -10,-5,5,10,5,10,5,-5,-10, -20,-10,-10,-10,-10,-10,-10,-10,-20], // Horse
        [10,15,15,15,15,15,15,15,10, 20,30,30,30,30,30,30,30,20, 20,30,30,30,30,30,30,30,20, 20,40,40,40,40,40,40,40,20, 20,40,40,40,40,40,40,40,20, 10,20,20,20,20,20,20,20,10, 10,15,15,15,15,15,15,15,10, 5,15,20,15,15,15,20,15,5, 10,15,20,10,10,10,20,15,10, -10,20,20,20,20,20,20,20,-10], // Rook
        [5,5,10,15,20,15,10,5,5, 5,5,5,5,5,5,5,5,5, 10,10,15,20,25,20,15,10,10, 5,10,10,10,15,10,10,10,5, 0,5,5,5,5,5,5,5,0, 0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0, 0,5,0,5,10,5,0,5,0, 0,5,5,5,5,5,5,5,0, 0,0,0,0,0,0,0,0,0], // Cannon
        [0,0,0,0,0,0,0,0,0, 220,240,260,280,300,280,260,240,220, 180,200,220,240,260,240,220,200,180, 100,120,140,160,180,160,140,120,100, 50,60,80,100,120,100,80,60,50, 0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0] // Pawn
    ];

    for(let s=0; s<2; s++) {
        for(let r=0; r<8; r++) {
            const map = MAPS[r];
            const base = MAT[r];
            for(let i=0; i<90; i++) {
                let bonus = 0;
                if(map && map.length === 90) {
                    const idx = s === 0 ? i : (89 - i);
                    bonus = map[idx];
                }
                PST[(s*720) + (r*90) + i] = base + bonus;
            }
        }
    }
})();

function evaluate(board) {
    let s = 0;
    for(let i=0; i<90; i++) {
        const p = board[i];
        if (p) {
            const v = PST[(side(p)*720) + (role(p)*90) + i];
            if (side(p) === 0) s += v; else s -= v;
        }
    }
    return s;
}

function commit(board, from, to) {
    const captured = board[to];
    board[to] = board[from];
    board[from] = 0;
    return captured;
}

function revert(board, from, to, captured) {
    board[from] = board[to];
    board[to] = captured;
}

function delta(p, f, t, c) {
    const s = side(p);
    const r = role(p);
    let v = PST[(s*720)+(r*90)+t] - PST[(s*720)+(r*90)+f];
    if (c) v += PST[(side(c)*720)+(role(c)*90)+t];
    return s === 0 ? v : -v;
}

const INF = 30000;
let NODES = 0;
let HITS = 0;

function pick(board, start, end, current, ttMove, turn, ply) {
    let bestScore = -Infinity;
    let bestIdx = -1;
    
    for(let i=current; i<end; i++) {
        const m = BUFFER[i];
        let score = 0;
        if (m === ttMove) score = 10000000;
        else {
            const t = m & 0xFF;
            const cap = board[t];
            if (cap) score = 1000000 + (role(cap) * 10); 
            else {
                if (ply < 64 && KILLERS[ply] === m) score = 900000;
                else {
                    const s = m >> 8;
                    score = HISTORY[(turn * 8100) + (s * 90) + t];
                }
            }
        }
        
        if (score > bestScore) {
            bestScore = score;
            bestIdx = i;
        }
    }
    
    if (bestIdx !== -1) {
        const temp = BUFFER[current];
        BUFFER[current] = BUFFER[bestIdx];
        BUFFER[bestIdx] = temp;
    }
}

function quiescence(board, alpha, beta, turn, score, ptr) {
    NODES++;
    if (score >= beta) return beta;
    if (score > alpha) alpha = score;
    
    const start = ptr;
    const end = generate(board, turn, start, true); 
    
    for(let i=start; i<end; i++) {
        pick(board, start, end, i, 0, turn, 100);
        const m = BUFFER[i];
        const s = m >> 8;
        const t = m & 0xFF;
        const p = board[s];
        const c = commit(board, s, t);
        
        const d = delta(p, s, t, c);
        const val = -quiescence(board, -beta, -alpha, turn^1, score + d, end);
        
        revert(board, s, t, c);
        
        if (val >= beta) return beta;
        if (val > alpha) alpha = val;
    }
    return alpha;
}

function pvs(board, depth, ply, alpha, beta, turn, score, hash, ptr, canNull) {
    NODES++;
    
    const ttScore = ttLoad(hash, depth, alpha, beta);
    if (ttScore !== null && ply > 0) {
        HITS++;
        return ttScore;
    }
    
    if (depth <= 0) return quiescence(board, alpha, beta, turn, score, ptr);
    
    if (canNull && depth >= 3 && !threat(board, turn)) {
        const val = -pvs(board, depth - 3, ply + 1, -beta, -beta + 1, turn^1, score, hash ^ SIDE_KEY, ptr, false);
        if (val >= beta) return beta;
    }
    
    const start = ptr;
    const end = generate(board, turn, start, false);
    
    if (start === end) return -INF + ply; 
    
    const ttMove = ttHint(hash);
    let bestMove = 0;
    let bestScore = -INF;
    let flag = 2; // Upper
    let legal = 0;
    
    for(let i=start; i<end; i++) {
        pick(board, start, end, i, ttMove, turn, ply);
        const m = BUFFER[i];
        const s = m >> 8;
        const t = m & 0xFF;
        const p = board[s];
        
        const c = commit(board, s, t);
        
        if (threat(board, turn)) {
            revert(board, s, t, c);
            continue;
        }
        legal++;
        
        const dScore = delta(p, s, t, c);
        const nextHash = modifyHash(hash, board, m, c);
        let val;
        
        if (legal === 1) {
            val = -pvs(board, depth - 1, ply + 1, -beta, -alpha, turn^1, score + dScore, nextHash, end, true);
        } else {
            let r = 0;
            if (depth >= 3 && legal > 4 && c === 0) r = 1;
            val = -pvs(board, depth - 1 - r, ply + 1, -alpha - 1, -alpha, turn^1, score + dScore, nextHash, end, true);
            if (val > alpha && r > 0) {
                val = -pvs(board, depth - 1, ply + 1, -alpha - 1, -alpha, turn^1, score + dScore, nextHash, end, true);
            }
            if (val > alpha && val < beta) {
                val = -pvs(board, depth - 1, ply + 1, -beta, -alpha, turn^1, score + dScore, nextHash, end, true);
            }
        }
        
        revert(board, s, t, c);
        
        if (val > bestScore) {
            bestScore = val;
            bestMove = m;
            if (val > alpha) {
                alpha = val;
                flag = 0;
                if (alpha >= beta) {
                    flag = 1;
                    if (c === 0 && ply < 64) {
                        KILLERS[ply] = m;
                        const hIdx = (turn * 8100) + (s * 90) + t;
                        HISTORY[hIdx] += depth * depth;
                        if (HISTORY[hIdx] > 1000000) {
                            for(let k=0; k<HISTORY.length; k++) HISTORY[k] >>= 1;
                        }
                    }
                    break;
                }
            }
        }
    }
    
    if (legal === 0) return -INF + ply;
    
    ttSave(hash, depth, bestScore, flag, bestMove);
    return bestScore;
}

function root(board, turn, depth, candidates, callback, shouldPurge) {
    if (shouldPurge) {
        ttClear();
    }
    NODES = 0;
    
    const hash = computeHash(board, turn);
    const score = evaluate(board);
    
    let bestMove = 0;
    let bestScore = -INF;
    
    // SAFEGUARD: If candidates is passed but empty/null, generate all
    // If passed as empty array [], it implies we have NO work (Root Splitting edge case)
    // We must respect the empty array if explicitly passed, but handle undefined safely.
    
    let moveList = candidates;
    
    if (!moveList) {
        // Normal Mode: Generate all moves
        moveList = [];
        const end = generate(board, turn, 0, false);
        for(let i=0; i<end; i++) moveList.push(BUFFER[i]);
    }
    
    // If moveList is empty here, we simply return bestMove=0.
    // This allows the Worker to return "Moved: 0" (No move) instead of crashing/hanging.
    if (moveList.length === 0) {
        return { move: 0, score: -INF, nodes: 0 };
    }
    
    for(let d=1; d<=depth; d++) {
        let alpha = -INF;
        let beta = INF;
        
        if (d > 2) {
            alpha = bestScore - 30;
            beta = bestScore + 30;
        }
        
        for(let i=0; i<moveList.length; i++) {
            const m = moveList[i];
            const s = m >> 8;
            const t = m & 0xFF;
            const p = board[s];
            const c = commit(board, s, t);
            
            if (threat(board, turn)) {
                revert(board, s, t, c);
                continue;
            }
            
            const nextHash = modifyHash(hash, board, m, c);
            const dScore = delta(p, s, t, c);
            
            const val = -pvs(board, d - 1, 1, -beta, -alpha, turn^1, score + dScore, nextHash, 4000, true);
            
            revert(board, s, t, c);
            
            if (val > bestScore) {
                bestScore = val;
                bestMove = m;
            }
            
            if (callback) {
                callback({
                    depth: d,
                    nodes: NODES,
                    score: bestScore,
                    best: bestMove,
                    hits: HITS
                });
            }
        }
        if (bestScore > 20000) break;
    }
    
    return { move: bestMove, score: bestScore, nodes: NODES };
}
`;

// -----------------------------------------------------------------------------
// SECTOR 5: BOOTLOADER
// -----------------------------------------------------------------------------
const SECTOR_BOOT = `
// --- BOOT ---
self.onmessage = function(e) {
    const data = e.data;
    console.log("[A.R.E.S] WORKER_CMD:", data.command);
    
    if (data.command === 1) { // Think
        try {
            const result = root(
                data.board, 
                data.side, 
                data.depth, 
                data.candidates,
                (stats) => self.postMessage({ signal: 4, telemetry: stats }),
                data.purge 
            );
            self.postMessage({ 
                signal: 1, // Moved
                move: result.move, 
                score: result.score, 
                telemetry: { nodes: result.nodes, time: 0 } 
            });
        } catch(err) {
            const msg = "SEARCH_CRASH: " + err.toString();
            console.error(msg);
            self.postMessage({ signal: 2, reason: msg });
        }
    }
};
self.postMessage({ signal: 3 }); // Ready
console.log("[A.R.E.S] WORKER_READY_SIGNAL_SENT");
`;

export class Thread {
  public readonly id: number;
  private scope: Worker;
  private uri: string;

  constructor(id: number, onSignal: Handler, onError: (e: ErrorEvent) => void) {
    this.id = id;

    // ASSEMBLER: Add newlines to prevent comment bleeding
    const source = [
        SECTOR_HEADER,
        "\n",
        SECTOR_PHYSICS,
        "\n",
        SECTOR_MEMORY,
        "\n",
        SECTOR_RULES,
        "\n",
        SECTOR_BRAIN,
        "\n",
        SECTOR_BOOT
    ];

    const blob = new Blob(source, { type: 'application/javascript' });
    this.uri = URL.createObjectURL(blob);

    this.scope = new Worker(this.uri);
    this.scope.onmessage = (e) => onSignal(e.data);
    this.scope.onerror = (e) => onError(e);
  }

  public send(message: Inbox): void {
    this.scope.postMessage(message);
  }

  public kill(): void {
    this.scope.terminate();
    URL.revokeObjectURL(this.uri);
  }
}
