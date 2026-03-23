import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Polygon, Circle as SvgCircle } from 'react-native-svg';
import { COLORS } from '../src/constants/colors';
import { usePlayerStore } from '../src/store/player-store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TutorialStep {
  title: string;
  description: string;
  emoji: string;
}

const STEPS: TutorialStep[] = [
  {
    title: '陣地を広げよう',
    description: '自陣（赤）の隣にブロックを置いて\n陣地を広げよう！',
    emoji: '🔴',
  },
  {
    title: 'いろんなブロック',
    description: 'L字や直線など、いろんな形のブロックが\n使えるよ！回転もできる！',
    emoji: '🧩',
  },
  {
    title: '挟んで反転！',
    description: '相手の色を自分の色で挟むと\nリバーシのように反転する！',
    emoji: '🔄',
  },
  {
    title: '勝てばブロック解放！',
    description: '勝利するとコインとブロックがもらえる！\n全15種のブロックをコンプリートしよう！',
    emoji: '🏆',
  },
];

function TutorialIllustration({ step }: { step: number }) {
  const size = 20;
  const svgSize = 200;
  const center = svgSize / 2;

  function corners(cx: number, cy: number, s: number): string {
    const pts: string[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 180) * (60 * i);
      pts.push(`${(cx + s * Math.cos(angle)).toFixed(1)},${(cy + s * Math.sin(angle)).toFixed(1)}`);
    }
    return pts.join(' ');
  }

  function hexPos(q: number, r: number) {
    return {
      x: center + size * (3 / 2 * q),
      y: center + size * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r),
    };
  }

  const illustrations: Record<number, { cells: { q: number; r: number; color: string }[] }> = {
    0: {
      cells: [
        { q: -1, r: 0, color: COLORS.red.primary },
        { q: 0, r: 0, color: '#2D2D44' },
        { q: 1, r: 0, color: '#2D2D44' },
        { q: 0, r: -1, color: '#2D2D44' },
        { q: 0, r: 1, color: COLORS.red.light }, // highlight
        { q: -1, r: 1, color: '#2D2D44' },
        { q: 1, r: -1, color: '#2D2D44' },
      ],
    },
    1: {
      cells: [
        { q: -1, r: 0, color: COLORS.red.primary },
        { q: 0, r: 0, color: COLORS.red.primary },
        { q: 0, r: 1, color: COLORS.red.light },
        { q: 1, r: -1, color: COLORS.blue.primary },
        { q: 0, r: -1, color: '#2D2D44' },
        { q: 1, r: 0, color: '#2D2D44' },
        { q: -1, r: 1, color: '#2D2D44' },
      ],
    },
    2: {
      cells: [
        { q: -1, r: 0, color: COLORS.red.primary },
        { q: 0, r: 0, color: COLORS.blue.primary },
        { q: 1, r: 0, color: COLORS.red.primary },
        { q: 0, r: -1, color: '#2D2D44' },
        { q: 0, r: 1, color: '#2D2D44' },
        { q: -1, r: 1, color: '#2D2D44' },
        { q: 1, r: -1, color: '#2D2D44' },
      ],
    },
    3: {
      cells: [
        { q: -1, r: 0, color: COLORS.gold },
        { q: 0, r: 0, color: COLORS.gold },
        { q: 1, r: 0, color: COLORS.gold },
        { q: 0, r: -1, color: COLORS.red.primary },
        { q: 0, r: 1, color: COLORS.red.primary },
        { q: -1, r: 1, color: COLORS.red.primary },
        { q: 1, r: -1, color: COLORS.red.primary },
      ],
    },
  };

  const data = illustrations[step] || illustrations[0];

  return (
    <View style={tutStyles.illustration}>
      <Svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
        {data.cells.map((cell, i) => {
          const pos = hexPos(cell.q, cell.r);
          return (
            <Polygon
              key={i}
              points={corners(pos.x, pos.y, size * 0.9)}
              fill={cell.color}
              stroke="#3D3D5C"
              strokeWidth={1.5}
            />
          );
        })}
      </Svg>
    </View>
  );
}

export default function TutorialScreen() {
  const router = useRouter();
  const playerStore = usePlayerStore();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete tutorial
      const profile = { ...playerStore.profile, tutorialCompleted: true };
      playerStore.saveProfile();
      router.replace('/');
    }
  };

  const handleSkip = () => {
    router.replace('/');
  };

  const step = STEPS[currentStep];

  return (
    <SafeAreaView style={tutStyles.container}>
      <View style={tutStyles.skipRow}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={tutStyles.skipText}>スキップ</Text>
        </TouchableOpacity>
      </View>

      <View style={tutStyles.content}>
        <Text style={tutStyles.emoji}>{step.emoji}</Text>
        <TutorialIllustration step={currentStep} />
        <Text style={tutStyles.title}>{step.title}</Text>
        <Text style={tutStyles.description}>{step.description}</Text>
      </View>

      <View style={tutStyles.footer}>
        <View style={tutStyles.dots}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[tutStyles.dot, i === currentStep && tutStyles.dotActive]}
            />
          ))}
        </View>

        <TouchableOpacity style={tutStyles.nextButton} onPress={handleNext}>
          <Text style={tutStyles.nextText}>
            {currentStep === STEPS.length - 1 ? 'はじめる！' : '次へ'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const tutStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  skipRow: {
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  illustration: {
    marginBottom: 24,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 32,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.surfaceLight,
  },
  dotActive: {
    backgroundColor: COLORS.accent,
    width: 20,
  },
  nextButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  nextText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
});
