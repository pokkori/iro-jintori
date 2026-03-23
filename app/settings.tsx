import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../src/constants/colors';
import { useSettingsStore } from '../src/store/settings-store';
import { usePlayerStore } from '../src/store/player-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const router = useRouter();
  const settings = useSettingsStore();
  const playerStore = usePlayerStore();

  const handleReset = () => {
    Alert.alert(
      'データリセット',
      '全てのデータが初期化されます。よろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'リセット',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            await playerStore.loadProfile();
            await settings.loadSettings();
            Alert.alert('完了', 'データをリセットしました。');
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← 戻る</Text>
        </TouchableOpacity>
        <Text style={styles.title}>設定</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>サウンド</Text>

        <View style={styles.row}>
          <Text style={styles.label}>BGM音量</Text>
          <Text style={styles.value}>{Math.round(settings.bgmVolume * 100)}%</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>SE音量</Text>
          <Text style={styles.value}>{Math.round(settings.seVolume * 100)}%</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>操作</Text>

        <View style={styles.row}>
          <Text style={styles.label}>ハプティクス（振動）</Text>
          <Switch
            value={settings.hapticsEnabled}
            onValueChange={() => settings.toggleHaptics()}
            trackColor={{ false: '#333', true: COLORS.accent }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>通知</Text>

        <View style={styles.row}>
          <Text style={styles.label}>デイリーリマインダー</Text>
          <Switch
            value={settings.notificationEnabled}
            onValueChange={() => settings.toggleNotification()}
            trackColor={{ false: '#333', true: COLORS.accent }}
          />
        </View>

        {settings.notificationEnabled && (
          <View style={styles.row}>
            <Text style={styles.label}>通知時刻</Text>
            <Text style={styles.value}>
              {String(settings.notificationHour).padStart(2, '0')}:
              {String(settings.notificationMinute).padStart(2, '0')}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>プロフィール</Text>

        <View style={styles.row}>
          <Text style={styles.label}>勝利数</Text>
          <Text style={styles.value}>{playerStore.profile.totalWins}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>敗北数</Text>
          <Text style={styles.value}>{playerStore.profile.totalLosses}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>引き分け</Text>
          <Text style={styles.value}>{playerStore.profile.totalDraws}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>デイリー連続</Text>
          <Text style={styles.value}>{playerStore.profile.dailyStreak}日</Text>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetText}>データリセット</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>色陣取り v1.0.0</Text>
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
  section: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 4,
  },
  label: {
    color: COLORS.text,
    fontSize: 14,
  },
  value: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  resetButton: {
    backgroundColor: '#4A1A1A',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetText: {
    color: '#FF6666',
    fontSize: 14,
    fontWeight: '600',
  },
  version: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
});
