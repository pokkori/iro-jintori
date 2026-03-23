import { BlockShape, RotatedBlock } from '../types/block';
import { BoardState, PlayerColor } from '../types/board';
import { HexCoord } from '../types/hex';
import { hexAdd, hexKey, hexNeighbors, hexRotate } from './hex-math';

export function rotateBlock(block: BlockShape, rotation: number): RotatedBlock {
  const times = rotation / 60;
  const rotatedCells = block.cells.map(cell => hexRotate(cell, times));
  return { base: block, rotation, cells: rotatedCells };
}

export function canPlaceBlock(
  board: BoardState,
  block: RotatedBlock,
  position: HexCoord,
  player: PlayerColor,
): boolean {
  const absoluteCells = block.cells.map(c => hexAdd(c, position));

  for (const cell of absoluteCells) {
    const key = hexKey(cell);
    const boardCell = board.cells.get(key);
    if (!boardCell) return false;
    if (boardCell.owner !== 'empty') return false;
  }

  let adjacentToOwn = false;
  for (const cell of absoluteCells) {
    const neighbors = hexNeighbors(cell);
    for (const neighbor of neighbors) {
      const nKey = hexKey(neighbor);
      const nCell = board.cells.get(nKey);
      if (nCell && nCell.owner === player) {
        const isPartOfBlock = absoluteCells.some(
          bc => bc.q === neighbor.q && bc.r === neighbor.r
        );
        if (!isPartOfBlock) {
          adjacentToOwn = true;
          break;
        }
      }
    }
    if (adjacentToOwn) break;
  }

  return adjacentToOwn;
}

export function getAllValidPlacements(
  board: BoardState,
  blocks: BlockShape[],
  player: PlayerColor,
): Array<{ block: RotatedBlock; position: HexCoord }> {
  const placements: Array<{ block: RotatedBlock; position: HexCoord }> = [];

  for (const block of blocks) {
    for (let rot = 0; rot < 360; rot += 60) {
      const rotated = rotateBlock(block, rot);

      for (const [, cell] of board.cells) {
        if (cell.owner === 'empty') {
          if (canPlaceBlock(board, rotated, cell.coord, player)) {
            placements.push({ block: rotated, position: cell.coord });
          }
        }
      }
    }
  }

  return placements;
}

export function placeBlock(
  board: BoardState,
  block: RotatedBlock,
  position: HexCoord,
  player: PlayerColor,
): HexCoord[] {
  const absoluteCells = block.cells.map(c => hexAdd(c, position));

  for (const cell of board.cells.values()) {
    cell.justPlaced = false;
    cell.justCaptured = false;
  }

  for (const coord of absoluteCells) {
    const key = hexKey(coord);
    const cell = board.cells.get(key)!;
    cell.owner = player;
    cell.justPlaced = true;
  }

  return absoluteCells;
}
