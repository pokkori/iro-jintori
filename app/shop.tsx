import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../src/constants/colors';
import { usePlayerStore } from '../src/store/player-store';
import { ThemeId } from '../src/types/player';

interface ThemeItem {
  id: ThemeId;
  name: string;
  description: string;
  coinPrice: number;
  emoji: string;
}

const THEMES: ThemeItem[] = [
  { id: 'neon', name: 'ネオンテーマ', description: 'ヘックスが光り輝く', coinPrice: 500, emoji: '🌈' },
  { id: 'pastel', name: 'パステルテーマ', description: '柔らかな色合い', coinPrice: 500, emoji: '🍬' },
  { id: 'earth', name: 'アーステーマ', description: '自然の色合い', coinPrice: 800, emoji: '🍃' },
  { id: 'monochrome', name: 'モノクロテーマ', description: 'シンプルな白黒', coinPrice: 300, emoji: '⬛' },
];

export default function ShopScreen() {
  const router = useRouter();
  const playerStore = usePlayerStore();
  const [tab, setTab] = useState<'theme' | 'currency'>('theme');

  const handleBuyTheme = (theme: ThemeItem) => {
    if (playerStore.profile.selectedTheme === theme.id) {
      Alert.alert('使用中', 'このテーマは既に使用中です。');
      return;
    }
    if (playerStore.spendCoins(theme.coinPrice)) {
      playerStore.setTheme(theme.id);
      Alert.alert('購入完了', `${theme.name}を適用しました！`);
    } else {
      Alert.alert('コイン不足', `${theme.coinPrice}コイン必要です。`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← 戻る</Text>
        </TouchableOpacity>
        <Text style={styles.title}>ショップ</Text>
        <View style={styles.currency}>
          <Text style={styles.currencyText}>💰 {playerStore.profile.coins}</Text>
          <Text style={styles.currencyText}>💎 {playerStore.profile.gems}</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'theme' && styles.tabActive]}
          onPress={() => setTab('theme')}
        >
          <Text style={[styles.tabText, tab === 'theme' && styles.tabTextActive]}>テーマ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'currency' && styles.tabActive]}
          onPress={() => setTab('currency')}
        >
          <Text style={[styles.tabText, tab === 'currency' && styles.tabTextActive]}>通貨</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {tab === 'theme' && THEMES.map(theme => (
          <View key={theme.id} style={styles.itemCard}>
            <Text style={styles.itemEmoji}>{theme.emoji}</Text>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{theme.name}</Text>
              <Text style={styles.itemDesc}>{theme.description}</Text>
              <Text style={styles.itemPrice}>💰 {theme.coinPrice}</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.buyButton,
                playerStore.profile.selectedTheme === theme.id && styles.buyButtonActive,
              ]}
              onPress={() => handleBuyTheme(theme)}
            >
              <Text style={styles.buyButtonText}>
                {playerStore.profile.selectedTheme === theme.id ? '使用中' : '購入する'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        {tab === 'currency' && (
          <View style={styles.comingSoon}>
            <Text style={styles.comingSoonText}>
              課金機能は準備中です
            </Text>
            <Text style={styles.comingSoonDesc}>
              ゲームに勝利してコインを獲得しよう！{'\n'}
              勝利: +50コイン / 敗北: +10コイン
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
  currency: {
    flexDirection: 'row',
    gap: 8,
  },
  currencyText: {
    color: COLORS.gold,
    fontSize: 13,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  tabTextActive: {
    color: COLORS.text,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  itemEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  itemDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  itemPrice: {
    color: COLORS.gold,
    fontSize: 13,
    marginTop: 4,
  },
  buyButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buyButtonActive: {
    backgroundColor: COLORS.surfaceLight,
  },
  buyButtonText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  comingSoon: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  comingSoonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginBottom: 8,
  },
  comingSoonDesc: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});
