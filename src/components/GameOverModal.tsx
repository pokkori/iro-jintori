import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { GameResult } from '../types/game';
import { PlayerColor } from '../types/board';
import { COLORS } from '../constants/colors';
import { formatTime } from '../utils/date';

interface GameOverModalProps {
  visible: boolean;
  result: GameResult | null;
  playerColor: PlayerColor;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export default function GameOverModal({
  visible, result, playerColor, onPlayAgain, onGoHome,
}: GameOverModalProps) {
  if (!result) return null;

  const won = result.winner === playerColor;
  const isDraw = result.winner === null;
  const title = isDraw ? '引き分け' : won ? '勝利！' : '敗北...';
  const emoji = isDraw ? '🤝' : won ? '🎉' : '😤';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={styles.title}>{title}</Text>

          <View style={styles.stats}>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: COLORS.red.primary }]}>🔴 赤</Text>
              <Text style={styles.statValue}>{result.redCount}マス</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: COLORS.blue.primary }]}>🔵 青</Text>
              <Text style={styles.statValue}>{result.blueCount}マス</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>最大逆転</Text>
              <Text style={styles.statValue}>{result.biggestSwing}マス</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>所要時間</Text>
              <Text style={styles.statValue}>{formatTime(result.durationSeconds)}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>ターン数</Text>
              <Text style={styles.statValue}>{result.totalTurns}</Text>
            </View>
            {result.hadComeback && (
              <Text style={styles.comeback}>🔥 逆転勝利！</Text>
            )}
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.buttonPrimary} onPress={onPlayAgain}>
              <Text style={styles.buttonText}>もう1回</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonSecondary} onPress={onGoHome}>
              <Text style={styles.buttonText}>メニューに戻る</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    width: '85%',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  stats: {
    width: '100%',
    marginBottom: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  statValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  comeback: {
    color: COLORS.gold,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  buttons: {
    width: '100%',
    gap: 8,
  },
  buttonPrimary: {
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
