import { BoardState, PlayerColor } from '../types/board';

export function getScore(board: BoardState, player: PlayerColor): number {
  return player === 'red' ? board.redCount : board.blueCount;
}

export function getWinner(board: BoardState): PlayerColor | null {
  if (board.redCount > board.blueCount) return 'red';
  if (board.blueCount > board.redCount) return 'blue';
  return null;
}
