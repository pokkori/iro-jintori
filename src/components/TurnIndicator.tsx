import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PlayerColor } from '../types/board';
import { GamePhase } from '../types/game';
import { COLORS } from '../constants/colors';

interface TurnIndicatorProps {
  currentPlayer: PlayerColor;
  phase: GamePhase;
}

export default function TurnIndicator({ currentPlayer, phase }: TurnIndicatorProps) {
  let message = '';
  if (phase === 'selecting_block') {
    message = `${currentPlayer === 'red' ? '🔴 赤' : '🔵 青'}のターン - ブロックを選択`;
  } else if (phase === 'placing_block') {
    message = `配置場所をタップ`;
  } else if (phase === 'animating_capture') {
    message = `反転中...`;
  } else if (phase === 'ai_thinking') {
    message = `🤖 AI思考中...`;
  } else if (phase === 'game_over') {
    message = `ゲーム終了`;
  }

  return (
    <View style={[
      styles.container,
      { backgroundColor: currentPlayer === 'red' ? COLORS.red.dark : COLORS.blue.dark }
    ]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
