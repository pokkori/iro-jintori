import { BoardState, PlayerColor } from '../types/board';
import { BlockShape, RotatedBlock } from '../types/block';
import { HexCoord } from '../types/hex';
import { AIConfig, AI_CONFIGS } from '../types/player';
import { AIDifficulty } from '../types/game';
import { getAllValidPlacements, placeBlock } from './placement';
import { performCapture } from './capture';
import { cloneBoard } from './board';
import { hexDistance } from './hex-math';

interface AIMove {
  block: RotatedBlock;
  position: HexCoord;
  score: number;
}

export function findBestMove(
  board: BoardState,
  playerBlocks: BlockShape[],
  opponentBlocks: BlockShape[],
  player: PlayerColor,
  difficulty: AIDifficulty,
): AIMove | null {
  const config = AI_CONFIGS[difficulty];
  const placements = getAllValidPlacements(board, playerBlocks, player);

  if (placements.length === 0) return null;

  if (difficulty === 'easy') {
    const scored = placements.map(p => {
      const testBoard = cloneBoard(board);
      const placed = placeBlock(testBoard, p.block, p.position, player);
      performCapture(testBoard, placed, player);
      return { ...p, score: evaluateBoard(testBoard, player, config) };
    });
    scored.sort((a, b) => b.score - a.score);
    const topN = scored.slice(0, Math.min(3, scored.length));
    const chosen = topN[Math.floor(Math.random() * topN.length)];
    return chosen;
  }

  let bestMove: AIMove | null = null;
  let alpha = -Infinity;
  const beta = Infinity;

  for (const placement of placements) {
    const testBoard = cloneBoard(board);
    const placed = placeBlock(testBoard, placement.block, placement.position, player);
    performCapture(testBoard, placed, player);

    const score = -alphabeta(
      testBoard,
      config.depth - 1,
      -beta,
      -alpha,
      player === 'red' ? 'blue' : 'red',
      player === 'red' ? opponentBlocks : playerBlocks,
      player === 'red' ? playerBlocks : opponentBlocks,
      config,
    );

    if (score > alpha) {
      alpha = score;
      bestMove = { ...placement, score };
    }
  }

  return bestMove;
}

function alphabeta(
  board: BoardState,
  depth: number,
  alpha: number,
  beta: number,
  currentPlayer: PlayerColor,
  currentBlocks: BlockShape[],
  opponentBlocks: BlockShape[],
  config: AIConfig,
): number {
  if (depth === 0 || board.emptyCount === 0) {
    return evaluateBoard(board, currentPlayer, config);
  }

  const placements = getAllValidPlacements(board, currentBlocks, currentPlayer);
  if (placements.length === 0) {
    return -alphabeta(
      board, depth - 1, -beta, -alpha,
      currentPlayer === 'red' ? 'blue' : 'red',
      opponentBlocks, currentBlocks, config,
    );
  }

  for (const placement of placements) {
    const testBoard = cloneBoard(board);
    const placed = placeBlock(testBoard, placement.block, placement.position, currentPlayer);
    performCapture(testBoard, placed, currentPlayer);

    const score = -alphabeta(
      testBoard, depth - 1, -beta, -alpha,
      currentPlayer === 'red' ? 'blue' : 'red',
      opponentBlocks, currentBlocks, config,
    );

    if (score >= beta) return beta;
    if (score > alpha) alpha = score;
  }

  return alpha;
}

function evaluateBoard(
  board: BoardState,
  player: PlayerColor,
  config: AIConfig,
): number {
  const opponent: PlayerColor = player === 'red' ? 'blue' : 'red';
  const w = config.weights;

  const myCount = player === 'red' ? board.redCount : board.blueCount;
  const opCount = player === 'red' ? board.blueCount : board.redCount;
  const territory = myCount - opCount;

  let cornerScore = 0;
  for (const cell of board.cells.values()) {
    const dist = hexDistance(cell.coord, { q: 0, r: 0 });
    if (dist === board.radius) {
      if (cell.owner === player) cornerScore += 1;
      else if (cell.owner === opponent) cornerScore -= 1;
    }
  }

  let centerScore = 0;
  for (const cell of board.cells.values()) {
    if (cell.owner === player) {
      const dist = hexDistance(cell.coord, { q: 0, r: 0 });
      centerScore += (board.radius - dist);
    }
  }

  return (
    w.territory * territory +
    w.corner * cornerScore +
    w.center * centerScore
  );
}
