import { HexCoord } from './hex';

export type BlockId =
  | 'B01' | 'B02' | 'B03' | 'B04' | 'B05'
  | 'B06' | 'B07' | 'B08' | 'B09' | 'B10'
  | 'B11' | 'B12' | 'B13' | 'B14' | 'B15';

export type BlockRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface BlockShape {
  readonly id: BlockId;
  readonly name: string;
  readonly nameEn: string;
  readonly cells: readonly HexCoord[];
  readonly size: number;
  readonly rarity: BlockRarity;
  readonly unlockWins: number;
  readonly color: string;
  readonly description: string;
}

export interface RotatedBlock {
  readonly base: BlockShape;
  readonly rotation: number;
  readonly cells: readonly HexCoord[];
}
