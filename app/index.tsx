import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Polygon } from 'react-native-svg';
import { COLORS } from '../src/constants/colors';
import { AIDifficulty } from '../src/types/game';
import { usePlayerStore } from '../src/store/player-store';

function HexLogo() {
  const size = 20;
  const hexColors = ['#EF4444', '#3B82F6', '#FBBF24', '#10B981', '#8B5CF6', '#EC4899', '#F97316'];

  const hexagons = [
    { q: 0, r: -1 }, { q: 1, r: -1 },
    { q: -1, r: 0 }, { q: 0, r: 0 }, { q: 1, r: 0 },
    { q: 0, r: 1 }, { q: -1, r: 1 },
  ];

  function corners(cx: number, cy: number, s: number): string {
    const pts: string[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 180) * (60 * i);
      pts.push(`${(cx + s * Math.cos(angle)).toFixed(1)},${(cy + s * Math.sin(angle)).toFixed(1)}`);
    }
    return pts.join(' ');
  }

  return (
    <Svg width={120} height={100} viewBox="-50 -50 100 100">
      {hexagons.map((h, i) => {
        const x = size * (3 / 2 * h.q);
        const y = size * (Math.sqrt(3) / 2 * h.q + Math.sqrt(3) * h.r);
        return (
          <Polygon
            key={i}
            points={corners(x, y, size * 0.9)}
            fill={hexColors[i % hexColors.length]}
            stroke="#1A1A2E"
            strokeWidth={2}
          />
        );
      })}
    </Svg>
  );
}

export default function MenuScreen() {
  const router = useRouter();
  const [showDifficulty, setShowDifficulty] = useState(false);
  const profile = usePlayerStore(s => s.profile);

  const difficulties: { key: AIDifficulty; label: string; desc: string }[] = [
    { key: 'easy', label: 'かんたん', desc: 'のんびり楽しむ' },
    { key: 'normal', label: 'ふつう', desc: 'ちょうどいい' },
    { key: 'hard', label: 'むずかしい', desc: '手ごたえあり' },
    { key: 'expert', label: 'エキスパート', desc: '最強AIに挑む' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <HexLogo />
        <Text style={styles.title}>COLOR CONQUEST</Text>
        <Text style={styles.subtitle}>色 陣 取 り</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setShowDifficulty(true)}
        >
          <Text style={styles.menuIcon}>▶</Text>
          <Text style={styles.menuText}>ひとりで遊ぶ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => router.push('/game?mode=pvp')}
        >
          <Text style={styles.menuIcon}>👥</Text>
          <Text style={styles.menuText}>ふたりで遊ぶ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => router.push('/daily')}
        >
          <Text style={styles.menuIcon}>📅</Text>
          <Text style={styles.menuText}>今日の詰め陣取り</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => router.push('/collection')}
        >
          <Text style={styles.menuIcon}>📖</Text>
          <Text style={styles.menuText}>図鑑</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => router.push('/shop')}
        >
          <Text style={styles.menuIcon}>🛒</Text>
          <Text style={styles.menuText}>ショップ</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => router.push('/settings')}>
          <Text style={styles.footerIcon}>⚙️ 設定</Text>
        </TouchableOpacity>
        <View style={styles.statsRow}>
          <Text style={styles.statsText}>🏆 {profile.totalWins}勝</Text>
          <Text style={styles.statsText}>💰 {profile.coins}</Text>
        </View>
      </View>

      <Modal visible={showDifficulty} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>難易度を選択</Text>
            {difficulties.map(d => (
              <TouchableOpacity
                key={d.key}
                style={styles.difficultyButton}
                onPress={() => {
                  setShowDifficulty(false);
                  router.push(`/game?mode=pve&difficulty=${d.key}`);
                }}
              >
                <Text style={styles.difficultyLabel}>{d.label}</Text>
                <Text style={styles.difficultyDesc}>{d.desc}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowDifficulty(false)}
            >
              <Text style={styles.cancelText}>キャンセル</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 3,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.textSecondary,
    letterSpacing: 8,
    marginTop: 4,
  },
  menu: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    gap: 12,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  footerIcon: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statsText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    gap: 8,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  difficultyButton: {
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  difficultyLabel: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  difficultyDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
});
