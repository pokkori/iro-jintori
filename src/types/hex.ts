/**
 * Axial座標系（q, r）
 */
export interface HexCoord {
  readonly q: number;
  readonly r: number;
}

export interface CubeCoord {
  readonly q: number;
  readonly r: number;
  readonly s: number;
}

export interface PixelCoord {
  readonly x: number;
  readonly y: number;
}

export const HEX_DIRECTIONS: readonly HexCoord[] = [
  { q: +1, r: 0 },
  { q: +1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: +1 },
  { q: 0, r: +1 },
] as const;

export type HexDirectionIndex = 0 | 1 | 2 | 3 | 4 | 5;

export type HexKey = `${number},${number}`;
