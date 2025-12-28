
import { Board } from './types';
import { parse } from './snapshot';
import { flatten } from './space';

/**
 * @description  Endgame & Puzzle Scenarios Repository.
 * @purpose      Store specific board states (Spatial Patterns) for Tactical Training.
 * @source       "The Secret inside the Vermilion Chest" (Quất Trung Bí) & Classics.
 */

export interface Scenario {
  id: string;
  fen: string;
  name: string;
  description?: string;
  solution?: number; // Encoded Move (from << 8 | to)
  difficulty: number; // 1-5
}

// Helper to encode move manually for solutions
const m = (fx: number, fy: number, tx: number, ty: number) => (flatten(fx, fy) << 8) | flatten(tx, ty);

export const COLLECTION: Scenario[] = [
    {
        id: "EG_001_DINH_PIN_1",
        fen: "3ak4/9/4R4/9/9/9/9/9/9/4K4 w - - 0 1",
        name: "Đơn Xe phá Sĩ Tượng (Basic)",
        description: "Xe chiếm trung lộ, Tướng trợ công.",
        difficulty: 1,
        // Red Chariot (4, 2) -> (4, 0) Checkmate
        solution: m(4, 2, 4, 0) 
    },
    {
        id: "EG_002_HORSE_CANNON",
        fen: "3ak4/4a4/4b4/8C/9/2N6/9/9/9/4K4 w - - 0 1",
        name: "Mã Pháo phối hợp",
        description: "Sử dụng Mã làm ngòi cho Pháo hoặc Mã ngọa tào.",
        difficulty: 2
    },
    {
        id: "EG_003_THIEU_NU_DANG_TRA",
        fen: "2bakab2/9/4c4/9/9/9/9/4C4/4p4/3K1AB2 w - - 0 1",
        name: "Thiếu Nữ Dâng Trà",
        description: "Thế cờ tàn thực dụng kinh điển.",
        difficulty: 3
    },
    {
        id: "EG_004_KHOA_TU_TRUONG_AN",
        fen: "4k4/4a4/9/7C1/9/8r/9/9/9/4K4 w - - 0 1",
        name: "Khóa Tử Trường An",
        description: "Pháo giác khóa Tướng, Xe đâm đáy.",
        difficulty: 3
    },
    {
        id: "EG_005_QUAT_TRUNG_BI_01",
        fen: "4k4/4a4/4b4/9/9/9/9/5R3/4p4/4K4 w - - 0 1",
        name: "Xe Pháo Tốt liên hoàn",
        description: "Sát pháp Tốt nhập cung.",
        difficulty: 4
    }
];

/**
 * @description Load a specific scenario board.
 */
export const load = (index: number): Board => {
    if (index < 0 || index >= COLLECTION.length) return parse("");
    return parse(COLLECTION[index].fen);
};

/**
 * @description Find a scenario by ID.
 */
export const find = (id: string): Scenario | undefined => {
    return COLLECTION.find(s => s.id === id);
};
