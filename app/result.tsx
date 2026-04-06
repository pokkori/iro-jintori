import React, { useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Share, Platform, ScrollView, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../src/constants/colors';
import { formatTime } from '../src/utils/date';
import { useRewardedAd } from '../src/hooks/useAdMob';
import { useGameStore } from '../src/store/game-store';
import { usePlayerStore } from '../src/store/player-store';
import NearMissBanner from '../src/components/NearMissBanner';

/* ─── パラメータの型 ─── */
interface ResultParams {
  winner: string;        // 'red' | 'blue' | 'draw'
  redCount: string;
  blueCount: string;
  totalTurns: string;
  biggestSwing: string;
  hadComeback: string;   // 'true' | 'false'
  durationSeconds: string;
  mode: string;          // 'pve' | 'pvp' | 'daily'
  difficulty: string;    // 'easy' | 'normal' | 'hard' | 'expert'
}

/* ─── ステップカウントアップテキスト（Reanimated v4） ─── */
function AnimatedCountText({ target, delayMs }: { target: number; delayMs: number }) {
  const animValue = useSharedValue(0);
  const [displayNum, setDisplayNum] = React.useState(0);

  useEffect(() => {
    const startTime = Date.now() + delayMs;
    const duration = 1200;
    let raf: number;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const t = Math.min(elapsed / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayNum(Math.round(eased * target));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, delayMs]);

  // スケールアニメーション（Reanimated v4）
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delayMs, withTiming(1, { duration: 300 }));
    scale.value = withDelay(
      delayMs,
      withSequence(
        withSpring(1.1, { damping: 6, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 150 }),
      ),
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.Text style={[styles.scoreNumber, animStyle]}>
      {displayNum}
    </Animated.Text>
  );
}

/* ─── 占領率バー ─── */
function OccupancyBar({ red, blue }: { red: number; blue: number }) {
  const total = red + blue || 1;
  const redPct = (red / total) * 100;
  const bluePct = (blue / total) * 100;

  const barWidth = useSharedValue(0);
  useEffect(() => {
    barWidth.value = withDelay(400, withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) }));
  }, []);

  const redBarStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value * redPct}%` as any,
  }));
  const blueBarStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value * bluePct}%` as any,
  }));

  return (
    <View style={styles.occupancyContainer}>
      <Text style={styles.occupancyLabel}>占領率</Text>
      <View style={styles.occupancyBarBg}>
        <Animated.View style={[styles.occupancyBarRed, redBarStyle]} />
        <Animated.View style={[styles.occupancyBarBlue, blueBarStyle]} />
      </View>
      <View style={styles.occupancyNumbers}>
        <Text style={[styles.occupancyPct, { color: COLORS.red.primary }]}>
          {Math.round(redPct)}%
        </Text>
        <Text style={[styles.occupancyPct, { color: COLORS.blue.primary }]}>
          {Math.round(bluePct)}%
        </Text>
      </View>
    </View>
  );
}

/* ─── メイン画面 ─── */
export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<ResultParams>();
  const { isLoaded: adLoaded, showAd } = useRewardedAd();
  const gameStore = useGameStore();
  const playerStore = usePlayerStore();

  // パラメータのパース
  const winner = params.winner || 'draw';
  const redCount = parseInt(params.redCount || '0', 10);
  const blueCount = parseInt(params.blueCount || '0', 10);
  const totalTurns = parseInt(params.totalTurns || '0', 10);
  const biggestSwing = parseInt(params.biggestSwing || '0', 10);
  const hadComeback = params.hadComeback === 'true';
  const durationSeconds = parseInt(params.durationSeconds || '0', 10);
  const mode = params.mode || 'pve';
  const difficulty = params.difficulty || 'normal';

  const playerWon = winner === 'red';
  const isDraw = winner === 'draw';
  const titleText = isDraw ? '引き分け' : playerWon ? '勝利！' : '敗北...';
  const titleColor = isDraw ? COLORS.textSecondary : playerWon ? COLORS.gold : COLORS.red.primary;

  // プレイヤーのスコア（赤=プレイヤー想定）
  const playerScore = redCount;
  // ハイスコアは totalWins ベース（簡易）- 占領数をスコアとして使用
  const highScore = useMemo(() => {
    const total = playerStore.profile.totalWins * 15; // 仮のハイスコア計算
    return Math.max(total, playerScore);
  }, [playerStore.profile.totalWins, playerScore]);

  // タイトルのアニメーション
  const titleScale = useSharedValue(0);
  const titleOpacity = useSharedValue(0);

  useEffect(() => {
    titleOpacity.value = withTiming(1, { duration: 400 });
    titleScale.value = withSequence(
      withSpring(1.2, { damping: 6, stiffness: 200 }),
      withSpring(1, { damping: 10, stiffness: 150 }),
    );
  }, []);

  const titleAnimStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ scale: titleScale.value }],
  }));

  // カードのフェードイン
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(30);

  useEffect(() => {
    cardOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    cardTranslateY.value = withDelay(200, withSpring(0, { damping: 12, stiffness: 100 }));
  }, []);

  const cardAnimStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardTranslateY.value }],
  }));

  // ボタン群のstaggerアニメーション
  const btn1Opacity = useSharedValue(0);
  const btn2Opacity = useSharedValue(0);
  const btn3Opacity = useSharedValue(0);
  const btn4Opacity = useSharedValue(0);

  useEffect(() => {
    btn1Opacity.value = withDelay(600, withTiming(1, { duration: 300 }));
    btn2Opacity.value = withDelay(750, withTiming(1, { duration: 300 }));
    btn3Opacity.value = withDelay(900, withTiming(1, { duration: 300 }));
    btn4Opacity.value = withDelay(1050, withTiming(1, { duration: 300 }));
  }, []);

  const btn1Style = useAnimatedStyle(() => ({ opacity: btn1Opacity.value }));
  const btn2Style = useAnimatedStyle(() => ({ opacity: btn2Opacity.value }));
  const btn3Style = useAnimatedStyle(() => ({ opacity: btn3Opacity.value }));
  const btn4Style = useAnimatedStyle(() => ({ opacity: btn4Opacity.value }));

  // グロー脈動
  const glowPulse = useSharedValue(0);
  useEffect(() => {
    glowPulse.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, []);
  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0.4 + glowPulse.value * 0.4,
    shadowRadius: 12 + glowPulse.value * 8,
  }));

  /* ─── ハンドラ ─── */
  const handlePlayAgain = useCallback(() => {
    gameStore.startGame(mode as any, mode === 'pve' ? (difficulty as any) : null);
    router.replace({ pathname: '/game', params: { mode, difficulty } });
  }, [mode, difficulty]);

  const handleContinueWithAd = useCallback(() => {
    showAd(() => {
      // リワード付与後にもう一回プレイ
      playerStore.addCoins(30);
      handlePlayAgain();
    });
  }, [showAd, handlePlayAgain]);

  const handleShare = useCallback(async () => {
    const total = redCount + blueCount;
    const pct = total > 0 ? Math.round((redCount / total) * 100) : 0;
    const resultLabel = playerWon ? '勝利！' : isDraw ? '引き分け' : '惜敗';
    const message = `${resultLabel} 色陣取り ${titleText}！\n占領率: ${pct}% (${redCount}/${total}マス)\nターン数: ${totalTurns} | 所要時間: ${formatTime(durationSeconds)}\n\n#色陣取り #ボードゲーム`;

    if (Platform.OS === 'web') {
      // Web Share API or Twitter intent
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
      if (typeof window !== 'undefined') {
        window.open(twitterUrl, '_blank');
      }
    } else {
      try {
        await Share.share({ message });
      } catch {
        // Share cancelled
      }
    }
  }, [redCount, blueCount, totalTurns, durationSeconds, titleText, playerWon, isDraw]);

  const handleGoHome = useCallback(() => {
    gameStore.resetGame();
    router.replace('/');
  }, []);

  return (
    <LinearGradient colors={['#0F0F1A', '#1A0A2E', '#2D1B4E']} style={{ flex: 1 }}>
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* タイトル */}
        <Animated.Text
          style={[styles.titleText, { color: titleColor }, titleAnimStyle]}
          accessibilityRole="header"
          accessibilityLabel={`結果: ${titleText}`}
        >
          {titleText}
        </Animated.Text>

        {hadComeback && (
          <Text style={styles.comebackBadge} accessibilityLabel="逆転勝利">
            逆転勝利！
          </Text>
        )}

        {/* スコア表示（カウントアップ） */}
        <View style={styles.scoreSection}>
          <View style={styles.scoreColumn}>
            <View style={[styles.colorDot, { backgroundColor: COLORS.red.primary }]} />
            <Text style={styles.scoreLabel}>あなた</Text>
            <AnimatedCountText target={redCount} delayMs={300} />
            <Text style={styles.scoreUnit}>マス</Text>
          </View>

          <Text style={styles.vsText}>VS</Text>

          <View style={styles.scoreColumn}>
            <View style={[styles.colorDot, { backgroundColor: COLORS.blue.primary }]} />
            <Text style={styles.scoreLabel}>相手</Text>
            <AnimatedCountText target={blueCount} delayMs={500} />
            <Text style={styles.scoreUnit}>マス</Text>
          </View>
        </View>

        {/* 統計カード（グラスモーフィズム） */}
        <Animated.View style={[styles.statsCard, cardAnimStyle]}>
          <OccupancyBar red={redCount} blue={blueCount} />

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalTurns}</Text>
              <Text style={styles.statLabel}>ターン数</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatTime(durationSeconds)}</Text>
              <Text style={styles.statLabel}>所要時間</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{biggestSwing}</Text>
              <Text style={styles.statLabel}>最大逆転</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{difficulty}</Text>
              <Text style={styles.statLabel}>難易度</Text>
            </View>
          </View>
        </Animated.View>

        {/* ニアミスバナー */}
        <NearMissBanner score={playerScore} highScore={highScore} delay={1200} />

        {/* ボタン群 */}
        <View style={styles.buttonsContainer}>
          {/* 1. もう一回プレイ - 最上位CTA */}
          <Animated.View style={btn1Style}>
            <Pressable
              style={({ pressed }) => [
                styles.btnPlayAgain,
                pressed && styles.btnPressed,
                glowStyle as any,
              ]}
              onPress={handlePlayAgain}
              accessibilityLabel="もう一回プレイ"
              accessibilityRole="button"
            >
              <Text style={styles.btnPlayAgainText}>もう一回プレイ</Text>
            </Pressable>
          </Animated.View>

          {/* 2. 広告を見てコンティニュー */}
          <Animated.View style={btn2Style}>
            <Pressable
              style={({ pressed }) => [
                styles.btnAdContinue,
                pressed && styles.btnPressed,
              ]}
              onPress={handleContinueWithAd}
              accessibilityLabel="広告を見てコイン30枚獲得してもう一回プレイ"
              accessibilityRole="button"
            >
              <Text style={styles.btnAdContinueText}>
                広告を見て +30コイン
              </Text>
            </Pressable>
          </Animated.View>

          {/* 3. スコアをシェア */}
          <Animated.View style={btn3Style}>
            <Pressable
              style={({ pressed }) => [
                styles.btnShare,
                pressed && styles.btnPressed,
              ]}
              onPress={handleShare}
              accessibilityLabel="スコアをシェアする"
              accessibilityRole="button"
            >
              <Text style={styles.btnShareText}>スコアをシェア</Text>
            </Pressable>
          </Animated.View>

          {/* 4. メニューに戻る - 最下位サブボタン */}
          <Animated.View style={btn4Style}>
            <Pressable
              style={({ pressed }) => [
                styles.btnGoHome,
                pressed && styles.btnPressed,
              ]}
              onPress={handleGoHome}
              accessibilityLabel="メニューに戻る"
              accessibilityRole="button"
            >
              <Text style={styles.btnGoHomeText}>メニューに戻る</Text>
            </Pressable>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },

  /* タイトル */
  titleText: {
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: '#E94560',
    textShadowRadius: 16,
    textShadowOffset: { width: 0, height: 0 },
  },
  comebackBadge: {
    color: COLORS.gold,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(255,215,0,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },

  /* スコアセクション */
  scoreSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginTop: 16,
    marginBottom: 20,
  },
  scoreColumn: {
    alignItems: 'center',
    gap: 4,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  scoreLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  scoreNumber: {
    color: COLORS.text,
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: 1,
  },
  scoreUnit: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: -2,
  },
  vsText: {
    color: COLORS.textSecondary,
    fontSize: 20,
    fontWeight: '700',
    opacity: 0.5,
    marginTop: 20,
  },

  /* 統計カード（グラスモーフィズム） */
  statsCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 20,
    marginBottom: 12,
    // グラスモーフィズムshadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },

  /* 占領率バー */
  occupancyContainer: {
    marginBottom: 16,
  },
  occupancyLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 6,
    fontWeight: '600',
  },
  occupancyBarBg: {
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  occupancyBarRed: {
    height: '100%',
    backgroundColor: COLORS.red.primary,
    borderTopLeftRadius: 7,
    borderBottomLeftRadius: 7,
  },
  occupancyBarBlue: {
    height: '100%',
    backgroundColor: COLORS.blue.primary,
    borderTopRightRadius: 7,
    borderBottomRightRadius: 7,
  },
  occupancyNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  occupancyPct: {
    fontSize: 13,
    fontWeight: '700',
  },

  /* 統計グリッド */
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 10,
  },
  statValue: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },

  /* ボタン群 */
  buttonsContainer: {
    width: '100%',
    gap: 12,
    marginTop: 8,
  },
  btnPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },

  /* もう一回プレイ（グラデ風 + グロー） */
  btnPlayAgain: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    // グラデーション近似: 中間色 + shadow
    backgroundColor: '#F05E3E',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  btnPlayAgainText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },

  /* 広告コンティニュー */
  btnAdContinue: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  btnAdContinueText: {
    color: COLORS.gold,
    fontSize: 16,
    fontWeight: '700',
  },

  /* シェア */
  btnShare: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  btnShareText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },

  /* メニューに戻る（グラスモーフィズム） */
  btnGoHome: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  btnGoHomeText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
});
