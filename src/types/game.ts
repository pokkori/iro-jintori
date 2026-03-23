import { BlockId } from './block';
import { PlayerColor } from './board';
import { HexCoord } from './hex';

export type GameMode = 'pvp' | 'pve' | 'daily';

export type AIDifficulty = 'easy' | 'normal' | 'hard' | 'expert';

export type GamePhase =
  | 'selecting_block'
  | 'placing_block'
  | 'animating_capture'
  | 'ai_thinking'
  | 'game_over';

export interface TurnAction {
  readonly turnNumber: number;
  readonly player: PlayerColor;
  readonly blockId: BlockId;
  readonly position: HexCoord;
  readonly rotation: number;
  readonly capturedCells: readonly HexCoord[];
  readonly redCountAfter: number;
  readonly blueCountAfter: number;
  readonly isPass: boolean;
  readonly timestamp: number;
}

export interface GameResult {
  readonly winner: PlayerColor | null;
  readonly redCount: number;
  readonly blueCount: number;
  readonly totalTurns: number;
  readonly biggestSwing: number;
  readonly hadComeback: boolean;
  readonly durationSeconds: number;
  readonly unlockedBlocks: readonly BlockId[];
}

export interface GameState {
  readonly mode: GameMode;
  readonly aiDifficulty: AIDifficulty | null;
  phase: GamePhase;
  board: import('./board').BoardState;
  currentPlayer: PlayerColor;
  readonly redBlocks: BlockId[];
  readonly blueBlocks: BlockId[];
  selectedBlock: BlockId | null;
  selectedRotation: number;
  readonly history: TurnAction[];
  consecutivePasses: number;
  readonly startedAt: number;
  result: GameResult | null;
}
