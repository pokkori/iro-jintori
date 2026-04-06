import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { ALL_BLOCKS } from '../src/constants/blocks';
import { COLORS } from '../src/constants/colors';
import { usePlayerStore } from '../src/store/player-store';
import { BlockShape } from '../src/types/block';

function BlockCard({ block, unlocked }: { block: BlockShape; unlocked: boolean }) {
  const miniSize = 10;
  const svgSize = 80;
  const center = svgSize / 2;

  function corners(cx: number, cy: number, s: number): string {
    const pts: string[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 180) * (60 * i);
      pts.push(`${(cx + s * Math.cos(angle)).toFixed(1)},${(cy + s * Math.sin(angle)).toFixed(1)}`);
    }
    return pts.join(' ');
  }

  const rarityColors = {
    common: '#9E9E9E',
    rare: '#2196F3',
    epic: '#9C27B0',
    legendary: '#FFD700',
  };

  return (
    <View style={[styles.card, { borderColor: unlocked ? rarityColors[block.rarity] : '#333' }]}>
      <Svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
        {block.cells.map((cell, i) => {
          const x = center + miniSize * (3 / 2 * cell.q);
          const y = center + miniSize * (Math.sqrt(3) / 2 * cell.q + Math.sqrt(3) * cell.r);
          return (
            <Polygon
              key={i}
              points={corners(x, y, miniSize * 0.85)}
              fill={unlocked ? block.color : '#333'}
              stroke={unlocked ? '#FFF' : '#555'}
              strokeWidth={1}
            />
          );
        })}
      </Svg>
      <Text style={[styles.cardName, !unlocked && styles.cardLocked]}>
        {unlocked ? block.name : '---'}
      </Text>
      <Text style={styles.cardSize}>{block.size}マス</Text>
      {!unlocked && (
        <Text style={styles.unlockReq}>{block.unlockWins}勝で解放</Text>
      )}
      {unlocked && (
        <Text style={styles.description} numberOfLines={2}>{block.description}</Text>
      )}
    </View>
  );
}

export default function CollectionScreen() {
  const router = useRouter();
  const profile = usePlayerStore(s => s.profile);
  const unlockedCount = profile.unlockedBlocks.length;
  const totalCount = ALL_BLOCKS.length;
  const percent = Math.floor((unlockedCount / totalCount) * 100);

  const initialBlocks = ALL_BLOCKS.filter(b => b.unlockWins === 0);
  const tier1Blocks = ALL_BLOCKS.filter(b => b.unlockWins > 0 && b.unlockWins <= 12);
  const tier2Blocks = ALL_BLOCKS.filter(b => b.unlockWins > 12);

  return (
    <LinearGradient colors={['#0F0F1A', '#1A0A2E', '#2D1B4E']} style={{ flex: 1 }}>
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}
          accessibilityLabel="戻る"
          accessibilityRole="button"
        >
          <Text style={styles.backButton}>← 戻る</Text>
        </Pressable>
        <Text style={styles.title}>ブロック図鑑</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          解放済み: {unlockedCount}/{totalCount}
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${percent}%` }]} />
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        <Text style={styles.sectionTitle}>初期ブロック</Text>
        <View style={styles.grid}>
          {initialBlocks.map(b => (
            <BlockCard
              key={b.id}
              block={b}
              unlocked={profile.unlockedBlocks.includes(b.id)}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Tier1（5勝~で解放）</Text>
        <View style={styles.grid}>
          {tier1Blocks.map(b => (
            <BlockCard
              key={b.id}
              block={b}
              unlocked={profile.unlockedBlocks.includes(b.id)}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Tier2（15勝~で解放）</Text>
        <View style={styles.grid}>
          {tier2Blocks.map(b => (
            <BlockCard
              key={b.id}
              block={b}
              unlocked={profile.unlockedBlocks.includes(b.id)}
            />
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
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
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  progressText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 3,
  },
  progressFill: {
    height: 6,
    backgroundColor: COLORS.gold,
    borderRadius: 3,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  card: {
    width: '30%',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    borderWidth: 2,
  },
  cardName: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  cardLocked: {
    color: COLORS.textSecondary,
  },
  cardSize: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  unlockReq: {
    color: COLORS.gold,
    fontSize: 9,
    marginTop: 2,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: 9,
    textAlign: 'center',
    marginTop: 2,
  },
});
