import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../src/constants/colors';
import { generateDailyPuzzle } from '../src/engine/daily-generator';
import { getTodayString } from '../src/utils/date';
import { usePlayerStore } from '../src/store/player-store';
import { getBlockById } from '../src/constants/blocks';
import { rotateBlock, canPlaceBlock, placeBlock } from '../src/engine/placement';
import { performCapture } from '../src/engine/capture';
import { cloneBoard, recountBoard } from '../src/engine/board';
import HexGrid from '../src/components/HexGrid';
import BlockSelector from '../src/components/BlockSelector';
import { HexCoord, HexKey } from '../src/types/hex';
import { hexKey } from '../src/engine/hex-math';
import { BoardState } from '../src/types/board';
import { BlockId } from '../src/types/block';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_PADDING = 20;
const GRID_RADIUS = 3;
const HEX_SIZE = Math.floor((SCREEN_WIDTH - GRID_PADDING * 2) / (3 * GRID_RADIUS + 2));

export default function DailyScreen() {
  const router = useRouter();
  const playerStore = usePlayerStore();
  const todayStr = getTodayString();
  const puzzle = generateDailyPuzzle(todayStr);

  const [board, setBoard] = useState<BoardState>(() => cloneBoard(puzzle.initialBoard));
  const [movesUsed, setMovesUsed] = useState(0);
  const [selectedBlock, setSelectedBlock] = useState<BlockId | null>(null);
  const [rotation, setRotation] = useState(0);
  const [availableBlocks, setAvailableBlocks] = useState<BlockId[]>([...puzzle.availableBlocks]);
  const [cleared, setCleared] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const alreadyCompleted = playerStore.profile.dailyCompletedDates.includes(todayStr);

  const getValidPlacements = useCallback((): Set<string> => {
    if (!selectedBlock) return new Set();
    const block = getBlockById(selectedBlock);
    if (!block) return new Set();
    const rotated = rotateBlock(block, rotation);
    const valid = new Set<string>();
    for (const [, cell] of board.cells) {
      if (cell.owner === 'empty') {
        if (canPlaceBlock(board, rotated, cell.coord, 'red')) {
          valid.add(hexKey(cell.coord));
        }
      }
    }
    return valid;
  }, [selectedBlock, rotation, board]);

  const handleCellPress = useCallback((coord: HexCoord) => {
    if (!selectedBlock || cleared || movesUsed >= puzzle.maxMoves) return;
    const block = getBlockById(selectedBlock);
    if (!block) return;
    const rotated = rotateBlock(block, rotation);
    if (!canPlaceBlock(board, rotated, coord, 'red')) return;

    const newBoard = cloneBoard(board);
    const placed = placeBlock(newBoard, rotated, coord, 'red');
    performCapture(newBoard, placed, 'red');
    recountBoard(newBoard);

    setBoard(newBoard);
    setMovesUsed(m => m + 1);

    // Remove used block
    const idx = availableBlocks.indexOf(selectedBlock);
    if (idx >= 0) {
      const newBlocks = [...availableBlocks];
      newBlocks.splice(idx, 1);
      setAvailableBlocks(newBlocks);
    }
    setSelectedBlock(null);
    setRotation(0);

    // Check win
    if (newBoard.redCount > newBoard.blueCount) {
      setCleared(true);
      if (!alreadyCompleted) {
        playerStore.recordDailyComplete(todayStr);
      }
    }
  }, [selectedBlock, rotation, board, cleared, movesUsed, availableBlocks]);

  const handleReset = () => {
    setBoard(cloneBoard(puzzle.initialBoard));
    setMovesUsed(0);
    setSelectedBlock(null);
    setRotation(0);
    setAvailableBlocks([...puzzle.availableBlocks]);
    setCleared(false);
  };

  const stars = '★'.repeat(puzzle.difficulty) + '☆'.repeat(5 - puzzle.difficulty);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← 戻る</Text>
        </TouchableOpacity>
        <Text style={styles.title}>今日の詰め陣取り</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.streak}>
          🔥 連続 {playerStore.profile.dailyStreak}日
        </Text>
        <Text style={styles.difficulty}>{stars} (難易度{puzzle.difficulty})</Text>
      </View>

      <View style={styles.gridContainer}>
        <HexGrid
          board={board}
          validPlacements={getValidPlacements()}
          previewCells={null}
          onCellPress={handleCellPress}
          currentPlayer="red"
          hexSize={HEX_SIZE}
        />
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.statusText}>
          残り手数: {'●'.repeat(puzzle.maxMoves - movesUsed)}{'○'.repeat(movesUsed)}
        </Text>
        <Text style={styles.statusText}>
          🔴{board.redCount} vs 🔵{board.blueCount}
        </Text>
      </View>

      {cleared ? (
        <View style={styles.clearBanner}>
          <Text style={styles.clearText}>🎉 クリア！</Text>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.back()}>
            <Text style={styles.actionButtonText}>メニューに戻る</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.rotationRow}>
            <TouchableOpacity
              style={styles.rotateButton}
              onPress={() => setRotation((rotation - 60 + 360) % 360)}
            >
              <Text style={styles.rotateText}>← 回転</Text>
            </TouchableOpacity>
            {!showHint ? (
              <TouchableOpacity onPress={() => setShowHint(true)}>
                <Text style={styles.hintButton}>💡 ヒント</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.hintText}>{puzzle.hint}</Text>
            )}
            <TouchableOpacity
              style={styles.rotateButton}
              onPress={() => setRotation((rotation + 60) % 360)}
            >
              <Text style={styles.rotateText}>回転 →</Text>
            </TouchableOpacity>
          </View>

          <BlockSelector
            blockIds={availableBlocks}
            selectedBlockId={selectedBlock}
            onSelect={(id) => { setSelectedBlock(id); setRotation(0); }}
          />

          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetText}>🔄 リセット</Text>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    color: COLORS.text,
    fontSize: 16,
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  streak: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: '600',
  },
  difficulty: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  gridContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: GRID_PADDING,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statusText: {
    color: COLORS.text,
    fontSize: 14,
  },
  clearBanner: {
    alignItems: 'center',
    padding: 20,
  },
  clearText: {
    color: COLORS.gold,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
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
  hintButton: {
    color: COLORS.gold,
    fontSize: 14,
  },
  hintText: {
    color: COLORS.gold,
    fontSize: 12,
    maxWidth: 150,
    textAlign: 'center',
  },
  resetButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  resetText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});
