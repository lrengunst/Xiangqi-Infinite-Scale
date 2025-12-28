
/**
 * @description  The Codex (Persistent Memory).
 * @purpose      Allows the user to manually override AI logic ("Teaching Mode").
 * @storage      LocalStorage.
 * @consistency  Eventually Consistent (Requires explicit refresh in Workers).
 */

const KEY = 'ARES_CODEX_V1';

// In-memory cache for O(1) access
// This CACHE is local to the Thread (Main or Worker)
let CACHE: Map<string, number> = new Map();

/**
 * @description  Load data from Disk to Memory (READ/SYNC).
 * @return       Number of entries loaded.
 */
export const refresh = (): number => {
    try {
        if (typeof localStorage === 'undefined') return 0;
        
        const raw = localStorage.getItem(KEY);
        if (raw) {
            const data = JSON.parse(raw);
            CACHE.clear(); // Reset before load to ensure exact sync
            Object.entries(data).forEach(([hash, move]) => {
                CACHE.set(hash, Number(move));
            });
        }
        return CACHE.size;
    } catch (e) {
        console.warn("Codex Sync Failed", e);
        return 0;
    }
};

// Initial Load
refresh();

/**
 * @description  Persist Memory to Disk (WRITE).
 */
const persist = () => {
    try {
        if (typeof localStorage === 'undefined') return;
        const obj = Object.fromEntries(CACHE);
        localStorage.setItem(KEY, JSON.stringify(obj));
    } catch (e) {
        console.warn("Codex Save Failed (Quota Exceeded?)", e);
    }
};

// --- CRUD OPERATIONS ---

/**
 * @description CREATE / UPDATE: Teach the AI a move.
 */
export const imprint = (hash: bigint, move: number): void => {
    const id = hash.toString(16);
    CACHE.set(id, move);
    persist();
    console.info(`[A.R.E.S] Knowledge Imprinted: ${id} => ${move}`);
};

/**
 * @description BATCH CREATE / UPDATE: Optimized for bulk operations.
 */
export const imprintBatch = (entries: { hash: bigint, move: number }[]): number => {
    let count = 0;
    entries.forEach(({ hash, move }) => {
        const id = hash.toString(16);
        if (!CACHE.has(id) || CACHE.get(id) !== move) {
            CACHE.set(id, move);
            count++;
        }
    });
    
    if (count > 0) {
        persist();
        console.info(`[A.R.E.S] Batch Imprinted: ${count} new patterns.`);
    }
    return count;
};

/**
 * @description READ: Recall a move from memory.
 */
export const recall = (hash: bigint): number => {
    const id = hash.toString(16);
    return CACHE.get(id) || 0;
};

/**
 * @description DELETE: Forget a specific position.
 */
export const forget = (hash: bigint): void => {
    const id = hash.toString(16);
    if (CACHE.delete(id)) {
        persist();
        console.info(`[A.R.E.S] Knowledge Erased: ${id}`);
    }
};

/**
 * @description DELETE ALL: Factory Reset.
 */
export const wipe = (): void => {
    CACHE.clear();
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(KEY);
        }
    } catch(e) {}
    console.info("[A.R.E.S] CODEX WIPED.");
};

export const size = (): number => CACHE.size;

/**
 * @description EXPORT: Dump knowledge as Source Code.
 */
export const dump = (): string => {
    // Ensure we have the latest data from disk before dumping
    refresh();
    
    let output = "// PASTE THIS INTO engine/library.ts -> KNOWLEDGE\n";
    output += "const KNOWLEDGE: Record<string, number> = {\n";
    
    if (CACHE.size === 0) {
        output += "    // No knowledge learned yet.\n";
        output += "    // Use the Auditor to 'Teach' the AI mistakes, then Dump again.\n";
    } else {
        CACHE.forEach((move, hash) => {
            const from = move >> 8;
            const to = move & 0xFF;
            output += `    "${hash}": ${move}, // Fix: ${from}->${to}\n`;
        });
    }
    
    output += "};";
    return output;
};
