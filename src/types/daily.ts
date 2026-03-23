import { BlockId } from './block';
import { BoardState, PlayerColor } from './board';

export interface DailyPuzzle {
  readonly id: string;
  readonly initialBoard: BoardState;
  readonly playerColor: PlayerColor;
  readonly availableBlocks: readonly BlockId[];
  readonly solutions: readonly DailySolution[];
  readonly maxMoves: number;
  readonly difficulty: number;
  readonly hint: string;
}

export interface DailySolution {
  readonly moves: readonly {
    readonly blockId: BlockId;
    readonly position: import('./hex').HexCoord;
    readonly rotation: number;
  }[];
}

export interface DailyResult {
  readonly puzzleId: string;
  readonly cleared: boolean;
  readonly movesUsed: number;
  readonly timeSeconds: number;
  readonly usedHint: boolean;
}
