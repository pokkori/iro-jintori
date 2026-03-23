import { BoardState, PlayerColor } from '../types/board';
import { HexCoord, HexKey } from '../types/hex';
import { hexKey } from './hex-math';
import { recountBoard } from './board';

export function performCapture(
  board: BoardState,
  placedCells: HexCoord[],
  player: PlayerColor,
): HexCoord[] {
  const opponent: PlayerColor = player === 'red' ? 'blue' : 'red';
  const capturedSet = new Set<HexKey>();
  const capturedCoords: HexCoord[] = [];

  const directions: HexCoord[] = [
    { q: +1, r: 0 },
    { q: +1, r: -1 },
    { q: 0, r: -1 },
    { q: -1, r: 0 },
    { q: -1, r: +1 },
    { q: 0, r: +1 },
  ];

  for (const origin of placedCells) {
    for (const dir of directions) {
      const candidates: HexCoord[] = [];
      let current: HexCoord = { q: origin.q + dir.q, r: origin.r + dir.r };

      while (true) {
        const key = hexKey(current);
        const cell = board.cells.get(key);

        if (!cell) break;
        if (cell.owner === 'empty') break;
        if (cell.owner === player) {
          for (const cand of candidates) {
            const candKey = hexKey(cand);
            if (!capturedSet.has(candKey)) {
              capturedSet.add(candKey);
              capturedCoords.push(cand);
            }
          }
          break;
        }
        candidates.push(current);
        current = { q: current.q + dir.q, r: current.r + dir.r };
      }
    }
  }

  for (const coord of capturedCoords) {
    const key = hexKey(coord);
    const cell = board.cells.get(key)!;
    cell.owner = player;
    cell.justCaptured = true;
  }

  recountBoard(board);

  return capturedCoords;
}
