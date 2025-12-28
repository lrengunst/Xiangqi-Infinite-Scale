
import { Codec, Space, Gen, Flow, Factory, Types, Memory, Consts, Query } from '../engine';

/**
 * @description  THE SUPREME TRIBUNAL (TÒA ÁN TỐI CAO)
 * @purpose      Unified Testing Suite: PERFORMANCE (Speed) + LOGIC (Correctness).
 *               Zero Tolerance for bugs.
 */

interface Metric {
  category: "PERFORMANCE" | "LOGIC";
  test: string;
  expected: string | number;
  actual: string | number;
  status: "PASS" | "FAIL";
}

const metrics: Metric[] = [];

// --- UTILITIES ---

const assert = (test: string, condition: boolean, expected: string, actual: string) => {
    metrics.push({
        category: "LOGIC",
        test,
        expected,
        actual,
        status: condition ? "PASS" : "FAIL"
    });
};

const setup = (): Types.Board => new Int8Array(Consts.SIZE);

const place = (board: Types.Board, index: number, side: Types.Side, role: Types.Role) => {
    board[index] = Codec.encode(side, role);
};

// Advanced: Check legality directly
const isLegal = (board: Types.Board, from: number, to: number, side: Types.Side): boolean => {
    return Query.legal(board, from, to, side);
};

const getMoves = (board: Types.Board, side: Types.Side): number[] => {
    const end = Gen.generate(board, side, 0);
    const moves: number[] = [];
    for(let index=0; index<end; index++) {
        moves.push(Memory.BUFFER[index]);
    }
    return moves; 
};

const hasTarget = (moves: number[], target: number): boolean => {
    for (let index = 0; index < moves.length; index++) {
        if ((moves[index] & 0xFF) === target) return true;
    }
    return false;
};

// --- LOGIC TRIALS (THE LAW) ---

const runLogic = () => {
    // 1. ELEPHANT: THE WRAPPING & BLOCKING TEST
    {
        const board = setup();
        place(board, 18, Types.Side.Black, Types.Role.Elephant); 
        const moves = getMoves(board, Types.Side.Black);
        assert("ELEPHANT_BOUNDARY", 
            hasTarget(moves, 2) && hasTarget(moves, 38) && moves.length === 2, "2 Moves", `${moves.length} Moves`);
        
        place(board, 28, Types.Side.Red, Types.Role.Soldier); 
        const blockedMoves = getMoves(board, Types.Side.Black);
        assert("ELEPHANT_BLOCKING", !hasTarget(blockedMoves, 38), "Blocked", "Status Checked");
    }

    // 2. HORSE: THE LEG TEST
    {
        const board = setup();
        const center = Space.flatten(4, 4); 
        place(board, center, Types.Side.Red, Types.Role.Horse);
        place(board, 41, Types.Side.Red, Types.Role.Soldier);
        const moves = getMoves(board, Types.Side.Red);
        const t1 = Space.flatten(6, 3);
        const t2 = Space.flatten(6, 5);
        assert("HORSE_LEG_BLOCK", !hasTarget(moves, t1) && !hasTarget(moves, t2), "Blocked Right", "Checked");
    }

    // 3. GENERAL: PALACE CONFINEMENT
    {
        const board = setup();
        place(board, 4, Types.Side.Black, Types.Role.General);
        const moves = getMoves(board, Types.Side.Black);
        assert("GENERAL_PALACE_BOUNDS", moves.length === 3, "3 Moves", `${moves.length} Moves`);
    }
    
    // 4. FLYING GENERAL
    {
        const board = setup();
        const redGen = Space.flatten(4, 9);
        const blackGen = Space.flatten(4, 0);
        const blocker = Space.flatten(4, 5);
        const target = Space.flatten(3, 5); 
        place(board, redGen, Types.Side.Red, Types.Role.General);
        place(board, blackGen, Types.Side.Black, Types.Role.General);
        place(board, blocker, Types.Side.Red, Types.Role.Soldier);
        const valid = isLegal(board, blocker, target, Types.Side.Red);
        assert("RULE_FLYING_GENERAL", valid === false, "Illegal (Face-off)", valid ? "Legal" : "Illegal");
    }

    // 5. ABSOLUTE PIN
    {
        const board = setup();
        const redGen = Space.flatten(4, 9);
        const redCannon = Space.flatten(4, 8);
        const blackChariot = Space.flatten(4, 5);
        const target = Space.flatten(3, 8);
        place(board, redGen, Types.Side.Red, Types.Role.General);
        place(board, redCannon, Types.Side.Red, Types.Role.Cannon);
        place(board, blackChariot, Types.Side.Black, Types.Role.Chariot);
        const valid = isLegal(board, redCannon, target, Types.Side.Red);
        assert("RULE_ABSOLUTE_PIN", valid === false, "Illegal (Pinned)", valid ? "Legal" : "Illegal");
    }

    // 6. SOLDIER RIVER CROSSING
    {
        const board = setup();
        const sHome = Space.flatten(0, 6); // Red Soldier at Home (Rank 6)
        const tHome = Space.flatten(1, 6); // Try side move
        const sAway = Space.flatten(0, 3); // Red Soldier Across River (Rank 3)
        const tAway = Space.flatten(1, 3); // Try side move
        
        place(board, sHome, Types.Side.Red, Types.Role.Soldier);
        place(board, sAway, Types.Side.Red, Types.Role.Soldier);

        // Before river (Rank 6 for Red) -> Side move illegal
        const validHome = isLegal(board, sHome, tHome, Types.Side.Red);
        // After river (Rank 3 for Red) -> Side move legal
        const validAway = isLegal(board, sAway, tAway, Types.Side.Red);

        assert("RULE_SOLDIER_CROSSING", !validHome && validAway, "Home:Block, Away:Allow", `H:${validHome}, A:${validAway}`);
    }

    // --- NEW PERIMETER DEFENSE TESTS ---

    // 7. ELEPHANT RIVER BARRIER
    {
        const board = setup();
        // Red Elephant at (2, 5) - River Edge (Bottom side is 5-9)
        const ele = Space.flatten(2, 5);
        place(board, ele, Types.Side.Red, Types.Role.Elephant);
        
        // Try move to (4, 3) - Across river (Rank 3)
        // Vector is (+2, -2). Valid geometry.
        // Should be blocked by River Rule (Red cannot go < Rank 5).
        
        const moves = getMoves(board, Types.Side.Red);
        const targetAcross = Space.flatten(4, 3);
        const targetBack = Space.flatten(0, 7); // Valid back move
        
        assert("RULE_ELEPHANT_RIVER", 
            !hasTarget(moves, targetAcross) && hasTarget(moves, targetBack), 
            "Cannot Cross River", 
            hasTarget(moves, targetAcross) ? "Crossed!" : "Blocked"
        );
    }

    // 8. ADVISOR PALACE WALLS
    {
        const board = setup();
        // Red Advisor at Top-Left of Palace (3, 7)
        // Palace for Red is Cols 3-5, Rows 7-9.
        const adv = Space.flatten(3, 7);
        place(board, adv, Types.Side.Red, Types.Role.Advisor);
        
        // Try move to (2, 6) - Outside Palace
        // Vector (-1, -1). Valid geometry.
        // Should be blocked by Zone check.
        
        const moves = getMoves(board, Types.Side.Red);
        const targetOut = Space.flatten(2, 6);
        const targetIn = Space.flatten(4, 8); // Center
        
        assert("RULE_ADVISOR_PALACE",
            !hasTarget(moves, targetOut) && hasTarget(moves, targetIn),
            "Confined to Palace",
            hasTarget(moves, targetOut) ? "Escaped!" : "Confined"
        );
    }

    // 9. GENERAL SUICIDE (Direct Move into Check)
    {
        const board = setup();
        const gen = Space.flatten(4, 9); // Red General at bottom center
        const enemy = Space.flatten(3, 9); // Black Chariot right next to it
        
        place(board, gen, Types.Side.Red, Types.Role.General);
        place(board, enemy, Types.Side.Black, Types.Role.Chariot);
        
        // General tries to move Left to (3, 9) -> Eating the Chariot (Legal)
        // General tries to move Right to (5, 9) -> Empty.
        // BUT suppose enemy Cannon is at (5, 0) sniping down column 5.
        
        const sniper = Space.flatten(5, 0);
        place(board, sniper, Types.Side.Black, Types.Role.Cannon);
        // Add a screen for Cannon? No, Cannon needs 1 screen to eat, 0 screen to move?
        // Wait, Cannon needs 1 screen to EAT. If General moves to (5,9), Cannon at (5,0) with NO screens does NOT check.
        // Let's use Chariot for simplicity.
        
        place(board, sniper, Types.Side.Black, Types.Role.Chariot); // Chariot at (5,0)
        
        // Move to (5,9) is Suicide because Chariot (5,0) attacks (5,9).
        const targetSuicide = Space.flatten(5, 9);
        const valid = isLegal(board, gen, targetSuicide, Types.Side.Red);
        
        assert("RULE_GENERAL_SUICIDE",
            valid === false,
            "Cannot move into fire",
            valid ? "Suicide Allowed" : "Blocked"
        );
    }
};

// --- PERFORMANCE TRIALS (THE SPEED) ---

const runPerf = () => {
    const board = Factory.genesis();
    const start = performance.now();
    
    // Stress Test: Generate 100k times
    for(let iteration=0; iteration<10000; iteration++) {
        Gen.generate(board, Types.Side.Red, 0);
    }
    
    const end = performance.now();
    const duration = end - start;
    
    metrics.push({
        category: "PERFORMANCE",
        test: "GEN_STRESS_10K",
        expected: "< 150ms",
        actual: `${duration.toFixed(2)}ms`,
        status: duration < 150 ? "PASS" : "FAIL"
    });
};

// --- MAIN EXECUTION ---

export const run = (): void => {
  console.clear();
  console.log("%c A.R.E.S SUPREME TRIBUNAL ", "background: #b91c1c; color: #fff; font-weight: bold; padding: 4px;");

  try {
      runLogic();
      runPerf();
  } catch (e) {
      console.error("TRIBUNAL CRASHED:", e);
      throw e;
  }

  const failures = metrics.filter(m => m.status === "FAIL");
  
  if (failures.length > 0) {
      const evidence = {
          agent: "A.R.E.S RED TEAM",
          verdict: "GUILTY",
          violations: failures
      };
      console.error(JSON.stringify(evidence, null, 2));
      throw new Error("TRIBUNAL VERDICT: GUILTY. CHECK CONSOLE.");
  }

  console.table(metrics);
  console.log("%c SYSTEM CLEAN. DEPLOYING... ", "color: #22c55e; font-weight: bold;");
};
