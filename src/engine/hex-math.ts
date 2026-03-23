import { HexCoord, CubeCoord, PixelCoord, HEX_DIRECTIONS, HexKey } from '../types/hex';

export function axialToCube(hex: HexCoord): CubeCoord {
  return { q: hex.q, r: hex.r, s: -hex.q - hex.r };
}

export function cubeToAxial(cube: CubeCoord): HexCoord {
  return { q: cube.q, r: cube.r };
}

export function axialToPixel(hex: HexCoord, size: number): PixelCoord {
  const x = size * (3 / 2 * hex.q);
  const y = size * (Math.sqrt(3) / 2 * hex.q + Math.sqrt(3) * hex.r);
  return { x, y };
}

export function pixelToAxial(pixel: PixelCoord, size: number): HexCoord {
  const q = (2 / 3 * pixel.x) / size;
  const r = (-1 / 3 * pixel.x + Math.sqrt(3) / 3 * pixel.y) / size;
  return cubeRound({ q, r, s: -q - r });
}

export function cubeRound(cube: CubeCoord): HexCoord {
  let rq = Math.round(cube.q);
  let rr = Math.round(cube.r);
  const rs = Math.round(cube.s);

  const qDiff = Math.abs(rq - cube.q);
  const rDiff = Math.abs(rr - cube.r);
  const sDiff = Math.abs(rs - cube.s);

  if (qDiff > rDiff && qDiff > sDiff) {
    rq = -rr - rs;
  } else if (rDiff > sDiff) {
    rr = -rq - rs;
  }
  return { q: rq, r: rr };
}

export function hexAdd(a: HexCoord, b: HexCoord): HexCoord {
  return { q: a.q + b.q, r: a.r + b.r };
}

export function hexNeighbor(hex: HexCoord, direction: number): HexCoord {
  return hexAdd(hex, HEX_DIRECTIONS[direction]);
}

export function hexNeighbors(hex: HexCoord): HexCoord[] {
  return HEX_DIRECTIONS.map(dir => hexAdd(hex, dir));
}

export function hexDistance(a: HexCoord, b: HexCoord): number {
  const ac = axialToCube(a);
  const bc = axialToCube(b);
  return Math.max(
    Math.abs(ac.q - bc.q),
    Math.abs(ac.r - bc.r),
    Math.abs(ac.s - bc.s)
  );
}

export function hexKey(hex: HexCoord): HexKey {
  return `${hex.q},${hex.r}`;
}

export function keyToHex(key: HexKey): HexCoord {
  const [q, r] = key.split(',').map(Number);
  return { q, r };
}

export function hexRotate(hex: HexCoord, times: number): HexCoord {
  let cube = axialToCube(hex);
  const n = ((times % 6) + 6) % 6;
  for (let i = 0; i < n; i++) {
    cube = { q: -cube.r, r: -cube.s, s: -cube.q };
  }
  return cubeToAxial(cube);
}

export function generateHexGrid(radius: number): HexCoord[] {
  const coords: HexCoord[] = [];
  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    for (let r = r1; r <= r2; r++) {
      coords.push({ q, r });
    }
  }
  return coords;
}
