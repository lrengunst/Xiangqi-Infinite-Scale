
import { Board, Side, Role } from './types';
import { SIZE } from './consts';
import { encode } from './codec';

/**
 * @description  Data Factory.
 */
export const genesis = (): Board => {
  const board = new Int8Array(SIZE);
  const black = Side.Black;
  const red = Side.Red;

  // Setup helpers
  const place = (side: Side, role: Role, index: number) => { board[index] = encode(side, role); };

  // Black
  place(black, Role.Chariot, 0); place(black, Role.Horse, 1); place(black, Role.Elephant, 2);
  place(black, Role.Advisor, 3); place(black, Role.General, 4); place(black, Role.Advisor, 5);
  place(black, Role.Elephant, 6); place(black, Role.Horse, 7); place(black, Role.Chariot, 8);
  place(black, Role.Cannon, 19); place(black, Role.Cannon, 25);
  place(black, Role.Soldier, 27); place(black, Role.Soldier, 29); place(black, Role.Soldier, 31);
  place(black, Role.Soldier, 33); place(black, Role.Soldier, 35);

  // Red
  place(red, Role.Chariot, 89); place(red, Role.Horse, 88); place(red, Role.Elephant, 87);
  place(red, Role.Advisor, 86); place(red, Role.General, 85); place(red, Role.Advisor, 84);
  place(red, Role.Elephant, 83); place(red, Role.Horse, 82); place(red, Role.Chariot, 81);
  place(red, Role.Cannon, 70); place(red, Role.Cannon, 64);
  place(red, Role.Soldier, 62); place(red, Role.Soldier, 60); place(red, Role.Soldier, 58);
  place(red, Role.Soldier, 56); place(red, Role.Soldier, 54);

  return board;
};
