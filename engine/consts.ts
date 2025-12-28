
/**
 * @description  Physical constants of the board.
 */
export const WIDTH = 9;
export const HEIGHT = 10;
export const SIZE = 90;

/**
 * @description  Static Index Map for Iterators.
 * @purpose      Avoid Array.from(board) allocation in UI loops.
 */
export const INDICES = new Int8Array(SIZE);
for (let index = 0; index < SIZE; index++) {
    INDICES[index] = index;
}

/**
 * @description  Palace coordinates for Red (Index 0) and Black (Index 1).
 * @purpose      Iteration over palace squares.
 */
export const PALACES = [
  // Red Palace (Side.Red = 0)
  [66, 67, 68, 75, 76, 77, 84, 85, 86],
  // Black Palace (Side.Black = 1)
  [3, 4, 5, 12, 13, 14, 21, 22, 23]
];

/**
 * @description  O(1) Palace Lookup Maps.
 * @purpose      Fast boolean checks (is inside palace?).
 */
export const ZONES = [new Int8Array(SIZE), new Int8Array(SIZE)];

// Pre-compute Zones
PALACES[0].forEach(index => ZONES[0][index] = 1);
PALACES[1].forEach(index => ZONES[1][index] = 1);

/**
 * @description  Movement Vectors (Physics).
 * @type         Int8Array for contiguous memory.
 */

// Orthogonal steps (General, Soldier, Chariot, Cannon)
// Up, Down, Left, Right
export const ORTHOGONAL = new Int8Array([-WIDTH, WIDTH, -1, 1]);

// Diagonal steps (Advisor)
export const DIAGONAL = new Int8Array([-WIDTH - 1, -WIDTH + 1, WIDTH - 1, WIDTH + 1]);

// Horse Movement
export const HORSE = new Int8Array([-2 * WIDTH - 1, -2 * WIDTH + 1, -WIDTH - 2, -WIDTH + 2, WIDTH - 2, WIDTH + 2, 2 * WIDTH - 1, 2 * WIDTH + 1]);
// GEOMETRY FIX: Verify Row Change to prevent Array Wrapping
export const HORSE_Y = new Int8Array([-2, -2, -1, -1, 1, 1, 2, 2]);

export const BLOCK = new Int8Array([-WIDTH, -WIDTH, -1, 1, -1, 1, WIDTH, WIDTH]); // Horse Leg

// Elephant Movement
export const ELEPHANT = new Int8Array([-2 * WIDTH - 2, -2 * WIDTH + 2, 2 * WIDTH - 2, 2 * WIDTH + 2]);
// GEOMETRY FIX: Elephant must strictly change rank by 2
export const ELEPHANT_Y = new Int8Array([-2, -2, 2, 2]);

export const EYE = new Int8Array([-WIDTH - 1, -WIDTH + 1, WIDTH - 1, WIDTH + 1]); // Elephant Eye
