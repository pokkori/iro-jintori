import { BoardState, CellState, CellOwner } from '../types/board';
import { HexCoord, HexKey } from '../types/hex';
import { generateHexGrid, hexKey } from './hex-math';

const GRID_RADIUS = 3;

export function createInitialBoard(): BoardState {
  const cells = new Map<HexKey, CellState>();
  const allCoords = generateHexGrid(GRID_RADIUS);

  const redStart: HexCoord[] = [
    { q: -3, r: 0 },
    { q: -3, r: 1 },
    { q: -2, r: -1 },
  ];

  const blueStart: HexCoord[] = [
    { q: 3, r: 0 },
    { q: 3, r: -1 },
    { q: 2, r: 1 },
  ];

  const redKeys = new Set(redStart.map(hexKey));
  const blueKeys = new Set(blueStart.map(hexKey));

  for (const coord of allCoords) {
    const key = hexKey(coord);
    let owner: CellOwner = 'empty';
    if (redKeys.has(key)) owner = 'red';
    if (blueKeys.has(key)) owner = 'blue';

    cells.set(key, {
      coord,
      owner,
      justCaptured: false,
      justPlaced: false,
    });
  }

  return {
    cells,
    radius: GRID_RADIUS,
    redCount: 3,
    blueCount: 3,
    emptyCount: 37 - 6,
  };
}

export function cloneBoard(board: BoardState): BoardState {
  const newCells = new Map<HexKey, CellState>();
  for (const [key, cell] of board.cells) {
    newCells.set(key, { ...cell });
  }
  return {
    cells: newCells,
    radius: board.radius,
    redCount: board.redCount,
    blueCount: board.blueCount,
    emptyCount: board.emptyCount,
  };
}

export function recountBoard(board: BoardState): void {
  let red = 0, blue = 0, empty = 0;
  for (const cell of board.cells.values()) {
    if (cell.owner === 'red') red++;
    else if (cell.owner === 'blue') blue++;
    else empty++;
  }
  board.redCount = red;
  board.blueCount = blue;
  board.emptyCount = empty;
}
