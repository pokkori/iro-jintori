import { GameState, GameMode, AIDifficulty, TurnAction, GameResult } from '../types/game';
import { PlayerColor } from '../types/board';
import { BlockId } from '../types/block';
import { HexCoord } from '../types/hex';
import { createInitialBoard } from './board';
import { canPlaceBlock, placeBlock, rotateBlock } from './placement';
import { performCapture } from './capture';
import { getBlockById } from '../constants/blocks';

export function createGame(mode: GameMode, difficulty: AIDifficulty | null): GameState {
  const initialBlockIds: BlockId[] = ['B01', 'B02', 'B03', 'B04', 'B05'];

  return {
    mode,
    aiDifficulty: difficulty,
    phase: 'selecting_block',
    board: createInitialBoard(),
    currentPlayer: 'red',
    redBlocks: [...initialBlockIds],
    blueBlocks: [...initialBlockIds],
    selectedBlock: null,
    selectedRotation: 0,
    history: [],
    consecutivePasses: 0,
    startedAt: Date.now(),
    result: null,
  };
}

export function selectBlock(state: GameState, blockId: BlockId): void {
  state.selectedBlock = blockId;
  state.selectedRotation = 0;
  state.phase = 'placing_block';
}

export function rotateSelected(state: GameState, direction: 1 | -1): void {
  state.selectedRotation = (state.selectedRotation + direction * 60 + 360) % 360;
}

export function executePlace(
  state: GameState,
  position: HexCoord,
): { placedCells: HexCoord[]; capturedCells: HexCoord[] } | null {
  if (!state.selectedBlock) return null;

  const block = getBlockById(state.selectedBlock);
  if (!block) return null;

  const rotated = rotateBlock(block, state.selectedRotation);

  if (!canPlaceBlock(state.board, rotated, position, state.currentPlayer)) {
    return null;
  }

  const placedCells = placeBlock(state.board, rotated, position, state.currentPlayer);
  const capturedCells = performCapture(state.board, placedCells, state.currentPlayer);

  const action: TurnAction = {
    turnNumber: state.history.length + 1,
    player: state.currentPlayer,
    blockId: state.selectedBlock,
    position,
    rotation: state.selectedRotation,
    capturedCells,
    redCountAfter: state.board.redCount,
    blueCountAfter: state.board.blueCount,
    isPass: false,
    timestamp: Date.now(),
  };
  (state.history as TurnAction[]).push(action);

  state.selectedBlock = null;
  state.selectedRotation = 0;
  state.consecutivePasses = 0;
  state.phase = 'animating_capture';

  return { placedCells, capturedCells };
}

export function executePass(state: GameState): void {
  const action: TurnAction = {
    turnNumber: state.history.length + 1,
    player: state.currentPlayer,
    blockId: 'B01',
    position: { q: 0, r: 0 },
    rotation: 0,
    capturedCells: [],
    redCountAfter: state.board.redCount,
    blueCountAfter: state.board.blueCount,
    isPass: true,
    timestamp: Date.now(),
  };
  (state.history as TurnAction[]).push(action);
  state.consecutivePasses++;
}

export function endTurn(state: GameState): void {
  if (state.board.emptyCount === 0 || state.consecutivePasses >= 2) {
    finishGame(state);
    return;
  }

  state.currentPlayer = state.currentPlayer === 'red' ? 'blue' : 'red';

  if (state.mode === 'pve' && state.currentPlayer === 'blue') {
    state.phase = 'ai_thinking';
  } else {
    state.phase = 'selecting_block';
  }
}

function finishGame(state: GameState): void {
  state.phase = 'game_over';

  let maxSwing = 0;
  let prevDiff = 0;
  for (const action of state.history) {
    const diff = action.redCountAfter - action.blueCountAfter;
    const swing = Math.abs(diff - prevDiff);
    if (swing > maxSwing) maxSwing = swing;
    prevDiff = diff;
  }

  let hadComeback = false;
  if (state.history.length >= 4) {
    const mid = Math.floor(state.history.length / 2);
    const midAction = state.history[mid];
    const midDiff = midAction.redCountAfter - midAction.blueCountAfter;
    const finalDiff = state.board.redCount - state.board.blueCount;
    if ((midDiff > 0 && finalDiff < 0) || (midDiff < 0 && finalDiff > 0)) {
      hadComeback = true;
    }
  }

  const winner: PlayerColor | null =
    state.board.redCount > state.board.blueCount ? 'red' :
    state.board.blueCount > state.board.redCount ? 'blue' : null;

  state.result = {
    winner,
    redCount: state.board.redCount,
    blueCount: state.board.blueCount,
    totalTurns: state.history.length,
    biggestSwing: maxSwing,
    hadComeback,
    durationSeconds: Math.floor((Date.now() - state.startedAt) / 1000),
    unlockedBlocks: [],
  };
}
