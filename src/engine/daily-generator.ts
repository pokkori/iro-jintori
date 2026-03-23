import { DailyPuzzle } from '../types/daily';
import { CellOwner } from '../types/board';
import { HexKey } from '../types/hex';
import { CellState } from '../types/board';
import { generateHexGrid, hexKey } from './hex-math';
import { BlockId } from '../types/block';

function dateToSeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function mulberry32(seed: number): () => number {
  return function () {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function generateDailyPuzzle(dateStr: string): DailyPuzzle {
  const seed = dateToSeed(dateStr);
  const rng = mulberry32(seed);
  const radius = 3;
  const allCoords = generateHexGrid(radius);

  const cells = new Map<HexKey, CellState>();
  const owners: CellOwner[] = [];

  for (let i = 0; i < allCoords.length; i++) {
    const r = rng();
    let owner: CellOwner;
    if (r < 0.27) owner = 'red';
    else if (r < 0.62) owner = 'blue';
    else owner = 'empty';
    owners.push(owner);
  }

  for (let i = 0; i < allCoords.length; i++) {
    const coord = allCoords[i];
    const key = hexKey(coord);
    cells.set(key, {
      coord,
      owner: owners[i],
      justCaptured: false,
      justPlaced: false,
    });
  }

  const blockPool: BlockId[] = ['B01', 'B02', 'B03', 'B04', 'B05'];
  const available: BlockId[] = [
    blockPool[Math.floor(rng() * blockPool.length)],
    blockPool[Math.floor(rng() * blockPool.length)],
    blockPool[Math.floor(rng() * blockPool.length)],
  ];

  const difficulty = (seed % 5) + 1;

  const hints = [
    '左上の隅を狙ってみよう',
    '相手を挟む配置を探そう',
    'L字ブロックが鍵になるかも',
    '中央を制圧しよう',
    '端から攻めてみよう',
  ];

  return {
    id: dateStr,
    initialBoard: {
      cells,
      radius,
      redCount: owners.filter(o => o === 'red').length,
      blueCount: owners.filter(o => o === 'blue').length,
      emptyCount: owners.filter(o => o === 'empty').length,
    },
    playerColor: 'red',
    availableBlocks: available,
    solutions: [],
    maxMoves: 3,
    difficulty: Math.min(5, difficulty),
    hint: hints[seed % hints.length],
  };
}
