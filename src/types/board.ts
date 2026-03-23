import { HexCoord, HexKey } from './hex';

export type PlayerColor = 'red' | 'blue';

export type CellOwner = PlayerColor | 'empty';

export interface CellState {
  readonly coord: HexCoord;
  owner: CellOwner;
  justCaptured: boolean;
  justPlaced: boolean;
}

export interface BoardState {
  readonly cells: Map<HexKey, CellState>;
  readonly radius: number;
  redCount: number;
  blueCount: number;
  emptyCount: number;
}
