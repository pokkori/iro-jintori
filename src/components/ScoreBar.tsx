import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

interface ScoreBarProps {
  redCount: number;
  blueCount: number;
  turnNumber: number;
  elapsedSeconds: number;
}

export default function ScoreBar({ redCount, blueCount, turnNumber, elapsedSeconds }: ScoreBarProps) {
  const total = redCount + blueCount || 1;
  const redPercent = (redCount / total) * 100;

  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.redScore}>🔴 {redCount}</Text>
        <View style={styles.barContainer}>
          <View style={[styles.barRed, { width: `${redPercent}%` }]} />
          <View style={[styles.barBlue, { width: `${100 - redPercent}%` }]} />
        </View>
        <Text style={styles.blueScore}>{blueCount} 🔵</Text>
      </View>
      <View style={styles.bottomRow}>
        <Text style={styles.info}>Turn {turnNumber}</Text>
        <Text style={styles.info}>{timeStr}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.surface,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  redScore: {
    color: COLORS.red.primary,
    fontWeight: 'bold',
    fontSize: 16,
    width: 50,
  },
  blueScore: {
    color: COLORS.blue.primary,
    fontWeight: 'bold',
    fontSize: 16,
    width: 50,
    textAlign: 'right',
  },
  barContainer: {
    flex: 1,
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  barRed: {
    backgroundColor: COLORS.red.primary,
  },
  barBlue: {
    backgroundColor: COLORS.blue.primary,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  info: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
});
