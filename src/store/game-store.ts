import { create } from 'zustand';
import { GameState, GameMode, AIDifficulty } from '../types/game';
import { BlockId, BlockShape } from '../types/block';
import { HexCoord } from '../types/hex';
import { AI_CONFIGS } from '../types/player';
import {
  createGame,
  selectBlock as selectBlockFn,
  rotateSelected,
  executePlace,
  executePass,
  endTurn,
} from '../engine/game-loop';
import { findBestMove } from '../engine/ai';
import { getBlockById } from '../constants/blocks';

interface GameStore {
  game: GameState | null;

  startGame: (mode: GameMode, difficulty: AIDifficulty | null) => void;
  selectBlock: (blockId: BlockId) => void;
  rotate: (direction: 1 | -1) => void;
  placeBlock: (position: HexCoord) => {
    placedCells: HexCoord[];
    capturedCells: HexCoord[];
  } | null;
  pass: () => void;
  endTurn: () => void;
  executeAITurn: () => Promise<void>;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  game: null,

  startGame: (mode, difficulty) => {
    set({ game: createGame(mode, difficulty) });
  },

  selectBlock: (blockId) => {
    const { game } = get();
    if (!game) return;
    selectBlockFn(game, blockId);
    set({ game: { ...game } });
  },

  rotate: (direction) => {
    const { game } = get();
    if (!game) return;
    rotateSelected(game, direction);
    set({ game: { ...game } });
  },

  placeBlock: (position) => {
    const { game } = get();
    if (!game) return null;

    const result = executePlace(game, position);
    if (!result) return null;

    set({ game: { ...game } });
    return result;
  },

  pass: () => {
    const { game } = get();
    if (!game) return;
    executePass(game);
    set({ game: { ...game } });
  },

  endTurn: () => {
    const { game } = get();
    if (!game) return;
    endTurn(game);
    set({ game: { ...game } });
  },

  executeAITurn: async () => {
    const { game } = get();
    if (!game || !game.aiDifficulty) return;

    const blocks = game.blueBlocks
      .map(id => getBlockById(id))
      .filter((b): b is BlockShape => b !== undefined);
    const opponentBlocks = game.redBlocks
      .map(id => getBlockById(id))
      .filter((b): b is BlockShape => b !== undefined);

    const config = AI_CONFIGS[game.aiDifficulty];

    await new Promise(resolve => setTimeout(resolve, config.thinkingDelay));

    const move = findBestMove(
      game.board,
      blocks,
      opponentBlocks,
      'blue',
      game.aiDifficulty,
    );

    if (!move) {
      executePass(game);
    } else {
      game.selectedBlock = move.block.base.id;
      game.selectedRotation = move.block.rotation;
      executePlace(game, move.position);
    }

    set({ game: { ...game } });
  },

  resetGame: () => {
    set({ game: null });
  },
}));
