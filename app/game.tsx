import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '../src/store/game-store';
import { usePlayerStore } from '../src/store/player-store';
import HexGrid from '../src/components/HexGrid';
import BlockSelector from '../src/components/BlockSelector';
import ScoreBar from '../src/components/ScoreBar';
import TurnIndicator from '../src/components/TurnIndicator';
import GameOverModal from '../src/components/GameOverModal';
import { COLORS } from '../src/constants/colors';
import { HexCoord, HexKey } from '../src/types/hex';
import { AIDifficulty, GameMode } from '../src/types/game';
import { BlockShape } from '../src/types/block';
import { getBlockById } from '../src/constants/blocks';
import { rotateBlock, canPlaceBlock } from '../src/engine/placement';
import { hexAdd, hexKey } from '../src/engine/hex-math';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_PADDING = 20;
const GRID_RADIUS = 3;
const HEX_SIZE = Math.floor((SCREEN_WIDTH - GRID_PADDING * 2) / (3 * GRID_RADIUS + 2));

export default function GameScreen() {
  const params = useLocalSearchParams<{ mode: string; difficulty?: string }>();
  const router = useRouter();
  const store = useGameStore();
  const playerStore = usePlayerStore();
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const mode = (params.mode || 'pve') as GameMode;
  const difficulty = (params.difficulty || 'normal') as AIDifficulty;

  useEffect(() => {
    store.startGame(mode, mode === 'pve' ? difficulty : null);
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsed(e => e + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const game = store.game;

  // AI turn
  useEffect(() => {
    if (game?.phase === 'ai_thinking') {
      store.executeAITurn().then(() => {
        // After AI places, go to animating then end turn
        setTimeout(() => {
          store.endTurn();
        }, 300);
      });
    }
  }, [game?.phase]);

  // After animation, end turn
  useEffect(() => {
    if (game?.phase === 'animating_capture' && game.currentPlayer === 'red') {
      const timer = setTimeout(() => {
        store.endTurn();
      }, 500);
      return () => clearTimeout(timer);
    }
    // For PvP blue animating
    if (game?.phase === 'animating_capture' && game.mode === 'pvp') {
      const timer = setTimeout(() => {
        store.endTurn();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [game?.phase, game?.currentPlayer]);

  // Game over
  useEffect(() => {
    if (game?.phase === 'game_over' && game.result) {
      if (timerRef.current) clearInterval(timerRef.current);
      playerStore.recordGameResult(
        game.result,
        game.aiDifficulty,
        game.result.winner === 'red',
      );
    }
  }, [game?.phase]);

  const getValidPlacements = useCallback((): Set<string> => {
    if (!game || !game.selectedBlock || game.phase !== 'placing_block') {
      return new Set();
    }
    const block = getBlockById(game.selectedBlock);
    if (!block) return new Set();
    const rotated = rotateBlock(block, game.selectedRotation);
    const valid = new Set<string>();

    for (const [, cell] of game.board.cells) {
      if (cell.owner === 'empty') {
        if (canPlaceBlock(game.board, rotated, cell.coord, game.currentPlayer)) {
          valid.add(hexKey(cell.coord));
        }
      }
    }
    return valid;
  }, [game?.selectedBlock, game?.selectedRotation, game?.phase, game?.currentPlayer]);

  const getPreviewCells = useCallback((): HexCoord[] | null => {
    // Preview not implemented for tap-based placement
    return null;
  }, []);

  const handleCellPress = useCallback((coord: HexCoord) => {
    if (!game) return;
    if (game.phase !== 'placing_block') return;
    if (game.mode === 'pve' && game.currentPlayer === 'blue') return;

    const result = store.placeBlock(coord);
    if (!result) {
      // Invalid placement - could add feedback here
    }
  }, [game?.phase, game?.currentPlayer, game?.mode]);

  const handleSelectBlock = useCallback((blockId: string) => {
    if (!game) return;
    if (game.phase !== 'selecting_block' && game.phase !== 'placing_block') return;
    if (game.mode === 'pve' && game.currentPlayer === 'blue') return;
    store.selectBlock(blockId as any);
  }, [game?.phase, game?.currentPlayer]);

  const handlePass = useCallback(() => {
    if (!game) return;
    store.pass();
    store.endTurn();
  }, [game]);

  if (!game) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>読み込み中...</Text>
      </SafeAreaView>
    );
  }

  const currentBlocks = game.currentPlayer === 'red' ? game.redBlocks : game.blueBlocks;
  const validPlacements = getValidPlacements();

  return (
    <SafeAreaView style={styles.container}>
      <ScoreBar
        redCount={game.board.redCount}
        blueCount={game.board.blueCount}
        turnNumber={game.history.length + 1}
        elapsedSeconds={elapsed}
      />
      <TurnIndicator currentPlayer={game.currentPlayer} phase={game.phase} />

      <View style={styles.gridContainer}>
        <HexGrid
          board={game.board}
          validPlacements={validPlacements}
          previewCells={getPreviewCells()}
          onCellPress={handleCellPress}
          currentPlayer={game.currentPlayer}
          hexSize={HEX_SIZE}
        />
      </View>

      <View style={styles.controls}>
        <View style={styles.rotationRow}>
          <TouchableOpacity
            style={styles.rotateButton}
            onPress={() => store.rotate(-1)}
            disabled={!game.selectedBlock}
          >
            <Text style={styles.rotateText}>← 回転</Text>
          </TouchableOpacity>
          <Text style={styles.selectedBlockText}>
            {game.selectedBlock
              ? `${getBlockById(game.selectedBlock)?.name || ''} (${game.selectedRotation}°)`
              : '---'}
          </Text>
          <TouchableOpacity
            style={styles.rotateButton}
            onPress={() => store.rotate(1)}
            disabled={!game.selectedBlock}
          >
            <Text style={styles.rotateText}>回転 →</Text>
          </TouchableOpacity>
        </View>

        <BlockSelector
          blockIds={currentBlocks}
          selectedBlockId={game.selectedBlock}
          onSelect={handleSelectBlock}
        />

        <TouchableOpacity style={styles.passButton} onPress={handlePass}>
          <Text style={styles.passText}>パス</Text>
        </TouchableOpacity>
      </View>

      <GameOverModal
        visible={game.phase === 'game_over'}
        result={game.result}
        playerColor="red"
        onPlayAgain={() => {
          store.startGame(mode, mode === 'pve' ? difficulty : null);
          setElapsed(0);
        }}
        onGoHome={() => {
          store.resetGame();
          router.replace('/');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingText: {
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 100,
    fontSize: 18,
  },
  gridContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: GRID_PADDING,
  },
  controls: {
    paddingBottom: 8,
  },
  rotationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  rotateButton: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  rotateText: {
    color: COLORS.text,
    fontSize: 14,
  },
  selectedBlockText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  passButton: {
    alignSelf: 'center',
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  passText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});
